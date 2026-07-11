"use client";

import { useState } from "react";
import { Lock01, Mail01, Moon01, Sun } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/lib/themeProvider";
import { LoginErrorAlert } from "@/components/auth/LoginErrorAlert";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

export default function AdminLoginPage() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      // Verify user is an admin
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
        .select("id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        await supabase.auth.signOut();
        setError("You do not have admin access.");
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
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      {/* Theme toggle in corner */}
      <div className="fixed top-4 right-4 z-10">
        <ButtonUtility
          color="tertiary"
          size="sm"
          icon={theme === "dark" ? Sun : Moon01}
          tooltip={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          onClick={toggleTheme}
        />
      </div>

      <div className="w-full max-w-md py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <FeaturedIcon icon={Lock01} color="brand" theme="modern" size="xl" />
          <div>
            <h1 className="text-display-xs font-semibold text-primary">Admin Center</h1>
            <p className="mt-1 text-md text-tertiary">International Computer Exchange</p>
          </div>
        </div>

        <form
          onSubmit={handleLogin}
          className="mt-8 flex flex-col gap-5 rounded-xl bg-primary p-6 shadow-sm ring-1 ring-secondary sm:p-8"
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
      </div>
    </div>
  );
}
