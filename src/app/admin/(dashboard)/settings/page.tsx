"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2, Check, AlertCircle, User, Image as ImageIcon } from "lucide-react";
import MediaBrowserModal from "@/components/admin/MediaBrowserModal";

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name ?? "");
        setEmail(profile.email ?? "");
        setAvatarUrl(profile.avatar_url ?? "");
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("admin_profiles")
      .update({
        display_name: displayName.trim(),
        email: email.trim(),
        avatar_url: avatarUrl.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Settings saved.");
      setTimeout(() => setSuccess(""), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
          <User size={20} className="text-sky-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold admin-text">Settings</h1>
          <p className="text-sm text-slate-400">Manage your admin profile</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
          <Check size={16} />
          {success}
        </div>
      )}

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@icesales.com"
            className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Avatar
          </label>
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="w-16 h-16 rounded-xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                <ImageIcon size={24} className="text-slate-500" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setAvatarModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-sm text-slate-300 hover:bg-white/[0.1] hover:border-white/20 transition-all cursor-pointer"
              >
                Browse Files
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl("")}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors cursor-pointer text-left"
                >
                  Remove avatar
                </button>
              )}
            </div>
          </div>
          <MediaBrowserModal
            open={avatarModalOpen}
            onClose={() => setAvatarModalOpen(false)}
            onSelect={(url) => {
              setAvatarUrl(url);
              setAvatarModalOpen(false);
            }}
            accept="image/*"
            title="Select Avatar"
          />
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
