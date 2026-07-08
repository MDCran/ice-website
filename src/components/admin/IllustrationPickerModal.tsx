"use client";

import { useState } from "react";
import { Check, SearchLg, XClose } from "@untitledui/icons";
import { ILLUSTRATIONS, ILLUSTRATION_CATEGORIES, type IllustrationMeta } from "@/lib/illustrations";
import { IllustrationRenderer } from "@/components/illustrations/IllustrationRenderer";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { cx } from "@/utils/cx";

interface IllustrationPickerModalProps {
  open: boolean;
  current?: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export default function IllustrationPickerModal({
  open,
  current,
  onClose,
  onSelect,
}: IllustrationPickerModalProps) {
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  if (!open) return null;

  const filtered = ILLUSTRATIONS.filter((ill) => {
    const matchCat = category === "All" || ill.category === category;
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      ill.name.toLowerCase().includes(q) ||
      ill.description.toLowerCase().includes(q) ||
      ill.tags.some((t) => t.includes(q));
    return matchCat && matchQ;
  });

  return (
    <ModalOverlay isDismissable isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Modal className="w-full max-w-3xl">
        <Dialog aria-label="Illustration library">
          <div className="flex h-[720px] max-h-[80vh] flex-col overflow-hidden">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-secondary px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-primary">Illustration Library</h2>
                <p className="mt-0.5 text-xs text-tertiary">{ILLUSTRATIONS.length} graphics available</p>
              </div>
              <ButtonUtility size="sm" color="tertiary" icon={XClose} tooltip="Close" onClick={onClose} />
            </div>

            {/* Filter bar */}
            <div className="shrink-0 space-y-3 border-b border-secondary px-6 py-3">
              <Input
                size="sm"
                icon={SearchLg}
                placeholder="Search illustrations..."
                value={query}
                onChange={setQuery}
              />
              <div className="flex flex-wrap gap-2">
                {ILLUSTRATION_CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    color={category === cat ? "primary" : "secondary"}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-tertiary">
                  No illustrations match your search.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {filtered.map((ill) => (
                    <IllustrationCard
                      key={ill.id}
                      ill={ill}
                      isSelected={current === ill.id}
                      isHovered={hovered === ill.id}
                      onHover={() => setHovered(ill.id)}
                      onLeave={() => setHovered(null)}
                      onClick={() => {
                        onSelect(ill.id);
                        onClose();
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-secondary px-6 py-3">
              <p className="text-xs text-tertiary">{filtered.length} of {ILLUSTRATIONS.length} shown</p>
              {current && (
                <Button
                  size="sm"
                  color="link-destructive"
                  onClick={() => {
                    onSelect("");
                    onClose();
                  }}
                >
                  Clear illustration
                </Button>
              )}
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}

function IllustrationCard({
  ill,
  isSelected,
  isHovered,
  onHover,
  onLeave,
  onClick,
}: {
  ill: IllustrationMeta;
  isSelected: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cx(
        "group relative flex cursor-pointer flex-col items-center gap-2 rounded-xl bg-primary p-3 text-left transition",
        isSelected
          ? "ring-2 ring-brand ring-inset"
          : "ring-1 ring-secondary ring-inset hover:bg-secondary hover:ring-primary"
      )}
    >
      {/* Selected badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-brand-solid">
          <Check className="size-3 text-white" />
        </div>
      )}
      {/* Illustration preview */}
      <div className="flex aspect-square w-full items-center justify-center">
        <IllustrationRenderer id={ill.id} className="h-full w-full" />
      </div>
      {/* Name */}
      <div className="w-full">
        <p className="truncate text-center text-xs font-medium text-primary">{ill.name}</p>
        <p className="truncate text-center text-xs text-tertiary">{ill.category}</p>
      </div>
    </button>
  );
}
