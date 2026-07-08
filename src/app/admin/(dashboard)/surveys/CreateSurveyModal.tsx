"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Plus } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { NativeSelect } from "@/components/base/select/select-native";
import { TextArea } from "@/components/base/textarea/textarea";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";

interface Props {
  clients: { id: string; company_name: string }[];
}

export default function CreateSurveyModal({ clients }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientAccountId, setClientAccountId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!clientAccountId) {
      setError("Please select a client.");
      return;
    }

    const supabase = createClient();
    const { error: insertError } = await supabase.from("surveys").insert({
      title: title.trim(),
      description: description.trim() || null,
      client_account_id: clientAccountId,
      expires_at: expiresAt || null,
      status: "draft",
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTitle("");
    setDescription("");
    setClientAccountId("");
    setExpiresAt("");
    setOpen(false);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      <Button size="md" color="primary" iconLeading={Plus} onClick={() => setOpen(true)}>
        Create Survey
      </Button>

      <ModalOverlay isOpen={open} onOpenChange={setOpen} isDismissable>
        <Modal className="w-full max-w-md">
          <Dialog>
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary">Create Survey</h2>
                <CloseButton size="sm" onPress={() => setOpen(false)} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-utility-red-50 p-3 text-sm text-utility-red-700 ring-1 ring-utility-red-200 ring-inset">
                    <AlertCircle className="size-4 shrink-0 text-utility-red-500" />
                    {error}
                  </div>
                )}

                <Input
                  label="Title"
                  placeholder="Q1 Satisfaction Survey"
                  isRequired
                  value={title}
                  onChange={(value) => setTitle(value)}
                />

                <TextArea
                  label="Description"
                  placeholder="Optional description..."
                  rows={3}
                  value={description}
                  onChange={(value) => setDescription(value)}
                  textAreaClassName="resize-none"
                />

                <NativeSelect
                  label="Client Account"
                  required
                  value={clientAccountId}
                  onChange={(e) => setClientAccountId(e.target.value)}
                  options={[
                    { label: "Select a client...", value: "" },
                    ...clients.map((c) => ({ label: c.company_name, value: c.id })),
                  ]}
                />

                <Input
                  label="Expires At (optional)"
                  type="date"
                  value={expiresAt}
                  onChange={(value) => setExpiresAt(value)}
                />

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    size="md"
                    color="primary"
                    isLoading={isPending}
                    showTextWhileLoading
                    className="flex-1"
                  >
                    {isPending ? "Creating..." : "Create Survey"}
                  </Button>
                  <Button type="button" size="md" color="secondary" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
