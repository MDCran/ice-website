"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Check,
  Image01,
  Key01,
  Lock01,
  Save01,
  Shield01,
  User01,
} from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { PinInput } from "@/components/base/input/pin-input";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import MediaBrowserModal from "@/components/admin/MediaBrowserModal";

type TotpSetup = {
  secret: string;
  qrDataUrl: string;
  otpauthUrl: string;
};

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // 2FA
  const [totpSetup, setTotpSetup] = useState<TotpSetup | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [totpBusy, setTotpBusy] = useState(false);
  const [disableCode, setDisableCode] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("admin_profiles")
        .select("display_name, email, avatar_url, totp_enabled")
        .eq("id", user.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name ?? "");
        setEmail(profile.email ?? "");
        setAvatarUrl(profile.avatar_url ?? "");
        setTotpEnabled(Boolean(profile.totp_enabled));
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("admin_profiles")
      .update({
        display_name: displayName.trim(),
        email: email.trim(),
        avatar_url: avatarUrl.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      flash("Profile saved.");
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    setPasswordSaving(true);
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      setPasswordSaving(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      setPasswordSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      setError("Not authenticated");
      setPasswordSaving(false);
      return;
    }

    // Re-authenticate with current password before updating
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (reauthError) {
      setError("Current password is incorrect.");
      setPasswordSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      flash("Password updated.");
    }
    setPasswordSaving(false);
  };

  const startTotpSetup = async () => {
    setTotpBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/2fa/setup", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not start 2FA setup.");
        setTotpBusy(false);
        return;
      }
      setTotpSetup({
        secret: data.secret,
        qrDataUrl: data.qrDataUrl,
        otpauthUrl: data.otpauthUrl,
      });
      setTotpCode("");
    } catch {
      setError("Could not start 2FA setup.");
    }
    setTotpBusy(false);
  };

  const enableTotp = async () => {
    if (!totpSetup) return;
    setTotpBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: totpSetup.secret, code: totpCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not enable 2FA.");
        setTotpBusy(false);
        return;
      }
      setTotpEnabled(true);
      setTotpSetup(null);
      setTotpCode("");
      flash("Two-factor authentication enabled.");
    } catch {
      setError("Could not enable 2FA.");
    }
    setTotpBusy(false);
  };

  const disableTotp = async () => {
    setTotpBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: disableCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not disable 2FA.");
        setTotpBusy(false);
        return;
      }
      setTotpEnabled(false);
      setDisableCode("");
      flash("Two-factor authentication disabled.");
    } catch {
      setError("Could not disable 2FA.");
    }
    setTotpBusy(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingIndicator type="line-spinner" size="md" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-3">
        <FeaturedIcon color="brand" theme="modern" size="md" icon={User01} />
        <div>
          <h1 className="text-display-xs font-semibold text-primary">Settings</h1>
          <p className="text-sm text-tertiary">Profile, password, and security</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-utility-red-50 p-3 text-sm text-utility-red-700 ring-1 ring-utility-red-200 ring-inset">
          <AlertCircle className="size-4 shrink-0 text-utility-red-500" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-utility-green-50 p-3 text-sm text-utility-green-700 ring-1 ring-utility-green-200 ring-inset">
          <Check className="size-4 shrink-0 text-utility-green-500" />
          {success}
        </div>
      )}

      {/* Profile */}
      <section className="space-y-6 rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <div>
          <h2 className="text-md font-semibold text-primary">Profile</h2>
          <p className="text-sm text-tertiary">
            Your display name appears in the admin navbar.
          </p>
        </div>

        <Input
          label="Display Name"
          placeholder="Your name"
          value={displayName}
          onChange={(value) => setDisplayName(value)}
        />

        <Input
          label="Email"
          type="email"
          placeholder="admin@icesales.com"
          value={email}
          onChange={(value) => setEmail(value)}
          hint="Stored on your admin profile (login email is managed by Auth)."
        />

        <div>
          <p className="mb-1.5 text-sm font-medium text-secondary">Avatar</p>
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="size-16 rounded-xl object-cover ring-1 ring-secondary"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-xl bg-secondary ring-1 ring-secondary">
                <Image01 className="size-6 text-fg-quaternary" />
              </div>
            )}
            <div className="flex flex-col items-start gap-2">
              <Button size="sm" color="secondary" onClick={() => setAvatarModalOpen(true)}>
                Browse Files
              </Button>
              {avatarUrl && (
                <Button size="sm" color="link-destructive" onClick={() => setAvatarUrl("")}>
                  Remove avatar
                </Button>
              )}
            </div>
          </div>
          <MediaBrowserModal
            open={avatarModalOpen}
            onClose={() => setAvatarModalOpen(false)}
            onSelect={(url) => {
              setAvatarUrl(url);
              setAvatarModalOpen(false);
            }}
            accept="image/*"
            title="Select Avatar"
          />
        </div>

        <Button
          size="md"
          color="primary"
          iconLeading={Save01}
          isLoading={saving}
          showTextWhileLoading
          onClick={handleSave}
        >
          {saving ? "Saving..." : "Save profile"}
        </Button>
      </section>

      {/* Password */}
      <section className="space-y-6 rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <div className="flex items-start gap-3">
          <FeaturedIcon color="gray" theme="light" size="md" icon={Lock01} />
          <div>
            <h2 className="text-md font-semibold text-primary">Password</h2>
            <p className="text-sm text-tertiary">
              Change your sign-in password. Passwords are hashed by Supabase Auth — never stored in plaintext.
            </p>
          </div>
        </div>

        <Input
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={setCurrentPassword}
          isRequired
        />
        <Input
          label="New password"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          hint="At least 8 characters"
          isRequired
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          isRequired
        />

        <Button
          size="md"
          color="secondary"
          iconLeading={Key01}
          isLoading={passwordSaving}
          showTextWhileLoading
          onClick={handlePasswordChange}
          isDisabled={!currentPassword || !newPassword || !confirmPassword}
        >
          {passwordSaving ? "Updating..." : "Update password"}
        </Button>
      </section>

      {/* 2FA */}
      <section className="space-y-6 rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <div className="flex items-start gap-3">
          <FeaturedIcon
            color={totpEnabled ? "success" : "brand"}
            theme="light"
            size="md"
            icon={Shield01}
          />
          <div>
            <h2 className="text-md font-semibold text-primary">Two-factor authentication</h2>
            <p className="text-sm text-tertiary">
              {totpEnabled
                ? "TOTP is enabled. You will be asked for a 6-digit code on every admin login."
                : "Add an authenticator app (Google Authenticator, 1Password, Authy, etc.) for an extra login step."}
            </p>
          </div>
        </div>

        {!totpEnabled && !totpSetup && (
          <Button
            size="md"
            color="primary"
            iconLeading={Shield01}
            isLoading={totpBusy}
            showTextWhileLoading
            onClick={startTotpSetup}
          >
            Set up 2FA
          </Button>
        )}

        {!totpEnabled && totpSetup && (
          <div className="space-y-4">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={totpSetup.qrDataUrl}
                alt="TOTP QR code"
                className="size-44 rounded-xl bg-primary ring-1 ring-secondary"
              />
              <div className="min-w-0 space-y-2">
                <p className="text-sm text-secondary">
                  Scan the QR code with your authenticator app, or enter this secret manually:
                </p>
                <code className="block break-all rounded-lg bg-secondary px-3 py-2 text-xs text-primary">
                  {totpSetup.secret}
                </code>
              </div>
            </div>

            <PinInput size="xxxs">
              <PinInput.Label>Enter the 6-digit code to confirm</PinInput.Label>
              <PinInput.Group
                maxLength={6}
                value={totpCode}
                onChange={setTotpCode}
                inputMode="numeric"
              >
                <PinInput.Slot index={0} />
                <PinInput.Slot index={1} />
                <PinInput.Slot index={2} />
                <PinInput.Slot index={3} />
                <PinInput.Slot index={4} />
                <PinInput.Slot index={5} />
              </PinInput.Group>
            </PinInput>

            <div className="flex flex-wrap gap-2">
              <Button
                size="md"
                color="primary"
                isLoading={totpBusy}
                showTextWhileLoading
                isDisabled={totpCode.length !== 6}
                onClick={enableTotp}
              >
                Verify and enable
              </Button>
              <Button
                size="md"
                color="secondary"
                onClick={() => {
                  setTotpSetup(null);
                  setTotpCode("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {totpEnabled && (
          <div className="space-y-4">
            <div className="rounded-lg bg-utility-green-50 px-3 py-2 text-sm text-utility-green-700 ring-1 ring-utility-green-200 ring-inset">
              2FA is active on this account.
            </div>
            <PinInput size="xxxs">
              <PinInput.Label>Enter a code to disable 2FA</PinInput.Label>
              <PinInput.Group
                maxLength={6}
                value={disableCode}
                onChange={setDisableCode}
                inputMode="numeric"
              >
                <PinInput.Slot index={0} />
                <PinInput.Slot index={1} />
                <PinInput.Slot index={2} />
                <PinInput.Slot index={3} />
                <PinInput.Slot index={4} />
                <PinInput.Slot index={5} />
              </PinInput.Group>
            </PinInput>
            <Button
              size="md"
              color="secondary-destructive"
              isLoading={totpBusy}
              showTextWhileLoading
              isDisabled={disableCode.length !== 6}
              onClick={disableTotp}
            >
              Disable 2FA
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
