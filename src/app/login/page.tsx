"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
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
    <div className="login-page min-h-screen flex items-center justify-center px-4 transition-colors duration-300" style={{ background: 'var(--bg-primary)' }}>
      {/* Theme toggle in corner */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/10 mb-4">
            <Lock className="w-8 h-8 text-sky-400" />
          </div>
          <h1 className="text-2xl font-bold transition-colors" style={{ color: 'var(--text-primary)' }}>Client Portal</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            International Computer Exchange
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl p-8 space-y-5 transition-colors duration-300"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="login-input w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="login-input w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm transition-colors hover:text-sky-400"
            style={{ color: 'var(--text-muted)' }}
          >
            &larr; Back to Site
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center transition-colors" style={{ background: 'var(--bg-primary)' }}>
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
