"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, XClose } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { NativeSelect } from "@/components/base/select/select-native";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";

export default function AddSectionButton({ pageId }: { pageId: string }) {
  const [open, setOpen] = useState(false);
  const [sectionKey, setSectionKey] = useState("");
  const [sectionType, setSectionType] = useState("content");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const sectionTypes = [
    "hero",
    "content",
    "cta",
    "features",
    "testimonials",
    "faq",
    "stats",
    "gallery",
    "pricing",
    "custom",
  ];

  const handleCreate = async () => {
    if (!sectionKey.trim()) {
      setError("Section key is required");
      return;
    }

    setSaving(true);
    setError("");
    const supabase = createClient();

    const { error: insertError } = await supabase
      .from("page_sections")
      .insert({
        page_id: pageId,
        section_key: sectionKey.trim(),
        section_type: sectionType,
        content: {},
        sort_order: 999,
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
    setSectionKey("");
    setSectionType("content");
    router.refresh();
  };

  if (!open) {
    return (
      <Button size="sm" iconLeading={Plus} onClick={() => setOpen(true)}>
        Add Section
      </Button>
    );
  }

  return (
    <ModalOverlay isDismissable isOpen onOpenChange={(isOpen) => !isOpen && setOpen(false)}>
      <Modal className="w-full max-w-md">
        <Dialog aria-label="Add section">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Add Section</h2>
              <ButtonUtility
                size="sm"
                color="tertiary"
                icon={XClose}
                tooltip="Close"
                onClick={() => setOpen(false)}
              />
            </div>

            <div className="space-y-4">
              <Input
                label="Section Key"
                placeholder="e.g. hero_banner"
                value={sectionKey}
                onChange={setSectionKey}
              />

              <NativeSelect
                label="Section Type"
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value)}
                options={sectionTypes.map((type) => ({ label: type, value: type }))}
              />

              {error && (
                <p className="text-sm text-error-primary">{error}</p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button color="secondary" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  isLoading={saving}
                  showTextWhileLoading
                  onClick={handleCreate}
                >
                  {saving ? "Creating..." : "Create Section"}
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
