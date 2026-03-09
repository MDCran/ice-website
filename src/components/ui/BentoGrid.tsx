"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import SpotlightCard from "@/components/effects/SpotlightCard";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: ReactNode;
  colSpan?: number;
  rowSpan?: number;
  className?: string;
}

export function BentoCard({ children, colSpan = 1, rowSpan = 1, className }: BentoCardProps) {
  return (
    <SpotlightCard
      className={cn(
        "glass-card rounded-2xl",
        colSpan === 2 && "sm:col-span-2",
        colSpan === 3 && "sm:col-span-2 lg:col-span-3",
        colSpan === 4 && "sm:col-span-2 lg:col-span-4",
        rowSpan === 2 && "row-span-2",
        className
      )}
    >
      {children}
    </SpotlightCard>
  );
}
