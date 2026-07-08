"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Check, Image01, Save01, User01 } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
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
      <div className="flex h-64 items-center justify-center">
        <LoadingIndicator type="line-spinner" size="md" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8 flex items-center gap-3">
        <FeaturedIcon color="brand" theme="modern" size="md" icon={User01} />
        <div>
          <h1 className="text-display-xs font-semibold text-primary">Settings</h1>
          <p className="text-sm text-tertiary">Manage your admin profile</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-utility-red-50 p-3 text-sm text-utility-red-700 ring-1 ring-utility-red-200 ring-inset">
          <AlertCircle className="size-4 shrink-0 text-utility-red-500" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-utility-green-50 p-3 text-sm text-utility-green-700 ring-1 ring-utility-green-200 ring-inset">
          <Check className="size-4 shrink-0 text-utility-green-500" />
          {success}
        </div>
      )}

      <div className="space-y-6 rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <Input
          label="Display Name"
          placeholder="Your name"
          value={displayName}
          onChange={(value) => setDisplayName(value)}
        />

        <Input
          label="Email"
          type="email"
          placeholder="admin@icesales.com"
          value={email}
          onChange={(value) => setEmail(value)}
        />

        <div>
          <p className="mb-1.5 text-sm font-medium text-secondary">Avatar</p>
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="size-16 rounded-xl object-cover ring-1 ring-secondary"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-xl bg-secondary ring-1 ring-secondary">
                <Image01 className="size-6 text-fg-quaternary" />
              </div>
            )}
            <div className="flex flex-col items-start gap-2">
              <Button
                size="sm"
                color="secondary"
                onClick={() => setAvatarModalOpen(true)}
              >
                Browse Files
              </Button>
              {avatarUrl && (
                <Button
                  size="sm"
                  color="link-destructive"
                  onClick={() => setAvatarUrl("")}
                >
                  Remove avatar
                </Button>
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
          <Button
            size="md"
            color="primary"
            iconLeading={Save01}
            isLoading={saving}
            showTextWhileLoading
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
