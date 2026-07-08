"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  LayoutGrid01,
  Link01,
  Plus,
  Save01,
  Trash01,
} from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { Toggle } from "@/components/base/toggle/toggle";
import { cx } from "@/utils/cx";

interface NavItem {
  id: string;
  location: string;
  parent_id: string | null;
  label: string;
  href: string;
  icon_name: string | null;
  mega_column_title: string | null;
  mega_column_icon: string | null;
  is_visible: boolean;
  sort_order: number;
  _isNew?: boolean;
  _deleted?: boolean;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * The public navbar accepts locations "navbar" (current) and "navbar_top"
 * (legacy rows). The manager groups both together as top-nav items, but any
 * NEW top-nav item is always saved with location "navbar".
 */
const isTopNavLocation = (location: string) =>
  location === "navbar" || location === "navbar_top";

/* ────────────────────────────────────────────────────────────── */

export default function NavigationManager({
  initialItems,
}: {
  initialItems: NavItem[];
}) {
  const [items, setItems] = useState<NavItem[]>(initialItems);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedNavbar, setExpandedNavbar] = useState<string[]>([]);

  const dirty = () => {
    if (saveStatus === "saved") setSaveStatus("idle");
  };

  /* ── Derived data ── */

  // Top-level navbar items (location "navbar", plus legacy "navbar_top" rows)
  const navbarItems = items
    .filter((i) => isTopNavLocation(i.location) && !i._deleted)
    .sort((a, b) => a.sort_order - b.sort_order);

  // Mega menu items grouped by parent
  const megaItemsFor = (parentId: string) =>
    items
      .filter((i) => i.location === "navbar_mega" && i.parent_id === parentId && !i._deleted)
      .sort((a, b) => a.sort_order - b.sort_order);

  // Check if a navbar item has mega children (= is a mega menu)
  const isMegaMenu = (navItemId: string) =>
    items.some((i) => i.location === "navbar_mega" && i.parent_id === navItemId && !i._deleted);

  // Get unique columns for a mega parent
  const getMegaColumns = (parentId: string) => {
    const megaItems = megaItemsFor(parentId);
    const columnMap = new Map<string, { title: string; icon: string | null; links: NavItem[] }>();
    for (const item of megaItems) {
      const key = item.mega_column_title || "Untitled";
      if (!columnMap.has(key)) {
        columnMap.set(key, { title: key, icon: item.mega_column_icon, links: [] });
      }
      columnMap.get(key)!.links.push(item);
    }
    return Array.from(columnMap.values());
  };

  const footerQuick = items
    .filter((i) => i.location === "footer_quick" && !i._deleted)
    .sort((a, b) => a.sort_order - b.sort_order);

  const footerLegal = items
    .filter((i) => i.location === "footer_legal" && !i._deleted)
    .sort((a, b) => a.sort_order - b.sort_order);

  // Mega-menu parents excluded from the footer dropdown
  const footerMegaExcludes = items.filter(
    (i) => i.location === "footer_mega_exclude" && !i._deleted
  );

  const isMegaExcludedFromFooter = (navItemId: string) =>
    footerMegaExcludes.some((ex) => ex.href === navItemId);

  const toggleMegaFooterDropdown = (navItem: NavItem) => {
    const existing = items.find(
      (i) => i.location === "footer_mega_exclude" && i.href === navItem.id && !i._deleted
    );
    if (existing) {
      // Remove the exclude entry -> mega shows in footer
      deleteItem(existing.id);
    } else {
      // Create an exclude entry -> mega hidden from footer
      setItems((prev) => [
        ...prev,
        {
          id: genId(),
          location: "footer_mega_exclude",
          parent_id: null,
          label: navItem.label,
          href: navItem.id,
          icon_name: null,
          mega_column_title: null,
          mega_column_icon: null,
          is_visible: true,
          sort_order: 0,
          _isNew: true,
        },
      ]);
      dirty();
    }
  };

  /* ── Helpers ── */

