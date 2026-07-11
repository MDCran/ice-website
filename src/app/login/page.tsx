"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Lock01, Mail01 } from "@untitledui/icons";
import { LoginErrorAlert } from "@/components/auth/LoginErrorAlert";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import ThemeToggle from "@/components/ui/ThemeToggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
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

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Authentication failed.");
        setLoading(false);
        return;
      }

      // Verify user exists in client_users
      const { data: clientUser } = await supabase
        .from("client_users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!clientUser) {
        await supabase.auth.signOut();
        setError("You do not have portal access.");
        setLoading(false);
        return;
      }

      const destination = redirect || "/portal";
      window.location.href = destination;
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-secondary px-4 py-12 md:px-8">
      {/* Theme toggle in corner */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex items-center justify-center rounded-xl bg-white px-3 py-2 shadow-xs ring-1 ring-primary ring-inset">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo/ice-logo.jpg"
              alt="International Computer Exchange"
              className="h-8 w-auto"
            />
          </div>
          <div>
            <h1 className="text-display-xs font-semibold text-primary">Client Portal</h1>
            <p className="mt-2 text-md text-tertiary">
              Sign in to your International Computer Exchange account.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-5 rounded-2xl bg-primary px-6 py-8 shadow-sm ring-1 ring-secondary sm:px-8"
        >
          {error && <LoginErrorAlert message={error} />}

          <Input
            label="Email"
            type="email"
            size="md"
            icon={Mail01}
            placeholder="you@company.com"
            value={email}
            onChange={setEmail}
            isRequired
            hideRequiredIndicator
          />

          <Input
            label="Password"
            type="password"
            size="md"
            icon={Lock01}
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            isRequired
            hideRequiredIndicator
          />

          <Button type="submit" size="lg" isLoading={loading} showTextWhileLoading>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="flex justify-center">
          <Button color="link-gray" size="md" href="/" iconLeading={ArrowLeft}>
            Back to site
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-secondary">
          <LoadingIndicator type="line-spinner" size="md" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
