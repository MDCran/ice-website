"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RouterProvider } from "react-aria-components";

declare module "react-aria-components" {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
  }
}

/**
 * Bridges react-aria-components (Untitled UI) links/buttons with the Next.js
 * App Router so `href` navigations are client-side instead of full page loads.
 */
export function RouteProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  return <RouterProvider navigate={(href, opts) => router.push(href, opts)}>{children}</RouterProvider>;
}