  const genId = () => `new_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const nextOrder = (list: NavItem[]) =>
    list.reduce((max, i) => Math.max(max, i.sort_order), -1) + 1;

  const updateItem = (id: string, field: string, value: unknown) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
    dirty();
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, _deleted: true } : i)));
    // Also delete children
    setItems((prev) =>
      prev.map((i) => (i.parent_id === id ? { ...i, _deleted: true } : i))
    );
    dirty();
  };

  const swapOrder = (list: NavItem[], idx: number, dir: "up" | "down") => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= list.length) return;
    const a = list[idx];
    const b = list[target];
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === a.id) return { ...i, sort_order: b.sort_order };
        if (i.id === b.id) return { ...i, sort_order: a.sort_order };
        return i;
      })
    );
    dirty();
  };

  /* ── Navbar actions ── */

  const addNavbarLink = () => {
    setItems((prev) => [
      ...prev,
      {
        id: genId(),
        location: "navbar",
        parent_id: null,
        label: "",
        href: "/",
        icon_name: null,
        mega_column_title: null,
        mega_column_icon: null,
        is_visible: true,
        sort_order: nextOrder(navbarItems),
        _isNew: true,
      },
    ]);
    dirty();
  };

  const convertToMega = (navId: string) => {
    // Add one default column with one link
    setItems((prev) => [
      ...prev,
      {
        id: genId(),
        location: "navbar_mega",
        parent_id: navId,
        label: "",
        href: "/",
        icon_name: null,
        mega_column_title: "Column 1",
        mega_column_icon: null,
        is_visible: true,
        sort_order: 0,
        _isNew: true,
      },
    ]);
    setExpandedNavbar((prev) => (prev.includes(navId) ? prev : [...prev, navId]));
    dirty();
  };

  const convertToDirectLink = (navId: string) => {
    // Delete all mega children
    setItems((prev) =>
      prev.map((i) =>
        i.location === "navbar_mega" && i.parent_id === navId
          ? { ...i, _deleted: true }
          : i
      )
    );
    dirty();
  };

  const addMegaColumn = (parentId: string) => {
    const cols = getMegaColumns(parentId);
    const nextNum = cols.length + 1;
    setItems((prev) => [
      ...prev,
      {
        id: genId(),
        location: "navbar_mega",
        parent_id: parentId,
        label: "",
        href: "/",
        icon_name: null,
        mega_column_title: `Column ${nextNum}`,
        mega_column_icon: null,
        is_visible: true,
        sort_order: nextOrder(megaItemsFor(parentId)),
        _isNew: true,
      },
    ]);
    dirty();
  };

  const addMegaLink = (parentId: string, columnTitle: string, columnIcon: string | null) => {
    setItems((prev) => [
      ...prev,
      {
        id: genId(),
        location: "navbar_mega",
        parent_id: parentId,
        label: "",
        href: "/",
        icon_name: null,
        mega_column_title: columnTitle,
        mega_column_icon: columnIcon,
        is_visible: true,
        sort_order: nextOrder(megaItemsFor(parentId)),
        _isNew: true,
      },
    ]);
    dirty();
  };

  const renameColumn = (parentId: string, oldTitle: string, newTitle: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.location === "navbar_mega" && i.parent_id === parentId && i.mega_column_title === oldTitle
          ? { ...i, mega_column_title: newTitle }
          : i
      )
    );
    dirty();
  };

  const setColumnIcon = (parentId: string, columnTitle: string, icon: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.location === "navbar_mega" && i.parent_id === parentId && i.mega_column_title === columnTitle
          ? { ...i, mega_column_icon: icon || null }
          : i
      )
    );
    dirty();
  };

  const deleteColumn = (parentId: string, columnTitle: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.location === "navbar_mega" && i.parent_id === parentId && i.mega_column_title === columnTitle
          ? { ...i, _deleted: true }
          : i
      )
    );
    dirty();
  };

  /* ── Footer actions ── */

  const addFooterLink = (location: "footer_quick" | "footer_legal") => {
    const list = location === "footer_quick" ? footerQuick : footerLegal;
    setItems((prev) => [
      ...prev,
      {
        id: genId(),
        location,
        parent_id: null,
        label: "",
        href: "/",
        icon_name: null,
        mega_column_title: null,
        mega_column_icon: null,
        is_visible: true,
        sort_order: nextOrder(list),
        _isNew: true,
      },
    ]);
    dirty();
  };

  /* ── Save ── */

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMessage("");
    const supabase = createClient();

    try {
      // Delete
      const toDelete = items.filter((i) => i._deleted && !i._isNew);
      if (toDelete.length > 0) {
        // Delete mega items first (children), then parents
        const megaDel = toDelete.filter((i) => i.location === "navbar_mega").map((i) => i.id);
        const otherDel = toDelete.filter((i) => i.location !== "navbar_mega").map((i) => i.id);
        if (megaDel.length > 0) {
          const { error } = await supabase.from("navigation_items").delete().in("id", megaDel);
          if (error) throw error;
        }
        if (otherDel.length > 0) {
          const { error } = await supabase.from("navigation_items").delete().in("id", otherDel);
          if (error) throw error;
        }
      }

      const active = items.filter((i) => !i._deleted);

      // Insert new
      const newItems = active.filter((i) => i._isNew);
      // We need to insert parents first so mega items can reference them
      const newParents = newItems.filter((i) => isTopNavLocation(i.location));
      const newOther = newItems.filter((i) => !isTopNavLocation(i.location) && i.location !== "navbar_mega");
      const newMega = newItems.filter((i) => i.location === "navbar_mega");

      // Insert navbar parents
      const parentIdMap = new Map<string, string>();
      for (const item of newParents) {
        const { data, error } = await supabase
          .from("navigation_items")
          .insert({
            // New top-nav items always persist with the canonical "navbar" location.
            location: "navbar",
            parent_id: null,
            label: item.label,
            href: item.href,
            icon_name: item.icon_name,
            mega_column_title: item.mega_column_title,
            mega_column_icon: item.mega_column_icon,
            is_visible: item.is_visible,
            sort_order: item.sort_order,
          })
          .select("id")
          .single();
        if (error) throw error;
        parentIdMap.set(item.id, data.id);
      }

      // Insert mega items (resolve parent_id)
      for (const item of newMega) {
        const realParentId = parentIdMap.get(item.parent_id!) || item.parent_id;
        const { error } = await supabase.from("navigation_items").insert({
          location: item.location,
          parent_id: realParentId,
          label: item.label,
          href: item.href,
          icon_name: item.icon_name,
          mega_column_title: item.mega_column_title,
          mega_column_icon: item.mega_column_icon,
          is_visible: item.is_visible,
          sort_order: item.sort_order,
        });
        if (error) throw error;
      }

      // Insert other (footer)
      if (newOther.length > 0) {
        const { error } = await supabase.from("navigation_items").insert(
          newOther.map(({ id, _isNew, _deleted, ...rest }) => rest)
        );
        if (error) throw error;
      }

      // Update existing
      const existing = active.filter((i) => !i._isNew);
      for (const item of existing) {
        const { error } = await supabase
          .from("navigation_items")
          .update({
            label: item.label,
            href: item.href,
            icon_name: item.icon_name,
            mega_column_title: item.mega_column_title,
            mega_column_icon: item.mega_column_icon,
            is_visible: item.is_visible,
            sort_order: item.sort_order,
          })
          .eq("id", item.id);
        if (error) throw error;
      }

      // Re-fetch clean state
      const { data: fresh } = await supabase
        .from("navigation_items")
        .select("*")
        .order("sort_order", { ascending: true });
      if (fresh) setItems(fresh);

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err: unknown) {
      setSaveStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Save failed");
    }
  };

  /* ── Render helpers ── */

  const toggleExpand = (id: string) =>
    setExpandedNavbar((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <div className="space-y-8 pb-20">
      {/* ═══ NAVBAR ═══ */}
      <section>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-primary">Navbar Links</h2>
            <p className="mt-1 text-xs text-tertiary">
              Top navigation of the public site. Legacy{" "}
              <span className="font-mono">navbar_top</span> rows are managed here too; new links save
              as <span className="font-mono">navbar</span>.
            </p>
          </div>
          <Button size="sm" color="primary" iconLeading={Plus} onClick={addNavbarLink} className="shrink-0">
            Add Link
          </Button>
        </div>

        <div className="space-y-2">
          {navbarItems.length === 0 && (
            <div className="rounded-xl bg-primary p-8 text-center text-sm text-tertiary ring-1 ring-secondary">
              No navbar links yet. Add one above.
            </div>
          )}
          {navbarItems.map((item, idx) => {
            const hasMega = isMegaMenu(item.id);
            const isExpanded = expandedNavbar.includes(item.id);
            const columns = hasMega ? getMegaColumns(item.id) : [];

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary"
              >
                {/* ─ Navbar link row ─ */}
                <div className="flex items-center gap-2 px-4 py-3">
                  {/* Reorder */}
                  <div className="flex w-7 shrink-0 flex-col gap-0.5">
                    <ButtonUtility
                      size="xs"
                      color="tertiary"
                      icon={ArrowUp}
                      tooltip="Move up"
                      isDisabled={idx === 0}
                      onClick={() => swapOrder(navbarItems, idx, "up")}
                      className="p-0.5"
                    />
                    <ButtonUtility
                      size="xs"
                      color="tertiary"
                      icon={ArrowDown}
                      tooltip="Move down"
                      isDisabled={idx === navbarItems.length - 1}
                      onClick={() => swapOrder(navbarItems, idx, "down")}
                      className="p-0.5"
                    />
                  </div>

                  {/* Label + href + type — uniform grid */}
                  <div className="grid flex-1 grid-cols-[1fr_1fr_auto] items-center gap-2">
                    <Input
                      size="sm"
                      aria-label="Label"
                      placeholder="Label"
                      value={item.label}
                      onChange={(value) => updateItem(item.id, "label", value)}
                    />
                    <Input
                      size="sm"
                      aria-label="Path"
                      placeholder="/path"
                      value={item.href}
                      onChange={(value) => updateItem(item.id, "href", value)}
                    />
                    <Button
                      size="sm"
                      color="secondary"
                      iconLeading={hasMega ? LayoutGrid01 : Link01}
                      onClick={() => {
                        if (hasMega) convertToDirectLink(item.id);
                        else convertToMega(item.id);
                      }}
                      className="w-28"
                    >
                      {hasMega ? "Menu" : "Link"}
                    </Button>
                  </div>

                  {/* Visibility */}
                  <ButtonUtility
                    size="sm"
                    color="tertiary"
                    icon={item.is_visible ? Eye : EyeOff}
                    tooltip={item.is_visible ? "Visible — click to hide" : "Hidden — click to show"}
                    onClick={() => updateItem(item.id, "is_visible", !item.is_visible)}
                    className={cx(item.is_visible && "text-fg-success-primary hover:text-fg-success-primary")}
                  />

                  {/* Delete */}
                  <ButtonUtility
                    size="sm"
                    color="tertiary"
                    icon={Trash01}
                    tooltip="Delete link"
                    onClick={() => deleteItem(item.id)}
                  />

                  {/* Expand mega (always reserve space) */}
                  <div className="flex w-8 justify-center">
                    {hasMega && (
                      <ButtonUtility
                        size="sm"
                        color="tertiary"
                        icon={isExpanded ? ChevronDown : ChevronRight}
                        tooltip={isExpanded ? "Collapse menu" : "Expand menu"}
                        onClick={() => toggleExpand(item.id)}
                      />
                    )}
                  </div>
                </div>

                {/* ─ Mega menu columns ─ */}
                {hasMega && isExpanded && (
                  <div className="space-y-4 border-t border-secondary bg-secondary px-4 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-wider text-quaternary uppercase">
                        Menu Columns
                      </span>
                      <Button
                        size="sm"
                        color="link-color"
                        iconLeading={Plus}
                        onClick={() => addMegaColumn(item.id)}
                      >
                        Add Column
                      </Button>
                    </div>

                    {columns.length === 0 && (
                      <p className="text-sm text-tertiary">No columns yet.</p>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {columns.map((col) => (
                        <div
                          key={col.title}
                          className="space-y-3 rounded-lg bg-primary p-3 shadow-xs ring-1 ring-secondary"
                        >
                          {/* Column header */}
                          <div className="space-y-2">
                            <Input
                              size="sm"
                              aria-label="Column title"
                              placeholder="Column Title"
                              value={col.title}
                              onChange={(value) => renameColumn(item.id, col.title, value)}
                              inputClassName="font-semibold"
                            />
                            <Input
                              size="sm"
                              aria-label="Column icon"
                              placeholder="Icon (e.g. Cloud)"
                              value={col.icon ?? ""}
                              onChange={(value) => setColumnIcon(item.id, col.title, value)}
                            />
                          </div>

                          {/* Column links */}
                          <div className="space-y-1.5">
                            {col.links.map((link) => (
                              <div key={link.id} className="flex items-center gap-1.5">
                                <div className="flex-1 space-y-1">
                                  <Input
                                    size="sm"
                                    aria-label="Link label"
                                    placeholder="Link label"
                                    value={link.label}
                                    onChange={(value) => updateItem(link.id, "label", value)}
                                  />
                                  <Input
                                    size="sm"
                                    aria-label="Link path"
                                    placeholder="/path"
                                    value={link.href}
                                    onChange={(value) => updateItem(link.id, "href", value)}
                                    inputClassName="font-mono text-xs"
                                  />
                                </div>
                                <ButtonUtility
                                  size="xs"
                                  color="tertiary"
                                  icon={Trash01}
                                  tooltip="Delete link"
                                  onClick={() => deleteItem(link.id)}
                                  className="shrink-0"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Column actions */}
                          <div className="flex items-center justify-between pt-1">
                            <Button
                              size="sm"
                              color="link-color"
                              iconLeading={Plus}
                              onClick={() => addMegaLink(item.id, col.title, col.icon)}
                            >
                              Add Link
                            </Button>
                            <Button
                              size="sm"
                              color="link-destructive"
                              onClick={() => deleteColumn(item.id, col.title)}
                            >
                              Remove Column
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-primary">Footer Quick Links</h2>
          <p className="mt-1 text-xs text-tertiary">
            Toggle which navbar items appear in the footer Quick Links column.
          </p>
        </div>

        <div className="mb-4 rounded-lg bg-secondary px-4 py-3 text-xs leading-relaxed text-tertiary">
          <p>
            Toggle which items appear in the footer. For items with{" "}
            <strong className="font-semibold text-secondary">menus</strong>, you can separately
            control the Quick Link and the dropdown accordion.
          </p>
        </div>

        {/* Navbar items with footer toggle */}
        <div className="mb-4 overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
          {navbarItems.map((navItem) => {
            const hasMega = isMegaMenu(navItem.id);
            const hasFooterEntry = footerQuick.some(
              (fq) => fq.href === navItem.href && fq.label === navItem.label
            );

            const toggleFooter = () => {
              if (hasFooterEntry) {
                const match = items.find(
                  (i) => i.location === "footer_quick" && i.href === navItem.href && i.label === navItem.label && !i._deleted
                );
                if (match) deleteItem(match.id);
              } else {
                setItems((prev) => [
                  ...prev,
                  {
                    id: genId(),
                    location: "footer_quick",
                    parent_id: null,
                    label: navItem.label,
                    href: navItem.href,
                    icon_name: null,
                    mega_column_title: null,
                    mega_column_icon: null,
                    is_visible: true,
                    sort_order: nextOrder(footerQuick),
                    _isNew: true,
                  },
                ]);
                dirty();
              }
            };

            const megaExcluded = hasMega ? isMegaExcludedFromFooter(navItem.id) : false;

            return (
              <div
                key={`ft-${navItem.id}`}
                className="flex items-center justify-between border-b border-secondary px-4 py-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-primary">{navItem.label}</span>
                  {hasMega && (
                    <Badge size="sm" color="purple">
                      Menu
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  {hasMega && (
                    <Toggle
                      size="sm"
                      slim
                      label="Dropdown"
                      isSelected={!megaExcluded}
                      onChange={() => toggleMegaFooterDropdown(navItem)}
                    />
                  )}
                  <Toggle
                    size="sm"
                    slim
                    label="Quick Link"
                    isSelected={hasFooterEntry}
                    onChange={toggleFooter}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Extra footer-only links */}
        {(() => {
          const extraLinks = footerQuick.filter(
            (fq) => !navbarItems.some((nav) => nav.href === fq.href && nav.label === fq.label)
          );
          if (extraLinks.length === 0) return null;
          return (
            <div className="mb-3">
              <p className="mb-2 text-xs text-tertiary">Additional footer-only links:</p>
              {renderSimpleList(extraLinks, "footer_quick")}
            </div>
          );
        })()}

        <Button
          size="sm"
          color="link-color"
          iconLeading={Plus}
          onClick={() => addFooterLink("footer_quick")}
          className="mb-6"
        >
          Add Footer-Only Link
        </Button>
      </section>

      {/* ═══ FOOTER LEGAL LINKS ═══ */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Footer Legal Links</h2>
          <Button size="sm" color="primary" iconLeading={Plus} onClick={() => addFooterLink("footer_legal")}>
            Add Link
          </Button>
        </div>
        {renderSimpleList(footerLegal, "footer_legal")}
      </section>

      {/* ═══ SAVE BAR ═══ */}
      <div className="sticky bottom-0 z-30 flex items-center justify-end gap-4 border-t border-secondary bg-primary py-4">
        <div className="min-h-6">
          {saveStatus === "error" && errorMessage && (
            <p className="flex items-center gap-1.5 text-sm text-error-primary">
              <AlertCircle className="size-4" />
              {errorMessage}
            </p>
          )}
          {saveStatus === "saved" && (
            <p className="flex items-center gap-1.5 text-sm text-success-primary">
              <Check className="size-4" />
              All changes saved
            </p>
          )}
        </div>
        <Button
          size="md"
          color="primary"
          iconLeading={Save01}
          isLoading={saveStatus === "saving"}
          showTextWhileLoading
          onClick={handleSave}
        >
          {saveStatus === "saving" ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );

  /* ── Simple link list renderer (footer sections) ── */
  function renderSimpleList(list: NavItem[], location: string) {
    if (list.length === 0) {
      return (
        <div className="rounded-xl bg-primary p-6 text-center text-sm text-tertiary ring-1 ring-secondary">
          No links yet.
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
        {list.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-center gap-3 border-b border-secondary px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary"
          >
            <div className="flex shrink-0 flex-col gap-0.5">
              <ButtonUtility
                size="xs"
                color="tertiary"
                icon={ArrowUp}
                tooltip="Move up"
                isDisabled={idx === 0}
                onClick={() => swapOrder(list, idx, "up")}
                className="p-0.5"
              />
              <ButtonUtility
                size="xs"
                color="tertiary"
                icon={ArrowDown}
                tooltip="Move down"
                isDisabled={idx === list.length - 1}
                onClick={() => swapOrder(list, idx, "down")}
                className="p-0.5"
              />
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3">
              <Input
                size="sm"
                aria-label="Label"
                placeholder="Label"
                value={item.label}
                onChange={(value) => updateItem(item.id, "label", value)}
              />
              <Input
                size="sm"
                aria-label="Path"
                placeholder="/path"
                value={item.href}
                onChange={(value) => updateItem(item.id, "href", value)}
              />
            </div>
            <ButtonUtility
              size="sm"
              color="tertiary"
              icon={item.is_visible ? Eye : EyeOff}
              tooltip={item.is_visible ? "Visible — click to hide" : "Hidden — click to show"}
              onClick={() => updateItem(item.id, "is_visible", !item.is_visible)}
              className={cx(item.is_visible && "text-fg-success-primary hover:text-fg-success-primary")}
            />
            <ButtonUtility
              size="sm"
              color="tertiary"
              icon={Trash01}
              tooltip="Delete link"
              onClick={() => deleteItem(item.id)}
            />
          </div>
        ))}
      </div>
    );
  }
}
