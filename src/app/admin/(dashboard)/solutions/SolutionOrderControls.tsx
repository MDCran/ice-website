"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { createClient } from "@/lib/supabase/client";

export interface OrderedSolution {
  id: string;
  sortOrder: number;
}

let reorderInFlight = false;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The service order could not be saved.";
}

export default function SolutionOrderControls({
  pageId,
  orderedSolutions,
  canEdit,
}: {
  pageId: string;
  orderedSolutions: OrderedSolution[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const currentIndex = orderedSolutions.findIndex((solution) => solution.id === pageId);
  const busy = isSaving || isRefreshing;

  const updateOrder = async (
    id: string,
    nextOrder: number,
    expectedOrder?: number,
  ) => {
    const supabase = createClient();
    let query = supabase
      .from("pages")
      .update({ sort_order: nextOrder, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("page_type", "solution");
    if (expectedOrder !== undefined) query = query.eq("sort_order", expectedOrder);
    const { data, error: updateError } = await query.select("id").maybeSingle();
    if (updateError) throw updateError;
    if (!data) throw new Error("The order changed in another session. Refresh and try again.");
  };

  const move = async (direction: -1 | 1) => {
    if (!canEdit || busy) return;
    if (reorderInFlight) {
      setError("Another service order change is still saving.");
      return;
    }

    const targetIndex = currentIndex + direction;
    const current = orderedSolutions[currentIndex];
    const adjacent = orderedSolutions[targetIndex];
    if (!current || !adjacent) return;
    if (current.sortOrder === adjacent.sortOrder) {
      setError("These services share the same catalog order. Give them distinct order values, then try again.");
      return;
    }

    reorderInFlight = true;
    setIsSaving(true);
    setError("");

    const highestOrder = Math.max(0, ...orderedSolutions.map((solution) => solution.sortOrder));
    const temporaryOrder = highestOrder + 1_000_000;
    let currentAtTemporaryOrder = false;
    let adjacentAtCurrentOrder = false;
    let swapComplete = false;

    try {
      await updateOrder(current.id, temporaryOrder, current.sortOrder);
      currentAtTemporaryOrder = true;
      await updateOrder(adjacent.id, current.sortOrder, adjacent.sortOrder);
      adjacentAtCurrentOrder = true;
      await updateOrder(current.id, adjacent.sortOrder, temporaryOrder);
      currentAtTemporaryOrder = false;
      swapComplete = true;

      const response = await fetch("/api/admin/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tags: ["solution-catalog"],
          paths: ["/solutions", "/solutions/find", "/sitemap.xml"],
        }),
      });
      const result = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
      if (!response.ok || result?.ok !== true) {
        setError(
          `Order saved, but the public catalog refresh failed${result?.error ? `: ${result.error}` : "."}`,
        );
      }
      startTransition(() => router.refresh());
    } catch (moveError) {
      if (swapComplete) {
        setError(`Order saved, but the public catalog refresh failed: ${errorMessage(moveError)}`);
        startTransition(() => router.refresh());
        return;
      }
      let rollbackFailed = false;
      if (adjacentAtCurrentOrder) {
        try {
          await updateOrder(adjacent.id, adjacent.sortOrder);
          adjacentAtCurrentOrder = false;
        } catch {
          rollbackFailed = true;
        }
      }
      if (currentAtTemporaryOrder) {
        try {
          await updateOrder(current.id, current.sortOrder);
        } catch {
          rollbackFailed = true;
        }
      }
      setError(
        `${errorMessage(moveError)}${rollbackFailed ? " Automatic rollback was incomplete; refresh before trying again." : ""}`,
      );
      startTransition(() => router.refresh());
    } finally {
      reorderInFlight = false;
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-w-20 flex-col items-end">
      <div className="flex items-center gap-0.5" aria-label="Reorder service">
        <ButtonUtility
          size="xs"
          color="tertiary"
          icon={ArrowUp}
          tooltip="Move service up"
          isDisabled={!canEdit || busy || currentIndex <= 0}
          onClick={() => void move(-1)}
        />
        <ButtonUtility
          size="xs"
          color="tertiary"
          icon={ArrowDown}
          tooltip="Move service down"
          isDisabled={!canEdit || busy || currentIndex < 0 || currentIndex >= orderedSolutions.length - 1}
          onClick={() => void move(1)}
        />
        {busy && <span className="ml-1 text-[11px] text-tertiary">Saving…</span>}
      </div>
      {error && (
        <p className="mt-1 max-w-64 text-right text-[11px] leading-4 text-error-primary" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
