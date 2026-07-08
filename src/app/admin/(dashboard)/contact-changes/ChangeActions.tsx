"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, XClose } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/base/buttons/button";

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
        <span className="mr-2 text-xs text-error-primary">{error}</span>
      )}
      <Button
        size="sm"
        color="secondary-destructive"
        iconLeading={XClose}
        isLoading={loading === "reject"}
        showTextWhileLoading
        isDisabled={loading !== null}
        onClick={() => handleAction("reject")}
      >
        Reject
      </Button>
      <Button
        size="sm"
        color="primary"
        iconLeading={Check}
        isLoading={loading === "accept"}
        showTextWhileLoading
        isDisabled={loading !== null}
        onClick={() => handleAction("accept")}
      >
        Accept
      </Button>
    </div>
  );
}
