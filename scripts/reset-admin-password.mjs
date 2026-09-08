import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const SAFE_DEFAULT_EMAIL = "admin-demo@icesales.com";
const DEFAULT_LOGIN_URL = "https://sandbox.icesales.com/admin/login";

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  for (const rawLine of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim().replace(/^export\s+/, "");
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function usage() {
  return [
    "Reset an existing ICE administrator password without deleting any users.",
    "",
    "Usage:",
    "  npm run admin:reset-password -- --email admin-demo@icesales.com",
    "",
    "Options:",
    "  --email <address>     Required. Only the demo admin is allowed by default.",
    "  --password <value>    Optional. Omit to generate a strong temporary password.",
    "  --help                Show this help.",
  ].join("\n");
}

function parseArgs(argv) {
  const result = {
    email: "",
    password: "",
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      result.help = true;
      continue;
    }
    const equalsIndex = arg.indexOf("=");
    const name = equalsIndex === -1 ? arg : arg.slice(0, equalsIndex);
    const inlineValue = equalsIndex === -1 ? null : arg.slice(equalsIndex + 1);

    if (name !== "--email" && name !== "--password") {
      throw new Error(`Unknown option: ${name}`);
    }

    const value = inlineValue ?? argv[index + 1];
    if (!value || (inlineValue === null && value.startsWith("--"))) {
      throw new Error(`${name} requires a value.`);
    }
    if (inlineValue === null) index += 1;

    const property = name === "--email" ? "email" : "password";
    if (result[property]) throw new Error(`${name} may only be provided once.`);
    result[property] = value;
  }

  return result;
}

function validatePassword(password) {
  if (password.length < 16) {
    throw new Error("The password must contain at least 16 characters.");
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw new Error("The password must include lowercase, uppercase, numeric, and symbol characters.");
  }
}

function generateTemporaryPassword() {
  return `${randomBytes(18).toString("base64url")}-Aa9!`;
}

async function findUserByEmail(admin, email) {
  const perPage = 1000;

  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`Could not list Supabase Auth users: ${error.message}`);

    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match) return match;
    if (data.users.length < perPage) return null;
  }

  throw new Error("User lookup exceeded 100 pages; no account was changed.");
}

async function promoteAdminProfile(admin, user, email) {
  const { data: previous, error: readError } = await admin
    .from("admin_profiles")
    .select("id, display_name, email, role, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) throw new Error(`Could not read the admin profile: ${readError.message}`);

  if (previous?.role === "super_admin" && previous.email.toLowerCase() === email) {
    return { changed: false, previous };
  }

  const now = new Date().toISOString();
  if (previous) {
    const { error } = await admin
      .from("admin_profiles")
      .update({ role: "super_admin", email, updated_at: now })
      .eq("id", user.id);
    if (error) throw new Error(`Could not promote the admin profile: ${error.message}`);
  } else {
    const displayName =
      (typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name.trim()) ||
      email.split("@")[0];
    const { error } = await admin.from("admin_profiles").insert({
      id: user.id,
      display_name: displayName,
      email,
      role: "super_admin",
      created_at: now,
      updated_at: now,
    });
    if (error) throw new Error(`Could not create the admin profile: ${error.message}`);
  }

  return { changed: true, previous };
}

async function rollbackAdminProfile(admin, userId, profileState) {
  if (!profileState.changed) return null;

  if (!profileState.previous) {
    const { error } = await admin.from("admin_profiles").delete().eq("id", userId);
    return error;
  }

  const { error } = await admin
    .from("admin_profiles")
    .update({
      display_name: profileState.previous.display_name,
      email: profileState.previous.email,
      role: profileState.previous.role,
      updated_at: profileState.previous.updated_at,
    })
    .eq("id", userId);
  return error;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const email = options.email.trim().toLowerCase();
  if (!email) throw new Error("--email is required.\n\n" + usage());
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("--email must be a valid email address.");
  if (email !== SAFE_DEFAULT_EMAIL) {
    throw new Error(
      `Refusing to reset ${email}. This utility is intentionally limited to ${SAFE_DEFAULT_EMAIL}; manage personal administrators in Admin Center instead.`,
    );
  }

  const password = options.password || generateTemporaryPassword();
  validatePassword(password);

  loadLocalEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are required.",
    );
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const user = await findUserByEmail(admin, email);
  if (!user) throw new Error(`No Supabase Auth user exists for ${email}; no account was changed.`);

  const profileState = await promoteAdminProfile(admin, user, email);
  const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
  });

  if (updateError || !updated.user) {
    const rollbackError = await rollbackAdminProfile(admin, user.id, profileState);
    const rollbackNote = rollbackError ? ` Profile rollback also failed: ${rollbackError.message}` : "";
    throw new Error(`Password reset failed: ${updateError?.message || "Supabase returned no user."}${rollbackNote}`);
  }

  const verifier = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });

  let verificationError = null;
  try {
    const { data: verified, error } = await verifier.auth.signInWithPassword({ email, password });
    if (error || verified.user?.id !== user.id) {
      verificationError = error?.message || "Supabase returned a different user.";
    } else {
      const { data: profile, error: profileError } = await admin
        .from("admin_profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profileError || profile?.role !== "super_admin") {
        verificationError = profileError?.message || "The verified user is not a super_admin.";
      }
    }
  } finally {
    const { error: signOutError } = await verifier.auth.signOut({ scope: "local" });
    if (!verificationError && signOutError) verificationError = `Verification sign-out failed: ${signOutError.message}`;
  }

  if (verificationError) {
    throw new Error(
      `The password was updated, but verification did not complete (${verificationError}). Run the reset command again to issue a new temporary password.`,
    );
  }

  const loginUrl = process.env.ADMIN_LOGIN_URL || DEFAULT_LOGIN_URL;
  console.log(
    [
      "Admin password reset and sign-in verification succeeded.",
      `Login URL: ${loginUrl}`,
      `Email: ${email}`,
      `Temporary password: ${password}`,
      "Change the temporary password immediately in Admin Center > Settings.",
    ].join("\n"),
  );
}

main().catch((error) => {
  console.error(`Admin reset failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
