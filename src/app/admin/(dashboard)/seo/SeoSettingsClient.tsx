"use client";

import { type FC, type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BarChartSquare02,
  Building07,
  Check,
  CpuChip01,
  InfoCircle,
  LineChartUp03,
  MarkerPin01,
  Plus,
  Save01,
  SearchLg,
  Share07,
  Trash01,
} from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input, InputBase } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Toggle } from "@/components/base/toggle/toggle";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/utils/cx";

/* ─────────────────────────────────────────────────────────────── */

export interface SeoFormValues {
  // General
  site_name: string;
  default_title: string;
  title_template: string;
  default_description: string;
  keywords: string; // comma-separated in the UI
  // Organization / LocalBusiness
  legal_name: string;
  founding_date: string;
  telephone: string;
  email: string;
  street_address: string;
  address_locality: string;
  address_region: string;
  postal_code: string;
  address_country: string;
  latitude: string;
  longitude: string;
  hours_text: string;
  opens: string;
  closes: string;
  days: string[];
  // Social profiles (schema sameAs)
  social: string[];
  // Analytics
  gtm_id: string;
  ga4_id: string;
  // Search Console verification
  google_verification: string;
  bing_verification: string;
  // AI crawlers
  block_training_scrapers: boolean;
  // Branding / share defaults
  favicon_url: string;
  default_og_image: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DESC_LIMIT = 155;

/* ─────────────────────────────────────────────────────────────── */

export default function SeoSettingsClient({
  pageId,
  sectionId,
  initialValues,
}: {
  pageId: string | null;
  sectionId: string | null;
  initialValues: SeoFormValues;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [values, setValues] = useState<SeoFormValues>(initialValues);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = <K extends keyof SeoFormValues>(key: K, value: SeoFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (saveStatus === "saved") setSaveStatus("idle");
  };

  const toggleDay = (day: string) => {
    set(
      "days",
      values.days.includes(day)
        ? values.days.filter((d) => d !== day)
        : [...values.days, day],
    );
  };

  const setSocial = (index: number, url: string) => {
    const next = [...values.social];
    next[index] = url;
    set("social", next);
  };

  const addSocial = () => set("social", [...values.social, ""]);
  const removeSocial = (index: number) =>
    set("social", values.social.filter((_, i) => i !== index));

  /* ── Build the persisted object (snake_case keys getSeoConfig reads) ── */
  const buildContent = (): Record<string, any> => {
    const keywords = values.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    const social = values.social.map((s) => s.trim()).filter(Boolean);
    const days = WEEK_DAYS.filter((d) => values.days.includes(d)); // canonical order
    const latitude = parseFloat(values.latitude);
    const longitude = parseFloat(values.longitude);

    return {
      site_name: values.site_name.trim(),
      default_title: values.default_title.trim(),
      title_template: values.title_template.trim(),
      default_description: values.default_description.trim(),
      keywords,
      organization: {
        legal_name: values.legal_name.trim(),
        founding_date: values.founding_date.trim(),
        telephone: values.telephone.trim(),
        email: values.email.trim(),
        street_address: values.street_address.trim(),
        address_locality: values.address_locality.trim(),
        address_region: values.address_region.trim(),
        postal_code: values.postal_code.trim(),
        address_country: values.address_country.trim(),
        latitude: Number.isFinite(latitude) ? latitude : null,
        longitude: Number.isFinite(longitude) ? longitude : null,
        hours_text: values.hours_text.trim(),
        opens: values.opens.trim(),
        closes: values.closes.trim(),
        days,
      },
      social,
      gtm_id: values.gtm_id.trim() || null,
      ga4_id: values.ga4_id.trim() || null,
      google_verification: values.google_verification.trim() || null,
      bing_verification: values.bing_verification.trim() || null,
      block_training_scrapers: values.block_training_scrapers,
      favicon_url: values.favicon_url.trim() || null,
      default_og_image: values.default_og_image.trim() || null,
    };
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMsg("");
    try {
      // Resolve the site-settings page id (create the page if it does not exist yet).
      let settingsPageId = pageId;
      if (!settingsPageId) {
        const { data: existing } = await supabase
          .from("pages")
          .select("id")
          .eq("slug", "site-settings")
          .maybeSingle();
        if (existing?.id) {
          settingsPageId = existing.id;
        } else {
          const { data: created, error: createErr } = await supabase
            .from("pages")
            .insert({
              slug: "site-settings",
              title: "Site Settings",
              page_type: "settings",
              is_published: false,
            })
            .select("id")
            .single();
          if (createErr) throw createErr;
          settingsPageId = created.id;
        }
      }

      const content = buildContent();

      if (sectionId) {
        const { error } = await supabase
          .from("page_sections")
          .update({ content, updated_at: new Date().toISOString() })
          .eq("id", sectionId);
        if (error) throw error;
      } else {
        // No existing seo section — insert one (idempotent against re-saves via section id lookup).
        const { data: existingSection } = await supabase
          .from("page_sections")
          .select("id")
          .eq("page_id", settingsPageId)
          .eq("section_key", "seo")
          .maybeSingle();

        if (existingSection?.id) {
          const { error } = await supabase
            .from("page_sections")
            .update({ content, updated_at: new Date().toISOString() })
            .eq("id", existingSection.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("page_sections").insert({
            page_id: settingsPageId,
            section_key: "seo",
            section_type: "custom",
            content,
            sort_order: 999,
            is_visible: true,
          });
          if (error) throw error;
        }
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
      router.refresh();
    } catch (err: unknown) {
      setSaveStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
    }
  };

  const descLen = values.default_description.length;
  const descOver = descLen > DESC_LIMIT;

  /* ═══ RENDER ═══ */

  return (
    <div className="max-w-3xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <FeaturedIcon color="brand" theme="modern" size="md" icon={SearchLg} />
          <div>
            <h1 className="text-display-xs font-semibold text-primary">SEO &amp; Analytics</h1>
            <p className="mt-0.5 text-sm text-tertiary">
              Site-wide search, structured data, and analytics settings.
            </p>
          </div>
        </div>
        <Button
          size="md"
          iconLeading={Save01}
          isLoading={saveStatus === "saving"}
          showTextWhileLoading
          onClick={handleSave}
          className="shrink-0"
        >
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Settings"}
        </Button>
      </div>

      {/* Status banners */}
      {saveStatus === "error" && errorMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-error-primary p-3 text-sm text-error-primary ring-1 ring-error_subtle ring-inset">
          <AlertCircle className="size-4 shrink-0" /> {errorMsg}
        </div>
      )}
      {saveStatus === "saved" && (
        <div className="flex items-center gap-2 rounded-lg bg-utility-green-50 p-3 text-sm text-utility-green-700 ring-1 ring-utility-green-200 ring-inset">
          <Check className="size-4 shrink-0 text-utility-green-500" /> Settings saved.
        </div>
      )}

      {/* Per-page note */}
      <div className="flex items-start gap-2.5 rounded-lg bg-secondary p-3.5 text-sm text-tertiary ring-1 ring-secondary ring-inset">
        <InfoCircle className="mt-0.5 size-4 shrink-0 text-fg-quaternary" />
        <span>
          These settings power site-wide metadata, JSON-LD structured data, robots
          rules, and analytics. Per-page titles and descriptions are edited in each
          page&rsquo;s <strong className="font-medium text-secondary">CMS editor</strong> under Page Settings.
        </span>
      </div>

      {/* ── General ── */}
      <Card icon={SearchLg} title="General" description="Default titles, description, and keywords.">
        <Input
          label="Site Name"
          value={values.site_name}
          onChange={(v) => set("site_name", v)}
          placeholder="International Computer Exchange"
        />
        <Input
          label="Default Title"
          value={values.default_title}
          onChange={(v) => set("default_title", v)}
          hint="Used on the home page and as the fallback browser title."
        />
        <Input
          label="Title Template"
          value={values.title_template}
          onChange={(v) => set("title_template", v)}
          hint="%s is replaced by each page's title, e.g. %s | International Computer Exchange"
        />
        <Input
          label="Default favicon URL"
          value={values.favicon_url}
          onChange={(v) => set("favicon_url", v)}
          placeholder="/icon.svg or https://..."
          hint="Site-wide favicon. Individual pages can override this in the CMS page editor."
        />
        <Input
          label="Default Open Graph / share image"
          value={values.default_og_image}
          onChange={(v) => set("default_og_image", v)}
          placeholder="https://... or /images/..."
          hint="Used for Twitter, Discord, and Open Graph embeds when a page has no share image."
        />
        <div>
          <TextArea
            label="Default Description"
            rows={3}
            value={values.default_description}
            onChange={(v) => set("default_description", v)}
            hint="Fallback meta description for pages without their own."
          />
          <p className={cx("mt-1.5 text-xs", descOver ? "text-error-primary" : "text-quaternary")}>
            {descLen} / {DESC_LIMIT} characters{descOver ? " — over the recommended limit" : ""}
          </p>
        </div>
        <Input
          label="Keywords"
          value={values.keywords}
          onChange={(v) => set("keywords", v)}
          hint="Comma-separated. Used for the keywords meta tag."
        />
      </Card>

      {/* ── Organization / LocalBusiness ── */}
      <Card
        icon={Building07}
        title="Organization"
        description="Legal identity used in Organization / LocalBusiness structured data."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Legal Name" value={values.legal_name} onChange={(v) => set("legal_name", v)} />
          <Input
            label="Founding Date"
            value={values.founding_date}
            onChange={(v) => set("founding_date", v)}
            hint="Year or ISO date, e.g. 1990"
          />
          <Input label="Telephone" value={values.telephone} onChange={(v) => set("telephone", v)} placeholder="+1-800-786-9188" />
          <Input label="Email" type="email" value={values.email} onChange={(v) => set("email", v)} />
        </div>
      </Card>

      {/* ── Address & Hours ── */}
      <Card
        icon={MarkerPin01}
        title="Address &amp; Hours"
        description="Postal address, geo-coordinates, and opening hours for local SEO."
      >
        <Input label="Street Address" value={values.street_address} onChange={(v) => set("street_address", v)} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="City / Locality" value={values.address_locality} onChange={(v) => set("address_locality", v)} />
          <Input label="Region / State" value={values.address_region} onChange={(v) => set("address_region", v)} />
          <Input label="Postal Code" value={values.postal_code} onChange={(v) => set("postal_code", v)} />
          <Input
            label="Country"
            value={values.address_country}
            onChange={(v) => set("address_country", v)}
            hint="ISO country code, e.g. US"
          />
          <Input
            label="Latitude"
            value={values.latitude}
            onChange={(v) => set("latitude", v)}
            inputClassName="font-mono text-sm"
          />
          <Input
            label="Longitude"
            value={values.longitude}
            onChange={(v) => set("longitude", v)}
            inputClassName="font-mono text-sm"
          />
        </div>
        <Input
          label="Hours (display text)"
          value={values.hours_text}
          onChange={(v) => set("hours_text", v)}
          hint="Human-readable line shown on the site, e.g. Mon – Fri, 9:00 AM – 5:00 PM ET"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Opens"
            type="time"
            value={values.opens}
            onChange={(v) => set("opens", v)}
            hint="24h format, e.g. 09:00"
          />
          <Input
            label="Closes"
            type="time"
            value={values.closes}
            onChange={(v) => set("closes", v)}
            hint="24h format, e.g. 17:00"
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-secondary">Open Days</p>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => {
              const active = values.days.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  aria-pressed={active}
                  className={cx(
                    "cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition-colors outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
                    active
                      ? "bg-brand-solid text-white ring-transparent hover:bg-brand-solid_hover"
                      : "bg-primary text-secondary ring-secondary hover:bg-primary_hover",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── Social profiles (sameAs) ── */}
      <Card
        icon={Share07}
        title="Social Profiles"
        description="Profile URLs published as schema.org sameAs on the Organization graph."
      >
        {values.social.length === 0 && (
          <p className="text-sm text-tertiary">No social profiles added yet.</p>
        )}
        <div className="space-y-2.5">
          {values.social.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <InputBase
                aria-label={`Social profile URL ${i + 1}`}
                value={url}
                onChange={(e) => setSocial(i, e.target.value)}
                placeholder="https://www.linkedin.com/company/..."
              />
              <ButtonUtility
                size="sm"
                color="tertiary"
                icon={Trash01}
                tooltip="Remove profile"
                className="shrink-0"
                onClick={() => removeSocial(i)}
              />
            </div>
          ))}
        </div>
        <Button size="sm" color="secondary" iconLeading={Plus} onClick={addSocial}>
          Add Profile
        </Button>
      </Card>

      {/* ── Analytics ── */}
      <Card
        icon={BarChartSquare02}
        title="Analytics"
        description="Google Tag Manager and GA4. Leave blank to disable — nothing is injected when empty."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="GTM Container ID"
            value={values.gtm_id}
            onChange={(v) => set("gtm_id", v)}
            placeholder="GTM-XXXXXXX"
            inputClassName="font-mono text-sm"
            hint="Leave blank to disable Tag Manager."
          />
          <Input
            label="GA4 Measurement ID"
            value={values.ga4_id}
            onChange={(v) => set("ga4_id", v)}
            placeholder="G-XXXXXXXXXX"
            inputClassName="font-mono text-sm"
            hint="Leave blank to disable GA4."
          />
        </div>
      </Card>

      {/* ── Search Console verification ── */}
      <Card
        icon={LineChartUp03}
        title="Search Console Verification"
        description="Site ownership verification tokens rendered into the document head."
      >
        <Input
          label="Google Verification"
          value={values.google_verification}
          onChange={(v) => set("google_verification", v)}
          inputClassName="font-mono text-sm"
          hint="The content value of the google-site-verification meta tag."
        />
        <Input
          label="Bing Verification"
          value={values.bing_verification}
          onChange={(v) => set("bing_verification", v)}
          inputClassName="font-mono text-sm"
          hint="The content value of the msvalidate.01 meta tag."
        />
      </Card>

      {/* ── AI crawlers ── */}
      <Card
        icon={CpuChip01}
        title="AI Crawlers"
        description="Control how AI model-training crawlers are treated in robots rules."
      >
        <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary ring-inset">
          <Toggle
            size="md"
            label="Block AI training scrapers"
            isSelected={values.block_training_scrapers}
            onChange={(v) => set("block_training_scrapers", v)}
            hint={
              <span className="mt-1 block max-w-prose text-sm text-tertiary">
                When on, robots.txt disallows training crawlers (GPTBot, ClaudeBot,
                CCBot, Google-Extended, Applebot-Extended, Bytespider, and similar)
                while still allowing live-retrieval search agents (OAI-SearchBot,
                ChatGPT-User, PerplexityBot, Googlebot, and Bingbot) so your content
                stays discoverable in AI search answers.
              </span>
            }
          />
        </div>
      </Card>

      {/* Bottom save */}
      <div className="flex justify-end pt-2">
        <Button
          size="md"
          iconLeading={Save01}
          isLoading={saveStatus === "saving"}
          showTextWhileLoading
          onClick={handleSave}
        >
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

/* ── Sectioned card ── */

function Card({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: FC<{ className?: string }>;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
      <div className="flex items-start gap-3 border-b border-secondary px-5 py-4">
        <FeaturedIcon icon={Icon} color="gray" theme="modern" size="sm" className="shrink-0" />
        <div>
          <h2 className="text-sm font-semibold text-primary">{title}</h2>
          <p className="mt-0.5 text-xs text-tertiary">{description}</p>
        </div>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}
