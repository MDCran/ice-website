"use client";

import { useDeadlineCountdown } from "@/hooks/useDeadlineCountdown";
import { Clock, AlertTriangle } from "lucide-react";

interface DeadlineCountdownProps {
  deadlineAt: string | null;
  extendedDays?: number;
}

export default function DeadlineCountdown({
  deadlineAt,
  extendedDays = 0,
}: DeadlineCountdownProps) {
  const { daysRemaining, expired } = useDeadlineCountdown(deadlineAt);

  if (!deadlineAt) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {!expired && daysRemaining !== null && (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            daysRemaining <= 3
              ? "bg-red-500/10 text-red-400"
              : daysRemaining <= 7
                ? "bg-amber-500/10 text-amber-400"
                : "bg-sky-500/10 text-sky-400"
          }`}
        >
          {daysRemaining <= 3 ? (
            <AlertTriangle size={12} />
          ) : (
            <Clock size={12} />
          )}
          {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
        </span>
      )}
      {expired && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400">
          Expired
        </span>
      )}
      {extendedDays > 0 && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-violet-500/10 text-violet-400">
          Extended {extendedDays} day{extendedDays !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
