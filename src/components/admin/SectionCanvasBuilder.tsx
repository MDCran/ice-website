"use client";

import { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  Copy01,
  DotsGrid,
  Eye,
  EyeOff,
  Trash01,
} from "@untitledui/icons";
import { Badge, type BadgeColor } from "@/components/base/badges/badges";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { cx } from "@/utils/cx";

export interface BuilderSection {
  id: string;
  section_key: string;
  section_type: string;
  is_visible: boolean;
  sort_order: number;
}

function SortableRow({
  section,
  label,
  typeLabel,
  badgeColor,
  isExpanded,
  children,
  onToggle,
  onToggleVisible,
  onDuplicate,
  onDelete,
}: {
  section: BuilderSection;
  label: string;
  typeLabel: string;
  badgeColor: BadgeColor<"pill-color">;
  isExpanded: boolean;
  children?: React.ReactNode;
  onToggle: () => void;
  onToggleVisible: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cx(
        "overflow-hidden rounded-xl bg-primary ring-1 ring-secondary transition-colors",
        !section.is_visible && "opacity-60",
        isDragging && "z-10 shadow-xl ring-brand",
      )}
    >
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary"
        onClick={onToggle}
      >
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-fg-quaternary hover:text-fg-quaternary_hover active:cursor-grabbing"
          aria-label={`Drag ${label}`}
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <DotsGrid className="size-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-primary">{label}</span>
            <Badge size="sm" color={badgeColor}>
              {typeLabel}
            </Badge>
          </div>
          <span className="text-xs text-quaternary">{section.section_key}</span>
        </div>

        <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <ButtonUtility
            size="xs"
            color="tertiary"
            icon={section.is_visible ? Eye : EyeOff}
            tooltip={section.is_visible ? "Hide section" : "Show section"}
            onClick={onToggleVisible}
          />
          <ButtonUtility size="xs" color="tertiary" icon={Copy01} tooltip="Duplicate section" onClick={onDuplicate} />
          <ButtonUtility size="xs" color="tertiary" icon={Trash01} tooltip="Delete section" onClick={onDelete} />
        </div>
        <ChevronDown
          className={cx("size-4 shrink-0 text-fg-quaternary transition-transform", isExpanded && "rotate-180")}
          aria-hidden
        />
      </div>
      {isExpanded && children}
    </div>
  );
}

/**
 * Visual page builder chrome (#34) — canvas strip + drag-reorderable section list.
 */
export default function SectionCanvasBuilder({
  sections,
  expandedIds,
  typeColors,
  getTypeLabel,
  prettifyKey,
  onReorder,
  onToggleExpand,
  onToggleVisible,
  onDuplicate,
  onDelete,
  renderExpanded,
}: {
  sections: BuilderSection[];
  expandedIds: Set<string>;
  typeColors: Record<string, BadgeColor<"pill-color">>;
  getTypeLabel: (type: string) => string;
  prettifyKey: (key: string) => string;
  onReorder: (orderedIds: string[]) => void;
  onToggleExpand: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  renderExpanded: (id: string) => React.ReactNode;
}) {
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(ids, oldIndex, newIndex));
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-secondary p-3 ring-1 ring-secondary">
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <p className="text-xs font-semibold tracking-wide text-quaternary uppercase">
            Canvas · click to expand · drag rows below to reorder
          </p>
          <p className="text-xs text-quaternary">{sections.length} blocks</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {sections.map((section) => {
            const active = expandedIds.has(section.id);
            return (
              <button
                key={section.id}
                type="button"
                className={cx(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left ring-1 transition",
                  active
                    ? "bg-brand-solid text-white ring-transparent"
                    : "bg-primary text-secondary ring-secondary hover:bg-primary_hover",
                  !section.is_visible && !active && "opacity-50",
                )}
                onClick={() => onToggleExpand(section.id)}
              >
                <span className="max-w-[9rem] truncate text-xs font-semibold">
                  {prettifyKey(section.section_key)}
                </span>
                <Badge
                  size="sm"
                  color={active ? "gray" : typeColors[section.section_type] ?? "gray"}
                  className={active ? "bg-white/20 text-white" : undefined}
                >
                  {getTypeLabel(section.section_type)}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sections.map((section) => (
              <SortableRow
                key={section.id}
                section={section}
                label={prettifyKey(section.section_key)}
                typeLabel={getTypeLabel(section.section_type)}
                badgeColor={typeColors[section.section_type] ?? "gray"}
                isExpanded={expandedIds.has(section.id)}
                onToggle={() => onToggleExpand(section.id)}
                onToggleVisible={() => onToggleVisible(section.id)}
                onDuplicate={() => onDuplicate(section.id)}
                onDelete={() => onDelete(section.id)}
              >
                {expandedIds.has(section.id) ? renderExpanded(section.id) : null}
              </SortableRow>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
