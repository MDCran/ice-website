"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
    <Suspense fallback={null}>
      <RedirectHandler />
    </Suspense>
  );
}
