"use client";

import { useDeadlineCountdown } from "@/hooks/useDeadlineCountdown";
import { Clock, AlertTriangle } from "@untitledui/icons";
import { Badge, BadgeWithIcon } from "@/components/base/badges/badges";

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
    <div className="flex flex-wrap items-center gap-2">
      {!expired && daysRemaining !== null && (
        <BadgeWithIcon
          type="pill-color"
          size="md"
          color={daysRemaining <= 3 ? "error" : daysRemaining <= 7 ? "warning" : "brand"}
          iconLeading={daysRemaining <= 3 ? AlertTriangle : Clock}
        >
          {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
        </BadgeWithIcon>
      )}
      {expired && (
        <Badge type="pill-color" size="md" color="gray">
          Expired
        </Badge>
      )}
      {extendedDays > 0 && (
        <Badge type="pill-color" size="sm" color="purple">
          Extended {extendedDays} day{extendedDays !== 1 ? "s" : ""}
        </Badge>
      )}
    </div>
  );
}
