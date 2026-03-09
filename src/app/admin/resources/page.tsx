"use client";

import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock, LogOut, Plus, Pencil, Trash2, Save, X,
  FileText, BookOpen, GraduationCap, Code,
} from "lucide-react";

interface Resource {
  _id: string;
  title: string;
  description: string;
  category: string;
  pdfUrl?: string;
  coverImage?: string;
  published: boolean;
  comingSoon: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { id: "white-papers", label: "White Papers", icon: FileText },
  { id: "case-studies", label: "Case Studies", icon: GraduationCap },
  { id: "architecture-guides", label: "Architecture Guides", icon: Code },
  { id: "technical-docs", label: "Technical Docs", icon: BookOpen },
];

const emptyResource = {
  title: "",
  description: "",
  category: "white-papers",
  pdfUrl: "",
  coverImage: "",
  published: true,
  comingSoon: false,
};

export default function AdminResourcesPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [editing, setEditing] = useState<Partial<Resource> | null>(null);
  const [loading, setLoading] = useState(false);

  const adminPassword = authenticated ? password : "";

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
      } else {
        setAuthError("Invalid password");
      }
    } catch {
      setAuthError("Connection error");
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resources");
      if (res.ok) {
        setResources(await res.json());
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) fetchResources();
  }, [authenticated]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const isNew = !editing._id;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch("/api/resources", {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify(editing),
      });
      if (res.ok) {
        setEditing(null);
        fetchResources();
      }
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    try {
      await fetch(`/api/resources?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": adminPassword },
      });
      fetchResources();
    } catch {
      /* ignore */
    }
  };

  /* ── Login Screen ──────────────────────────────────────────────────────── */
  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 w-full max-w-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Access</h1>
              <p className="text-xs text-slate-400">Resource Management</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 transition-all"
            />
            {authError && <p className="text-xs text-red-400">{authError}</p>}
            <button type="submit" className="btn-primary w-full justify-center">
              <Lock className="h-4 w-4" />
              <span>Authenticate</span>
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  /* ── Admin Dashboard ───────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen pt-24 lg:pt-28 pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Resource Manager</h1>
            <p className="text-sm text-slate-400 mt-1">Create, edit, and manage resources</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditing({ ...emptyResource })}
              className="btn-primary text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Resource</span>
            </button>
            <button
              onClick={() => {
                setAuthenticated(false);
                setPassword("");
              }}
              className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Resource List */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading...</div>
        ) : resources.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-2">No resources in database yet.</p>
            <p className="text-xs text-slate-500">
              The resources page currently uses static data. Add resources here to manage them from the database.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((r) => (
              <div
                key={r._id}
                className="glass-card rounded-xl p-5 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">{r.title}</h3>
                    {r.comingSoon && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Coming Soon
                      </span>
                    )}
                    {!r.published && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        Unpublished
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{r.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                      {r.category.replace(/-/g, " ")}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {new Date(r.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditing({ ...r })}
                    className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-all"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit/Create Modal */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setEditing(null)}
              />
              <motion.form
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onSubmit={handleSave}
                className="relative glass-card rounded-2xl p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">
                    {editing._id ? "Edit Resource" : "New Resource"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Title</label>
                    <input
                      type="text"
                      required
                      value={editing.title || ""}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                      className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={editing.description || ""}
                      onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                      className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Category</label>
                    <select
                      value={editing.category || "white-papers"}
                      onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                      className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-all"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-[#0a1020]">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">PDF URL (path or full URL)</label>
                    <input
                      type="text"
                      value={editing.pdfUrl || ""}
                      onChange={(e) => setEditing({ ...editing, pdfUrl: e.target.value })}
                      placeholder="/resources/my-document.pdf"
                      className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Cover Image URL</label>
                    <input
                      type="text"
                      value={editing.coverImage || ""}
                      onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })}
                      placeholder="/resources/covers/my-cover.png"
                      className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editing.published ?? true}
                        onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                        className="accent-sky-500"
                      />
                      Published
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editing.comingSoon ?? false}
                        onChange={(e) => setEditing({ ...editing, comingSoon: e.target.checked })}
                        className="accent-sky-500"
                      />
                      Coming Soon
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-sm text-slate-400 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-sm">
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
