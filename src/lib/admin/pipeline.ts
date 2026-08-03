import type { BadgeColor } from "@/components/base/badges/badges";

export const PIPELINE_STAGES = [
  { value: "new", label: "New", color: "brand" as BadgeColor<"pill-color"> },
  { value: "contacted", label: "Contacted", color: "blue" as BadgeColor<"pill-color"> },
  { value: "qualified", label: "Qualified", color: "purple" as BadgeColor<"pill-color"> },
  { value: "won", label: "Won", color: "success" as BadgeColor<"pill-color"> },
  { value: "lost", label: "Lost", color: "gray" as BadgeColor<"pill-color"> },
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number]["value"];
