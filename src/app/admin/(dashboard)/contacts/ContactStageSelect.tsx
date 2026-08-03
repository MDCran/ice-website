"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NativeSelect } from "@/components/base/select/select-native";
import { Badge } from "@/components/base/badges/badges";
import { PIPELINE_STAGES } from "@/lib/admin/pipeline";

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
