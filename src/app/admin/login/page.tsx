"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Key01, Lock01, Mail01, Moon01, Sun } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/lib/themeProvider";
import { LoginErrorAlert } from "@/components/auth/LoginErrorAlert";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { PinInput } from "@/components/base/input/pin-input";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

function AdminLoginForm() {
  const { theme, toggleTheme } = useTheme();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("step") === "2fa") {
      setStep("2fa");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Authentication failed.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("admin_profiles")
        .select("id, totp_enabled")
        .eq("id", user.id)
        .single();

      if (!profile) {
        await supabase.auth.signOut();
        setError("You do not have admin access.");
        setLoading(false);
        return;
      }

      if (profile.totp_enabled) {
        setStep("2fa");
        setTotpCode("");
        setLoading(false);
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: totpCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Verification failed.");
        setLoading(false);
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-secondary px-4 py-12">
      <Link
        href="/"
        className="fixed top-4 left-4 z-10 flex items-center rounded-lg outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
        aria-label="International Computer Exchange home"
      >
        <Image
          src="/images/logo/logo-dark.svg"
          alt="International Computer Exchange"
          width={120}
          height={32}
          className="h-8 w-auto dark:hidden"
          priority
        />
        <Image
          src="/images/logo/logo-white.svg"
          alt=""
          width={120}
          height={32}
          className="hidden h-8 w-auto dark:block"
          priority
          aria-hidden
        />
      </Link>

      <div className="fixed top-4 right-4 z-10">
        <ButtonUtility
          color="tertiary"
          size="sm"
          icon={theme === "dark" ? Sun : Moon01}
          tooltip={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          onClick={toggleTheme}
        />
      </div>

      <div className="flex w-full max-w-md flex-col gap-8 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <FeaturedIcon
            icon={step === "2fa" ? Key01 : Lock01}
            color="brand"
            theme="modern"
            size="xl"
          />
          <div>
            <h1 className="text-display-xs font-semibold text-primary">
              {step === "2fa" ? "Two-factor authentication" : "Admin Center"}
            </h1>
            <p className="mt-1 text-md text-tertiary">
              {step === "2fa"
                ? "Enter the 6-digit code from your authenticator app"
                : "International Computer Exchange"}
            </p>
          </div>
        </div>

        {step === "credentials" ? (
          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-5 rounded-xl bg-primary p-6 shadow-sm ring-1 ring-secondary sm:p-8"
          >
            {error && <LoginErrorAlert message={error} />}

            <Input
              label="Email"
              type="email"
              icon={Mail01}
              placeholder="admin@icesales.com"
              value={email}
              onChange={setEmail}
              isRequired
              size="md"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              isRequired
              size="md"
            />

            <Button type="submit" size="lg" color="primary" isLoading={loading} showTextWhileLoading className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={handleVerify2fa}
            className="flex flex-col gap-5 rounded-xl bg-primary p-6 shadow-sm ring-1 ring-secondary sm:p-8"
          >
            {error && <LoginErrorAlert message={error} />}

            <PinInput size="xxxs">
              <PinInput.Label>Authentication code</PinInput.Label>
              <PinInput.Group
                maxLength={6}
                value={totpCode}
                onChange={setTotpCode}
                inputMode="numeric"
                autoFocus
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
              type="submit"
              size="lg"
              color="primary"
              isLoading={loading}
              showTextWhileLoading
              isDisabled={totpCode.length !== 6}
              className="w-full"
            >
              {loading ? "Verifying..." : "Verify and continue"}
            </Button>

            <Button
              type="button"
              color="link-gray"
              size="sm"
              className="self-center"
              onClick={async () => {
                const supabase = createClient();
                await fetch("/api/admin/2fa/logout", { method: "POST" }).catch(() => {});
                await supabase.auth.signOut();
                setStep("credentials");
                setTotpCode("");
                setError("");
              }}
            >
              Back to sign in
            </Button>
          </form>
        )}

        <div className="flex justify-center">
          <Button color="link-gray" size="md" href="/" iconLeading={ArrowLeft}>
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-secondary">
          <p className="text-sm text-tertiary">Loading…</p>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
