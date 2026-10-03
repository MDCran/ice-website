"use client";

import { createContext, useContext, type ReactNode } from "react";
import { resolvePortalCopy, type PortalCopy } from "@/lib/portalCopy";

const PortalCopyContext = createContext<PortalCopy>(resolvePortalCopy(null));

export function PortalCopyProvider({
  value,
  children,
}: {
  value: unknown;
  children: ReactNode;
}) {
  return (
    <PortalCopyContext.Provider value={resolvePortalCopy(value)}>
      {children}
    </PortalCopyContext.Provider>
  );
}

export function usePortalCopy() {
  return useContext(PortalCopyContext);
}
