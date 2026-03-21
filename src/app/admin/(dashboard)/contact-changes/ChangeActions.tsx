"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ChangeActions({ changeId }: { changeId: string }) {
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAction = async (action: "accept" | "reject") => {
    setLoading(action);
    setError("");

    const supabase = createClient();
    const newStatus = action === "accept" ? "approved" : "rejected";

    const { error: updateError } = await supabase
      .from("client_contact_changes")
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", changeId);

    if (updateError) {
      setError(updateError.message);
      setLoading(null);
      return;
    }

    setLoading(null);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-red-400 text-xs mr-2">{error}</span>
      )}
      <button
        onClick={() => handleAction("reject")}
        disabled={loading !== null}
        className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors"
      >
        {loading === "reject" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <X size={14} />
        )}
        Reject
      </button>
      <button
        onClick={() => handleAction("accept")}
        disabled={loading !== null}
        className="inline-flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-300 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors"
      >
        {loading === "accept" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Check size={14} />
        )}
        Accept
      </button>
    </div>
  );
}
