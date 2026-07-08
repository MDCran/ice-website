"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";

function RedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  useEffect(() => {
    const url = redirectParam
      ? `/login?redirect=${encodeURIComponent(redirectParam)}`
      : "/login";
    router.replace(url);
  }, [router, redirectParam]);

  return null;
}

export default function PortalLoginRedirect() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <LoadingIndicator type="line-spinner" size="md" label="Redirecting to sign in..." />
      <Suspense fallback={null}>
        <RedirectHandler />
      </Suspense>
    </div>
  );
}
