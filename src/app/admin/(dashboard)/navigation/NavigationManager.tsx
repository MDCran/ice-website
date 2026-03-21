"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Link as LinkIcon,
  LayoutGrid,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

  // Top-level navbar items (location=navbar, no parent)
  const navbarItems = items
    .filter((i) => i.location === "navbar" && !i._deleted)
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
      const newParents = newItems.filter((i) => i.location === "navbar");
      const newOther = newItems.filter((i) => i.location !== "navbar" && i.location !== "navbar_mega");
      const newMega = newItems.filter((i) => i.location === "navbar_mega");

      // Insert navbar parents
      const parentIdMap = new Map<string, string>();
      for (const item of newParents) {
        const { data, error } = await supabase
          .from("navigation_items")
          .insert({
            location: item.location,
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

  const inputCls =
    "w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 admin-text text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all";

  return (
    <div className="space-y-8 pb-20">
      {/* ═══ NAVBAR ═══ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold admin-text">Navbar Links</h2>
          <button
            onClick={addNavbarLink}
            className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus size={14} />
            Add Link
          </button>
        </div>

        <div className="space-y-2">
          {navbarItems.length === 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center text-slate-500 text-sm">
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
                className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden"
              >
                {/* ─ Navbar link row ─ */}
                <div className="flex items-center gap-2 px-4 py-3">
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5 shrink-0 w-5">
                    <button
                      onClick={() => swapOrder(navbarItems, idx, "up")}
                      disabled={idx === 0}
                      className="text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => swapOrder(navbarItems, idx, "down")}
                      disabled={idx === navbarItems.length - 1}
                      className="text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>

                  {/* Label + href + type — uniform grid */}
                  <div className="flex-1 grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateItem(item.id, "label", e.target.value)}
                      placeholder="Label"
                      className={inputCls}
                    />
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => updateItem(item.id, "href", e.target.value)}
                      placeholder="/path"
                      className={inputCls}
                    />
                    <button
                      onClick={() => {
                        if (hasMega) convertToDirectLink(item.id);
                        else convertToMega(item.id);
                      }}
                      className={`w-[110px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        hasMega
                          ? "bg-purple-500/15 text-purple-400 hover:bg-purple-500/25"
                          : "bg-white/[0.06] text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {hasMega ? <LayoutGrid size={14} /> : <LinkIcon size={14} />}
                      {hasMega ? "Menu" : "Link"}
                    </button>
                  </div>

                  {/* Visibility */}
                  <button
                    onClick={() => updateItem(item.id, "is_visible", !item.is_visible)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      item.is_visible ? "text-emerald-400 hover:bg-emerald-500/10" : "text-slate-500 hover:bg-white/10"
                    }`}
                  >
                    {item.is_visible ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>

                  {/* Expand mega (always reserve space) */}
                  <div className="w-8 flex justify-center">
                    {hasMega && (
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* ─ Mega menu columns ─ */}
                {hasMega && isExpanded && (
                  <div className="border-t border-white/10 bg-white/[0.01] px-4 py-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Menu Columns
                      </span>
                      <button
                        onClick={() => addMegaColumn(item.id)}
                        className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 cursor-pointer"
                      >
                        <Plus size={12} />
                        Add Column
                      </button>
                    </div>

                    {columns.length === 0 && (
                      <p className="text-sm text-slate-500">No columns yet.</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      {columns.map((col) => (
                        <div
                          key={col.title}
                          className="bg-white/[0.03] border border-white/10 rounded-xl p-3 space-y-3"
                        >
                          {/* Column header */}
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={col.title}
                              onChange={(e) => renameColumn(item.id, col.title, e.target.value)}
                              placeholder="Column Title"
                              className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                            />
                            <input
                              type="text"
                              value={col.icon ?? ""}
                              onChange={(e) => setColumnIcon(item.id, col.title, e.target.value)}
                              placeholder="Icon (e.g. Cloud)"
                              className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                            />
                          </div>

                          {/* Column links */}
                          <div className="space-y-1.5">
                            {col.links.map((link) => (
                              <div key={link.id} className="flex items-center gap-1.5">
                                <div className="flex-1 space-y-1">
                                  <input
                                    type="text"
                                    value={link.label}
                                    onChange={(e) =>
                                      updateItem(link.id, "label", e.target.value)
                                    }
                                    placeholder="Link label"
                                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                                  />
                                  <input
                                    type="text"
                                    value={link.href}
                                    onChange={(e) =>
                                      updateItem(link.id, "href", e.target.value)
                                    }
                                    placeholder="/path"
                                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1 text-slate-400 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                                  />
                                </div>
                                <button
                                  onClick={() => deleteItem(link.id)}
                                  className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Column actions */}
                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={() => addMegaLink(item.id, col.title, col.icon)}
                              className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer"
                            >
                              + Add Link
                            </button>
                            <button
                              onClick={() => deleteColumn(item.id, col.title)}
                              className="text-xs text-red-400/60 hover:text-red-400 cursor-pointer"
                            >
                              Remove Column
                            </button>
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
          <h2 className="text-lg font-semibold admin-text">Footer Quick Links</h2>
          <p className="text-xs text-slate-500 mt-1">Toggle which navbar items appear in the footer Quick Links column.</p>
        </div>

        <div className="bg-sky-500/5 border border-sky-500/15 rounded-xl px-4 py-3 mb-4 text-xs text-slate-400 leading-relaxed">
          <p>Toggle which items appear in the footer. For items with <strong className="text-purple-400">menus</strong>, you can separately control the Quick Link and the dropdown accordion.</p>
        </div>

        {/* Navbar items with footer toggle */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden mb-4">
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
              <div key={`ft-${navItem.id}`} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm admin-text">{navItem.label}</span>
                  {hasMega && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400">
                      Menu
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {hasMega && (
                    <button
                      onClick={() => toggleMegaFooterDropdown(navItem)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !megaExcluded
                          ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15"
                          : "text-slate-500 bg-white/[0.04] hover:bg-white/10"
                      }`}
                      title={!megaExcluded ? "Dropdown showing in footer" : "Dropdown hidden from footer"}
                    >
                      {!megaExcluded ? <Eye size={13} /> : <EyeOff size={13} />}
                      Dropdown
                    </button>
                  )}
                  <button
                    onClick={toggleFooter}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      hasFooterEntry
                        ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15"
                        : "text-slate-500 bg-white/[0.04] hover:bg-white/10"
                    }`}
                    title={hasFooterEntry ? "Quick Link showing in footer" : "Quick Link hidden from footer"}
                  >
                    {hasFooterEntry ? <Eye size={13} /> : <EyeOff size={13} />}
                    Quick Link
                  </button>
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
              <p className="text-xs text-slate-500 mb-2">Additional footer-only links:</p>
              {renderSimpleList(extraLinks, "footer_quick")}
            </div>
          );
        })()}

        <button
          onClick={() => addFooterLink("footer_quick")}
          className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-1 mb-6"
        >
          <Plus size={12} />
          Add Footer-Only Link
        </button>
      </section>

      {/* ═══ FOOTER LEGAL LINKS ═══ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold admin-text">Footer Legal Links</h2>
          <button
            onClick={() => addFooterLink("footer_legal")}
            className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus size={14} />
            Add Link
          </button>
        </div>
        {renderSimpleList(footerLegal, "footer_legal")}
      </section>

      {/* ═══ SAVE BAR ═══ */}
      <div className="sticky bottom-0 z-30 -mx-6 px-6 py-4 flex items-center justify-end gap-4 border-t border-white/10" style={{ background: 'var(--bg-primary)' }}>
        <div className="min-h-[24px]">
          {saveStatus === "error" && errorMessage && (
            <p className="text-red-400 text-sm flex items-center gap-1.5">
              <AlertCircle size={14} />
              {errorMessage}
            </p>
          )}
          {saveStatus === "saved" && (
            <p className="text-emerald-400 text-sm flex items-center gap-1.5">
              <Check size={14} />
              All changes saved
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer"
        >
          {saveStatus === "saving" ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save All Changes
            </>
          )}
        </button>
      </div>
    </div>
  );

  /* ── Simple link list renderer (footer sections) ── */
  function renderSimpleList(list: NavItem[], location: string) {
    if (list.length === 0) {
      return (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center text-slate-500 text-sm">
          No links yet.
        </div>
      );
    }

    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden">
        {list.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                onClick={() => swapOrder(list, idx, "up")}
                disabled={idx === 0}
                className="text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
              >
                <ArrowUp size={12} />
              </button>
              <button
                onClick={() => swapOrder(list, idx, "down")}
                disabled={idx === list.length - 1}
                className="text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
              >
                <ArrowDown size={12} />
              </button>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(item.id, "label", e.target.value)}
                placeholder="Label"
                className={inputCls}
              />
              <input
                type="text"
                value={item.href}
                onChange={(e) => updateItem(item.id, "href", e.target.value)}
                placeholder="/path"
                className={inputCls}
              />
            </div>
            <button
              onClick={() => updateItem(item.id, "is_visible", !item.is_visible)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                item.is_visible ? "text-emerald-400 hover:bg-emerald-500/10" : "text-slate-500 hover:bg-white/10"
              }`}
            >
              {item.is_visible ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
            <button
              onClick={() => deleteItem(item.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    );
  }
}
