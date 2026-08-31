"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  InfoCircle,
  Plus,
  Save01,
  Settings01,
  Trash01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Toggle } from "@/components/base/toggle/toggle";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import {
  SALES_MODULE_LABELS,
  SALES_UPGRADE_CATALOG,
  type SalesEnablementConfig,
  type SalesModuleId,
} from "@/lib/salesEnablement";

type SaveResult =
  | { ok: true; sectionId: string; savedAt: string }
  | { ok: false; error: string };

type SaveAction = (config: SalesEnablementConfig) => Promise<SaveResult>;
type SaveStatus = "idle" | "saving" | "saved" | "error";
type FieldKind = "text" | "textarea" | "url" | "number" | "toggle";
type EditableValue = string | number | boolean;
type EditableItem = Record<string, EditableValue>;
type CollectionField = {
  key: string;
  label: string;
  kind?: FieldKind;
  wide?: boolean;
};

function formatTimestamp(value: string | null): string {
  if (!value) return "Not saved yet";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function SalesEnablementEditor({
  initialConfig,
  initialSectionId,
  initialUpdatedAt,
  onSave,
}: {
  initialConfig: SalesEnablementConfig;
  initialSectionId: string | null;
  initialUpdatedAt: string | null;
  onSave: SaveAction;
}) {
  const [config, setConfig] = useState(initialConfig);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState("");
  const [sectionId, setSectionId] = useState(initialSectionId);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [guideOpen, setGuideOpen] = useState(true);

  const enabledModuleCount = useMemo(
    () => Object.values(config.modules).filter(Boolean).length,
    [config.modules],
  );

  const change = (next: SalesEnablementConfig) => {
    setConfig(next);
    if (saveStatus !== "saving") {
      setSaveStatus("idle");
      setMessage("");
    }
  };

  const setTopLevel = <K extends keyof SalesEnablementConfig>(
    key: K,
    value: SalesEnablementConfig[K],
  ) => change({ ...config, [key]: value });

  const setSection = <K extends keyof SalesEnablementConfig>(
    key: K,
    value: SalesEnablementConfig[K],
  ) => change({ ...config, [key]: value });

  const moveModule = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= config.sectionOrder.length) return;
    const next = [...config.sectionOrder];
    [next[index], next[destination]] = [next[destination], next[index]];
    setTopLevel("sectionOrder", next);
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    setMessage("");
    try {
      const result = await onSave(config);
      if (!result.ok) {
        setSaveStatus("error");
        setMessage(result.error);
        return;
      }
      setSectionId(result.sectionId);
      setUpdatedAt(result.savedAt);
      setSaveStatus("saved");
      setMessage("Sales enablement settings saved and public pages revalidated.");
      window.setTimeout(() => setSaveStatus((current) => (current === "saved" ? "idle" : current)), 3000);
    } catch (error) {
      setSaveStatus("error");
      setMessage(error instanceof Error ? error.message : "The sales configuration could not be saved.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <FeaturedIcon color="brand" theme="modern" size="md" icon={Settings01} />
          <div>
            <h1 className="text-display-xs font-semibold text-primary">Sales Enablement</h1>
            <p className="mt-1 max-w-2xl text-sm text-tertiary">
              Control the live homepage preview, sticky buyer bar, callback dialog, and
              soft-lead form. A clearly labeled draft library preserves the retired buyer-center
              content without presenting it as a live page.
            </p>
            <p className="mt-2 text-xs text-quaternary">
              {sectionId ? `CMS section ${sectionId.slice(0, 8)} · ` : ""}
              Last saved {formatTimestamp(updatedAt)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <Button
            size="md"
            color="secondary"
            onClick={() => setGuideOpen((open) => !open)}
          >
            {guideOpen ? "Hide guide" : "How this works"}
          </Button>
          <Button
            size="md"
            iconLeading={Save01}
            isLoading={saveStatus === "saving"}
            showTextWhileLoading
            onClick={handleSave}
          >
            {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Save changes"}
          </Button>
        </div>
      </header>

      {guideOpen && (
        <section className="overflow-hidden rounded-xl bg-brand-primary_alt/60 ring-1 ring-brand/20">
          <div className="border-b border-brand/15 px-5 py-4">
            <p className="text-xs font-semibold tracking-[0.16em] text-brand-secondary uppercase">What this controls</p>
            <h2 className="mt-1 text-lg font-semibold text-primary">Manage live conversion surfaces</h2>
            <p className="mt-1 max-w-3xl text-sm text-tertiary">
              Sales Enablement is not your CRM or a lead list. It controls what enterprise
              prospects see in the homepage preview and global conversion prompts. The larger
              buyer-center module set below is retained as an unpublished draft library.
            </p>
          </div>
          <div className="grid gap-px bg-brand/15 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["1", "Choose live placements", "Control the homepage preview, sticky buyer bar, and soft-lead form."],
              ["2", "Edit conversion copy", "Update callback, field, consent, confirmation, and CTA wording."],
              ["3", "Maintain drafts", "Keep retired buyer-center content available without implying it is public."],
              ["4", "Save and publish", "Save changes to revalidate the live public placements."],
            ].map(([number, title, description]) => (
              <div key={number} className="bg-primary/70 p-4">
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-solid text-xs font-bold text-white">{number}</span>
                <h3 className="mt-3 text-sm font-semibold text-primary">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-tertiary">{description}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 border-t border-brand/15 px-5 py-3 text-xs text-tertiary sm:flex-row sm:items-center sm:justify-between">
            <span><strong className="font-semibold text-secondary">Recommended first visit:</strong> choose live placements, edit their copy, then save.</span>
            <a href="#sales-global-conversion-surfaces" className="font-semibold text-brand-secondary hover:underline">Jump to live conversion copy →</a>
          </div>
        </section>
      )}

      {message && (
        <div
          role={saveStatus === "error" ? "alert" : "status"}
          className={
            saveStatus === "error"
              ? "flex items-center gap-2 rounded-lg bg-error-primary p-3 text-sm text-error-primary ring-1 ring-error_subtle ring-inset"
              : "flex items-center gap-2 rounded-lg bg-utility-green-50 p-3 text-sm text-utility-green-700 ring-1 ring-utility-green-200 ring-inset"
          }
        >
          {saveStatus === "error" ? (
            <AlertCircle className="size-4 shrink-0" />
          ) : (
            <Check className="size-4 shrink-0" />
          )}
          {message}
        </div>
      )}

      <div className="flex items-start gap-2.5 rounded-lg bg-secondary p-3.5 text-sm text-tertiary ring-1 ring-secondary ring-inset">
        <InfoCircle className="mt-0.5 size-4 shrink-0 text-fg-quaternary" />
        <span>
          Live surfaces are the homepage preview, sticky buyer bar, callback dialog, and
          soft-lead form. Buyer-center modules are an unpublished draft library.
        </span>
      </div>

      <nav aria-label="Sales enablement sections" className="flex flex-wrap gap-2 rounded-xl bg-primary p-3 ring-1 ring-secondary">
        <span className="px-2 py-1.5 text-xs font-semibold text-tertiary">Jump to:</span>
        {[
          ["Controls", "#sales-publication-controls"],
          ["Draft library", "#sales-module-order-and-visibility"],
          ["Edit CTAs", "#sales-global-conversion-surfaces"],
        ].map(([label, href]) => (
          <a key={href} href={href} className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary ring-1 ring-secondary transition hover:ring-brand">
            {label}
          </a>
        ))}
      </nav>

      <Panel
        id="sales-publication-controls"
        title="Publication controls"
        description="Start here: decide whether the buyer experience and each public placement are live."
      >
        <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary ring-inset">
          <Toggle
            size="md"
            label="Enable sales enablement"
            hint="Master switch for the live homepage and global conversion surfaces."
            isSelected={config.enabled}
            onChange={(value) => setTopLevel("enabled", value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Toggle
            label="Show home preview"
            hint="Show the enterprise decision-support preview on the homepage."
            isSelected={config.visibility.showHomePreview}
            onChange={(value) =>
              setSection("visibility", { ...config.visibility, showHomePreview: value })
            }
          />
          <Toggle
            label="Show sticky CTA"
            hint="Keep the global conversion prompt available."
            isSelected={config.visibility.showStickyCta}
            onChange={(value) =>
              setSection("visibility", { ...config.visibility, showStickyCta: value })
            }
          />
          <Toggle
            label="Show soft lead capture"
            hint="Enable the lower-friction lead prompt."
            isSelected={config.visibility.showSoftLeadCapture}
            onChange={(value) =>
              setSection("visibility", { ...config.visibility, showSoftLeadCapture: value })
            }
          />
        </div>
      </Panel>

      <Panel
        id="sales-module-order-and-visibility"
        title="Unpublished buyer-center draft order"
        description={`${enabledModuleCount} of ${config.sectionOrder.length} draft modules retained. These modules are not attached to a public route.`}
      >
        <ol className="space-y-2">
          {config.sectionOrder.map((moduleId, index) => (
            <li
              key={moduleId}
              className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5 ring-1 ring-secondary ring-inset"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-tertiary ring-1 ring-secondary">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium text-primary">
                {SALES_MODULE_LABELS[moduleId]}
              </span>
              <Toggle
                slim
                aria-label={`Enable ${SALES_MODULE_LABELS[moduleId]}`}
                isSelected={config.modules[moduleId]}
                onChange={(value) =>
                  setTopLevel("modules", { ...config.modules, [moduleId]: value })
                }
              />
              <ButtonUtility
                size="xs"
                color="tertiary"
                icon={ArrowUp}
                tooltip="Move up"
                isDisabled={index === 0}
                onClick={() => moveModule(index, -1)}
              />
              <ButtonUtility
                size="xs"
                color="tertiary"
                icon={ArrowDown}
                tooltip="Move down"
                isDisabled={index === config.sectionOrder.length - 1}
                onClick={() => moveModule(index, 1)}
              />
            </li>
          ))}
        </ol>
      </Panel>

      <Panel
        title="Draft buyer capabilities"
        description="A read-only inventory of the retained buyer-center draft. These statuses do not represent live public placements."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {SALES_UPGRADE_CATALOG.map((capability, index) => {
            const isLive = config.modules[capability.module];
            return (
              <div
                key={capability.id}
                className="flex items-start gap-3 rounded-lg bg-secondary px-3 py-2.5 ring-1 ring-secondary ring-inset"
              >
                <span
                  className={
                    isLive
                      ? "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-utility-green-100 text-utility-green-700"
                      : "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-quaternary ring-1 ring-secondary"
                  }
                >
                  {isLive ? <Check className="size-3" /> : index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-primary">{capability.label}</p>
                  <p className="mt-0.5 text-xs text-quaternary">
                    {isLive ? "Included in draft" : "Paused in draft"} · {SALES_MODULE_LABELS[capability.module]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <section className="space-y-6 rounded-2xl border border-dashed border-secondary bg-secondary/30 p-4 sm:p-5" aria-labelledby="buyer-center-draft-heading">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-quaternary uppercase">Not published</p>
          <h2 id="buyer-center-draft-heading" className="mt-1 text-lg font-semibold text-primary">Buyer-center draft library</h2>
          <p className="mt-1 max-w-3xl text-sm text-tertiary">
            This content is retained for reuse but has no public route. Editing it will not change the live site unless a future page explicitly consumes it.
          </p>
        </div>

      <EditorSection title="Search appearance" moduleId={null} enabled>
        <div className="grid gap-4">
          <Input
            label="SEO title"
            value={config.seo.title}
            onChange={(value) => setSection("seo", { ...config.seo, title: value })}
          />
          <TextArea
            label="SEO description"
            rows={3}
            value={config.seo.description}
            onChange={(value) => setSection("seo", { ...config.seo, description: value })}
          />
        </div>
      </EditorSection>

      <EditorSection title="Enterprise positioning" moduleId="hero" enabled={config.modules.hero}>
        <CopyFields
          value={config.hero}
          onChange={(hero) => setSection("hero", hero)}
          fields={[
            ["eyebrow", "Eyebrow", "text"],
            ["headline", "Headline", "text"],
            ["description", "Description", "textarea"],
            ["responsePromise", "Response promise", "textarea"],
            ["qualificationNote", "Qualification note", "textarea"],
          ]}
        />
        <CtaFields
          title="Primary CTA"
          value={config.hero.primaryCta}
          onChange={(primaryCta) => setSection("hero", { ...config.hero, primaryCta })}
        />
        <CtaFields
          title="Secondary CTA"
          value={config.hero.secondaryCta}
          onChange={(secondaryCta) => setSection("hero", { ...config.hero, secondaryCta })}
        />
        <StringList
          title="Platforms"
          itemLabel="Platform"
          items={config.hero.platforms}
          onChange={(platforms) => setSection("hero", { ...config.hero, platforms })}
        />
      </EditorSection>

      <EditorSection title="Executive proof" moduleId="proof" enabled={config.modules.proof}>
        <CopyFields
          value={config.proof}
          onChange={(proof) => setSection("proof", proof)}
          fields={standardCopyFields}
        />
        <CollectionEditor
          title="Proof metrics"
          singular="metric"
          items={config.proof.metrics}
          fields={[
            { key: "value", label: "Value" },
            { key: "label", label: "Label" },
            { key: "detail", label: "Supporting detail", kind: "textarea", wide: true },
          ]}
          createItem={() => ({ value: "", label: "", detail: "" })}
          onChange={(metrics) => setSection("proof", { ...config.proof, metrics })}
        />
      </EditorSection>

      <EditorSection title="Buying committee" moduleId="personas" enabled={config.modules.personas}>
        <CopyFields
          value={config.personas}
          onChange={(personas) => setSection("personas", personas)}
          fields={standardCopyFields}
        />
        <CollectionEditor
          title="Buyer personas"
          singular="persona"
          items={config.personas.items}
          fields={[
            { key: "role", label: "Role" },
            { key: "title", label: "Title" },
            { key: "challenge", label: "Challenge", kind: "textarea", wide: true },
            { key: "outcome", label: "Outcome", kind: "textarea", wide: true },
            { key: "ctaLabel", label: "CTA label" },
            { key: "ctaHref", label: "CTA URL", kind: "url" },
          ]}
          createItem={() => ({
            role: "",
            title: "",
            challenge: "",
            outcome: "",
            ctaLabel: "",
            ctaHref: "",
          })}
          onChange={(items) => setSection("personas", { ...config.personas, items })}
        />
      </EditorSection>

      <EditorSection title="Business outcomes" moduleId="outcomes" enabled={config.modules.outcomes}>
        <CopyFields
          value={config.outcomes}
          onChange={(outcomes) => setSection("outcomes", outcomes)}
          fields={standardCopyFields}
        />
        <CollectionEditor
          title="Outcomes"
          singular="outcome"
          items={config.outcomes.items}
          fields={[
            { key: "title", label: "Title" },
            { key: "description", label: "Description", kind: "textarea", wide: true },
            { key: "evidence", label: "Evidence", kind: "textarea", wide: true },
          ]}
          createItem={() => ({ title: "", description: "", evidence: "" })}
          onChange={(items) => setSection("outcomes", { ...config.outcomes, items })}
        />
      </EditorSection>

      <EditorSection title="Evidence stories" moduleId="stories" enabled={config.modules.stories}>
        <CopyFields
          value={config.stories}
          onChange={(stories) => setSection("stories", stories)}
          fields={[
            ...standardCopyFields,
            ["disclaimer", "Disclaimer", "textarea"],
          ]}
        />
        <CollectionEditor
          title="Stories"
          singular="story"
          items={config.stories.items}
          fields={[
            { key: "industry", label: "Industry" },
            { key: "title", label: "Title" },
            { key: "challenge", label: "Challenge", kind: "textarea", wide: true },
            { key: "outcome", label: "Outcome", kind: "textarea", wide: true },
            { key: "metric", label: "Metric" },
            { key: "metricLabel", label: "Metric label" },
            { key: "href", label: "Destination URL", kind: "url", wide: true },
          ]}
          createItem={() => ({
            industry: "",
            title: "",
            challenge: "",
            outcome: "",
            metric: "",
            metricLabel: "",
            href: "",
          })}
          onChange={(items) => setSection("stories", { ...config.stories, items })}
        />
      </EditorSection>

      <EditorSection title="Trust and commitments" moduleId="trust" enabled={config.modules.trust}>
        <CopyFields
          value={config.trust}
          onChange={(trust) => setSection("trust", trust)}
          fields={standardCopyFields}
        />
        <CollectionEditor
          title="Certifications and assurance"
          singular="certification"
          items={config.trust.certifications}
          fields={[
            { key: "name", label: "Name" },
            { key: "detail", label: "Detail", kind: "textarea", wide: true },
            { key: "href", label: "Destination URL", kind: "url", wide: true },
          ]}
          createItem={() => ({ name: "", detail: "", href: "" })}
          onChange={(certifications) =>
            setSection("trust", { ...config.trust, certifications })
          }
        />
        <CollectionEditor
          title="Service commitments"
          singular="commitment"
          items={config.trust.commitments}
          fields={[
            { key: "value", label: "Value" },
            { key: "label", label: "Label" },
            { key: "detail", label: "Detail", kind: "textarea", wide: true },
          ]}
          createItem={() => ({ value: "", label: "", detail: "" })}
          onChange={(commitments) => setSection("trust", { ...config.trust, commitments })}
        />
        <CtaFields
          title="Trust CTA"
          value={config.trust.cta}
          onChange={(cta) => setSection("trust", { ...config.trust, cta })}
        />
      </EditorSection>

      <EditorSection title="Risk controls" moduleId="risk" enabled={config.modules.risk}>
        <CopyFields
          value={config.risk}
          onChange={(risk) => setSection("risk", risk)}
          fields={standardCopyFields}
        />
        <CollectionEditor
          title="Risk controls"
          singular="risk"
          items={config.risk.items}
          fields={[
            { key: "title", label: "Title" },
            { key: "description", label: "Description", kind: "textarea", wide: true },
          ]}
          createItem={() => ({ title: "", description: "" })}
          onChange={(items) => setSection("risk", { ...config.risk, items })}
        />
      </EditorSection>

      <EditorSection title="ROI planner" moduleId="roi" enabled={config.modules.roi}>
        <CopyFields
          value={config.roi}
          onChange={(roi) => setSection("roi", roi)}
          fields={[
            ...standardCopyFields,
            ["disclaimer", "Disclaimer", "textarea"],
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField
            label="Default annual spend"
            value={config.roi.defaultAnnualSpend}
            onChange={(defaultAnnualSpend) =>
              setSection("roi", { ...config.roi, defaultAnnualSpend })
            }
          />
          <NumberField
            label="Minimum annual spend"
            value={config.roi.minimumAnnualSpend}
            onChange={(minimumAnnualSpend) =>
              setSection("roi", { ...config.roi, minimumAnnualSpend })
            }
          />
          <NumberField
            label="Maximum annual spend"
            value={config.roi.maximumAnnualSpend}
            onChange={(maximumAnnualSpend) =>
              setSection("roi", { ...config.roi, maximumAnnualSpend })
            }
          />
          <NumberField
            label="Low savings estimate (%)"
            value={config.roi.savingsLowPercent}
            onChange={(savingsLowPercent) =>
              setSection("roi", { ...config.roi, savingsLowPercent })
            }
          />
          <NumberField
            label="High savings estimate (%)"
            value={config.roi.savingsHighPercent}
            onChange={(savingsHighPercent) =>
              setSection("roi", { ...config.roi, savingsHighPercent })
            }
          />
        </div>
        <CtaFields
          title="ROI CTA"
          value={config.roi.cta}
          onChange={(cta) => setSection("roi", { ...config.roi, cta })}
        />
      </EditorSection>

      <EditorSection
        title="Implementation roadmap"
        moduleId="roadmap"
        enabled={config.modules.roadmap}
      >
        <CopyFields
          value={config.roadmap}
          onChange={(roadmap) => setSection("roadmap", roadmap)}
          fields={standardCopyFields}
        />
        <CollectionEditor
          title="Roadmap steps"
          singular="step"
          items={config.roadmap.steps}
          fields={[
            { key: "phase", label: "Phase" },
            { key: "title", label: "Title" },
            { key: "description", label: "Description", kind: "textarea", wide: true },
            { key: "owner", label: "Owner" },
            { key: "timing", label: "Timing" },
          ]}
          createItem={() => ({ phase: "", title: "", description: "", owner: "", timing: "" })}
          onChange={(steps) => setSection("roadmap", { ...config.roadmap, steps })}
        />
      </EditorSection>

      <EditorSection
        title="Procurement center"
        moduleId="procurement"
        enabled={config.modules.procurement}
      >
        <CopyFields
          value={config.procurement}
          onChange={(procurement) => setSection("procurement", procurement)}
          fields={standardCopyFields}
        />
        <CollectionEditor
          title="Procurement resources"
          singular="resource"
          items={config.procurement.resources}
          fields={[
            { key: "enabled", label: "Resource enabled", kind: "toggle", wide: true },
            { key: "kind", label: "Kind" },
            { key: "title", label: "Title" },
            { key: "description", label: "Description", kind: "textarea", wide: true },
            { key: "href", label: "Destination URL", kind: "url" },
            { key: "ctaLabel", label: "CTA label" },
          ]}
          createItem={() => ({
            kind: "",
            title: "",
            description: "",
            href: "",
            ctaLabel: "",
            enabled: true,
          })}
          onChange={(resources) =>
            setSection("procurement", { ...config.procurement, resources })
          }
        />
      </EditorSection>

      <EditorSection
        title="Executive briefing form"
        moduleId="briefing_form"
        enabled={config.modules.briefing_form}
      >
        <CopyFields
          value={config.briefingForm}
          onChange={(briefingForm) => setSection("briefingForm", briefingForm)}
          fields={[
            ["eyebrow", "Eyebrow", "text"],
            ["heading", "Heading", "text"],
            ["description", "Description", "textarea"],
            ["submitLabel", "Submit label", "text"],
            ["successHeading", "Success heading", "text"],
            ["successDescription", "Success description", "textarea"],
            ["serviceValue", "Submitted service value", "text"],
            ["responsePromise", "Response promise", "textarea"],
          ]}
        />
        <StringList
          title="Priorities"
          itemLabel="Priority"
          items={config.briefingForm.priorities}
          onChange={(priorities) =>
            setSection("briefingForm", { ...config.briefingForm, priorities })
          }
        />
        <StringList
          title="Timelines"
          itemLabel="Timeline"
          items={config.briefingForm.timelines}
          onChange={(timelines) =>
            setSection("briefingForm", { ...config.briefingForm, timelines })
          }
        />
      </EditorSection>

      <EditorSection title="Buyer FAQ" moduleId="faq" enabled={config.modules.faq}>
        <CopyFields
          value={config.faq}
          onChange={(faq) => setSection("faq", faq)}
          fields={standardCopyFields}
        />
        <CollectionEditor
          title="Questions and answers"
          singular="FAQ"
          items={config.faq.items}
          fields={[
            { key: "question", label: "Question", wide: true },
            { key: "answer", label: "Answer", kind: "textarea", wide: true },
          ]}
          createItem={() => ({ question: "", answer: "" })}
          onChange={(items) => setSection("faq", { ...config.faq, items })}
        />
      </EditorSection>

      <EditorSection
        title="Final conversion"
        moduleId="final_cta"
        enabled={config.modules.final_cta}
      >
        <CopyFields
          value={config.finalCta}
          onChange={(finalCta) => setSection("finalCta", finalCta)}
          fields={[
            ...standardCopyFields,
            ["reassurance", "Reassurance", "textarea"],
          ]}
        />
        <CtaFields
          title="Primary CTA"
          value={config.finalCta.primaryCta}
          onChange={(primaryCta) =>
            setSection("finalCta", { ...config.finalCta, primaryCta })
          }
        />
        <CtaFields
          title="Secondary CTA"
          value={config.finalCta.secondaryCta}
          onChange={(secondaryCta) =>
            setSection("finalCta", { ...config.finalCta, secondaryCta })
          }
        />
      </EditorSection>

      </section>

      <EditorSection title="Global conversion surfaces" moduleId={null} enabled>
        <div className="space-y-5 rounded-xl bg-secondary p-4 ring-1 ring-secondary ring-inset">
          <div>
            <h3 className="text-sm font-semibold text-primary">Sticky buyer bar</h3>
            <p className="mt-1 text-xs leading-5 text-tertiary">
              The standard title and description appear on general pages. Solution templates
              appear on service pages; use the literal token {"{solution}"} wherever the
              service name should be inserted.
            </p>
          </div>
          <CopyFields
            value={config.global}
            onChange={(global) => setSection("global", global)}
            fields={[
              ["stickyTitle", "General-page title", "text"],
              ["stickyDescription", "General-page description", "textarea"],
              ["stickySolutionTitleTemplate", "Solution-page title template", "text"],
              [
                "stickySolutionDescriptionTemplate",
                "Solution-page description template",
                "textarea",
              ],
              ["stickyBrandLabel", "Brand badge label", "text"],
              ["stickySupportNote", "Support note", "text"],
              ["buyerActionsAriaLabel", "Buyer actions accessibility label", "text"],
            ]}
          />
          <CtaFields
            title="Primary call CTA"
            value={config.global.stickyPrimaryCta}
            onChange={(stickyPrimaryCta) =>
              setSection("global", { ...config.global, stickyPrimaryCta })
            }
          />
        </div>

        <div className="space-y-5 border-t border-secondary pt-5">
          <div>
            <h3 className="text-sm font-semibold text-primary">Callback dialog</h3>
            <p className="mt-1 text-xs leading-5 text-tertiary">
              Controls the callback button, dialog, form labels, confirmation, error message,
              and the context sent when the visitor is not on a recognized solution page.
            </p>
          </div>
          <CopyFields
            value={config.global}
            onChange={(global) => setSection("global", global)}
            fields={[
              ["callbackTriggerLabel", "Open-dialog button label", "text"],
              ["callbackDialogAriaLabel", "Dialog accessibility label", "text"],
              ["callbackTitle", "Dialog title", "text"],
              ["callbackDescription", "Dialog description", "textarea"],
              ["callbackPhoneLabel", "Phone field label", "text"],
              ["callbackPhonePlaceholder", "Phone field placeholder", "text"],
              ["callbackPreferredTimeLabel", "Preferred-time field label", "text"],
              ["callbackSubmitLabel", "Submit button label", "text"],
              ["callbackSuccessHeading", "Success heading", "text"],
              ["callbackSuccessDescription", "Success description", "textarea"],
              ["callbackErrorMessage", "Error message", "textarea"],
              ["callbackContextFallback", "General-page request context", "text"],
            ]}
          />
          <CollectionEditor
            title="Callback time choices"
            singular="time choice"
            items={config.global.callbackTimeOptions}
            fields={[
              { key: "id", label: "Submitted value" },
              { key: "label", label: "Menu label" },
            ]}
            createItem={() => ({ id: "", label: "" })}
            onChange={(callbackTimeOptions) =>
              setSection("global", { ...config.global, callbackTimeOptions })
            }
          />
        </div>

        <div className="space-y-5 border-t border-secondary pt-5">
          <div>
            <h3 className="text-sm font-semibold text-primary">Other conversion surfaces</h3>
            <p className="mt-1 text-xs leading-5 text-tertiary">
              Copy for the soft lead prompt and enterprise preview on the homepage.
            </p>
          </div>
          <CopyFields
            value={config.global}
            onChange={(global) => setSection("global", global)}
            fields={[
              ["softLeadHeadline", "Soft lead headline", "text"],
              ["softLeadDescription", "Soft lead description", "textarea"],
              ["homePreviewEyebrow", "Home preview eyebrow", "text"],
              ["homePreviewHeading", "Home preview heading", "text"],
              ["homePreviewDescription", "Home preview description", "textarea"],
            ]}
          />
          <div className="border-t border-secondary pt-5">
            <h4 className="text-sm font-semibold text-primary">Soft lead form details</h4>
            <p className="mt-1 text-xs leading-5 text-tertiary">
              Image, fields, consent, submission, confirmation, errors, and lead classification for the delayed assessment prompt.
            </p>
            <div className="mt-4">
              <CopyFields
                value={config.global.softLead}
                onChange={(softLead) => setSection("global", { ...config.global, softLead })}
                fields={[
                  ["image_src", "Image URL", "text"],
                  ["image_alt", "Image alt text", "text"],
                  ["dismiss_aria_label", "Dismiss accessibility label", "text"],
                  ["close_aria_label", "Close accessibility label", "text"],
                  ["name_label", "Name label", "text"],
                  ["name_placeholder", "Name placeholder", "text"],
                  ["email_label", "Email label", "text"],
                  ["email_placeholder", "Email placeholder", "text"],
                  ["phone_label", "Phone label", "text"],
                  ["phone_placeholder", "Phone placeholder", "text"],
                  ["company_label", "Company label", "text"],
                  ["company_placeholder", "Company placeholder", "text"],
                  ["marketing_consent_aria_label", "Consent accessibility label", "text"],
                  ["marketing_consent_text", "Consent text", "textarea"],
                  ["sending_label", "Sending label", "text"],
                  ["submit_label", "Submit label", "text"],
                  ["phone_error", "Phone validation error", "text"],
                  ["submit_error", "Submission error", "text"],
                  ["generic_error", "Generic error", "text"],
                  ["success_heading", "Success heading", "text"],
                  ["success_description", "Success description", "textarea"],
                  ["success_close_label", "Success close label", "text"],
                  ["lead_service", "Submitted service", "text"],
                  ["lead_message", "Submitted lead message", "textarea"],
                  ["lead_form_key", "Submitted form key", "text"],
                  ["lead_source", "Submitted source", "text"],
                  ["analytics_form", "Analytics form key", "text"],
                ]}
              />
            </div>
          </div>
        </div>
        <CtaFields
          title="Homepage preview CTA"
          value={config.global.homePreviewCta}
          onChange={(homePreviewCta) =>
            setSection("global", { ...config.global, homePreviewCta })
          }
        />
        <CollectionEditor
          title="Homepage preview proof cards"
          singular="proof card"
          items={config.global.homePreviewMetrics}
          fields={[
            { key: "value", label: "Value" },
            { key: "label", label: "Label" },
            { key: "detail", label: "Detail", kind: "textarea" },
          ]}
          createItem={() => ({ value: "", label: "", detail: "" })}
          onChange={(homePreviewMetrics) =>
            setSection("global", { ...config.global, homePreviewMetrics })
          }
        />
      </EditorSection>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-xl bg-primary/95 p-3 shadow-lg ring-1 ring-secondary backdrop-blur">
        <p className="hidden text-xs text-tertiary sm:block">
          Changes take effect after saving and cache revalidation.
        </p>
        <Button
          size="md"
          iconLeading={Save01}
          isLoading={saveStatus === "saving"}
          showTextWhileLoading
          onClick={handleSave}
          className="ml-auto"
        >
          {saveStatus === "saving" ? "Saving..." : "Save sales settings"}
        </Button>
      </div>
    </div>
  );
}

const standardCopyFields: CopyField[] = [
  ["eyebrow", "Eyebrow", "text"],
  ["heading", "Heading", "text"],
  ["description", "Description", "textarea"],
];

type CopyField = readonly [key: string, label: string, kind: "text" | "textarea"];

function CopyFields<T extends object>({
  value,
  onChange,
  fields,
}: {
  value: T;
  onChange: (value: T) => void;
  fields: readonly CopyField[];
}) {
  const record = value as Record<string, unknown>;
  return (
    <div className="grid gap-4">
      {fields.map(([key, label, kind]) =>
        kind === "textarea" ? (
          <TextArea
            key={key}
            label={label}
            rows={3}
            value={String(record[key] ?? "")}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        ) : (
          <Input
            key={key}
            label={label}
            value={String(record[key] ?? "")}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        ),
      )}
    </div>
  );
}

function CtaFields({
  title,
  value,
  onChange,
}: {
  title: string;
  value: { label: string; href: string };
  onChange: (value: { label: string; href: string }) => void;
}) {
  return (
    <fieldset className="rounded-lg bg-secondary p-4 ring-1 ring-secondary ring-inset">
      <legend className="px-1 text-sm font-semibold text-primary">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Label"
          value={value.label}
          onChange={(label) => onChange({ ...value, label })}
        />
        <Input
          label="Destination URL"
          value={value.href}
          onChange={(href) => onChange({ ...value, href })}
        />
      </div>
    </fieldset>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Input
      type="number"
      label={label}
      value={String(value)}
      onChange={(next) => {
        const parsed = Number(next);
        onChange(Number.isFinite(parsed) ? parsed : 0);
      }}
    />
  );
}

function CollectionEditor<T extends EditableItem>({
  title,
  singular,
  items,
  fields,
  createItem,
  onChange,
}: {
  title: string;
  singular: string;
  items: T[];
  fields: CollectionField[];
  createItem: () => T;
  onChange: (items: T[]) => void;
}) {
  const updateItem = (index: number, key: string, value: EditableValue) => {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  const move = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= items.length) return;
    const next = [...items];
    [next[index], next[destination]] = [next[destination], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3 border-t border-secondary pt-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-primary">{title}</h3>
          <p className="text-xs text-tertiary">{items.length} configured</p>
        </div>
        <Button
          size="sm"
          color="secondary"
          iconLeading={Plus}
          onClick={() => onChange([...items, createItem()])}
        >
          Add {singular}
        </Button>
      </div>
      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-secondary p-6 text-center text-sm text-tertiary">
          No {title.toLowerCase()} configured.
        </div>
      )}
      {items.map((item, index) => (
        <div key={index} className="rounded-xl bg-secondary p-4 ring-1 ring-secondary ring-inset">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-tertiary">
              {singular.charAt(0).toUpperCase() + singular.slice(1)} {index + 1}
            </span>
            <div className="flex items-center gap-1">
              <ButtonUtility
                size="xs"
                color="tertiary"
                icon={ArrowUp}
                tooltip="Move up"
                isDisabled={index === 0}
                onClick={() => move(index, -1)}
              />
              <ButtonUtility
                size="xs"
                color="tertiary"
                icon={ArrowDown}
                tooltip="Move down"
                isDisabled={index === items.length - 1}
                onClick={() => move(index, 1)}
              />
              <ButtonUtility
                size="xs"
                color="tertiary"
                icon={Trash01}
                tooltip={`Remove ${singular}`}
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <CollectionFieldControl
                key={field.key}
                field={field}
                value={item[field.key]}
                onChange={(next) => updateItem(index, field.key, next)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CollectionFieldControl({
  field,
  value,
  onChange,
}: {
  field: CollectionField;
  value: EditableValue;
  onChange: (value: EditableValue) => void;
}) {
  const wrapperClass = field.wide ? "sm:col-span-2" : "";
  if (field.kind === "toggle") {
    return (
      <div className={wrapperClass}>
        <Toggle
          label={field.label}
          isSelected={Boolean(value)}
          onChange={(next) => onChange(next)}
        />
      </div>
    );
  }
  if (field.kind === "textarea") {
    return (
      <TextArea
        className={wrapperClass}
        label={field.label}
        rows={3}
        value={String(value ?? "")}
        onChange={(next) => onChange(next)}
      />
    );
  }
  return (
    <Input
      className={wrapperClass}
      type={field.kind === "number" ? "number" : "text"}
      label={field.label}
      value={String(value ?? "")}
      onChange={(next) =>
        onChange(field.kind === "number" ? Number(next) || 0 : next)
      }
    />
  );
}

function StringList({
  title,
  itemLabel,
  items,
  onChange,
}: {
  title: string;
  itemLabel: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const move = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= items.length) return;
    const next = [...items];
    [next[index], next[destination]] = [next[destination], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3 border-t border-secondary pt-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-primary">{title}</h3>
          <p className="text-xs text-tertiary">{items.length} configured</p>
        </div>
        <Button
          size="sm"
          color="secondary"
          iconLeading={Plus}
          onClick={() => onChange([...items, ""])}
        >
          Add {itemLabel.toLowerCase()}
        </Button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex items-end gap-2">
          <Input
            className="flex-1"
            label={`${itemLabel} ${index + 1}`}
            value={item}
            onChange={(value) => {
              const next = [...items];
              next[index] = value;
              onChange(next);
            }}
          />
          <ButtonUtility
            size="sm"
            color="tertiary"
            icon={ArrowUp}
            tooltip="Move up"
            isDisabled={index === 0}
            onClick={() => move(index, -1)}
          />
          <ButtonUtility
            size="sm"
            color="tertiary"
            icon={ArrowDown}
            tooltip="Move down"
            isDisabled={index === items.length - 1}
            onClick={() => move(index, 1)}
          />
          <ButtonUtility
            size="sm"
            color="tertiary"
            icon={Trash01}
            tooltip={`Remove ${itemLabel.toLowerCase()}`}
            onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
          />
        </div>
      ))}
    </div>
  );
}

function Panel({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
      <div className="border-b border-secondary px-5 py-4">
        <h2 className="text-sm font-semibold text-primary">{title}</h2>
        <p className="mt-0.5 text-xs text-tertiary">{description}</p>
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

function EditorSection({
  title,
  moduleId,
  enabled,
  children,
}: {
  title: string;
  moduleId: SalesModuleId | null;
  enabled: boolean;
  children: ReactNode;
}) {
  return (
    <details id={`sales-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="group scroll-mt-24 overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2">
        <div>
          <h2 className="text-sm font-semibold text-primary">{title}</h2>
          <p className="mt-0.5 text-xs text-tertiary">
            {moduleId ? `Module key: ${moduleId}` : "Site-wide settings"}
          </p>
        </div>
        <span
          className={
            enabled
              ? "rounded-full bg-utility-green-50 px-2.5 py-1 text-xs font-medium text-utility-green-700 ring-1 ring-utility-green-200 ring-inset"
              : "rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-tertiary ring-1 ring-secondary ring-inset"
          }
        >
          {enabled ? "Enabled" : "Disabled"}
        </span>
      </summary>
      <div className="space-y-5 border-t border-secondary p-5">{children}</div>
    </details>
  );
}
