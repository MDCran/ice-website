"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash01 } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/base/buttons/button";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";

export default function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: delError } = await supabase
      .from("client_accounts")
      .delete()
      .eq("id", clientId);

    if (delError) {
      setError(delError.message);
      setLoading(false);
      return;
    }

    router.push("/admin/clients");
  };

  return (
    <>
      <Button color="primary-destructive" size="sm" iconLeading={Trash01} onClick={() => setShowConfirm(true)}>
        Delete
      </Button>

      <ModalOverlay
        isDismissable={!loading}
        isOpen={showConfirm}
        onOpenChange={(open) => {
          if (!open && !loading) setShowConfirm(false);
        }}
      >
        <Modal className="w-full max-w-md">
          <Dialog>
            <div className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-3">
                <FeaturedIcon icon={AlertTriangle} color="error" theme="modern" size="lg" />
                <div>
                  <h3 className="text-lg font-semibold text-primary">Delete Client</h3>
                  <p className="text-sm text-tertiary">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-sm text-tertiary">
                Are you sure you want to delete <strong className="font-semibold text-primary">{clientName}</strong>? All
                associated contacts, billing history, documents, resources, and surveys will be permanently removed.
              </p>

              {error && (
                <div className="rounded-lg bg-utility-red-50 px-3.5 py-2.5 text-sm text-utility-red-700 ring-1 ring-utility-red-200 ring-inset">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button color="secondary" size="md" isDisabled={loading} onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
                <Button
                  color="primary-destructive"
                  size="md"
                  iconLeading={Trash01}
                  isDisabled={loading}
                  isLoading={loading}
                  showTextWhileLoading
                  onClick={handleDelete}
                >
                  Delete Permanently
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
