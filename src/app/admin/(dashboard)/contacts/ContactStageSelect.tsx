"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NativeSelect } from "@/components/base/select/select-native";
import { Badge, type BadgeColor } from "@/components/base/badges/badges";

export const PIPELINE_STAGES = [
  { value: "new", label: "New", color: "brand" as BadgeColor<"pill-color"> },
  { value: "contacted", label: "Contacted", color: "blue" as BadgeColor<"pill-color"> },
  { value: "qualified", label: "Qualified", color: "purple" as BadgeColor<"pill-color"> },
  { value: "won", label: "Won", color: "success" as BadgeColor<"pill-color"> },
  { value: "lost", label: "Lost", color: "gray" as BadgeColor<"pill-color"> },
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number]["value"];

export function stageMeta(stage?: string | null) {
  return PIPELINE_STAGES.find((s) => s.value === stage) ?? PIPELINE_STAGES[0];
}

export function PipelineStageBadge({ stage }: { stage?: string | null }) {
  const meta = stageMeta(stage);
  return (
    <Badge size="sm" color={meta.color}>
      {meta.label}
    </Badge>
  );
}

export default function ContactStageSelect({
  id,
  stage,
}: {
  id: string;
  stage?: string | null;
}) {
  const router = useRouter();
  const current = stage && PIPELINE_STAGES.some((s) => s.value === stage) ? stage : "new";

  return (
    <NativeSelect
      aria-label="Pipeline stage"
      value={current}
      options={PIPELINE_STAGES.map((s) => ({ label: s.label, value: s.value }))}
      onChange={async (e) => {
        const next = e.target.value;
        const supabase = createClient();
        const { error } = await supabase
          .from("contacts")
          .update({
            pipeline_stage: next,
            is_read: next !== "new",
          })
          .eq("id", id);
        if (error && /pipeline_stage/i.test(error.message)) {
          // Migration not applied — fall back to read flag only.
          await supabase
            .from("contacts")
            .update({ is_read: next !== "new" })
            .eq("id", id);
        }
        router.refresh();
      }}
      className="min-w-[8.5rem]"
    />
  );
}
