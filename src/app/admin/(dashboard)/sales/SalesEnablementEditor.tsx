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
              Control the enterprise buyer journey, decision proof, conversion paths, and
              commercial planning content from one structured CMS workspace.
            </p>
            <p className="mt-2 text-xs text-quaternary">
              {sectionId ? `CMS section ${sectionId.slice(0, 8)} · ` : ""}
              Last saved {formatTimestamp(updatedAt)}
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
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Save changes"}
        </Button>
      </header>

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
          The master switch can pause every sales surface. Individual visibility and
          module controls let teams stage content without deleting it.
        </span>
      </div>

      <Panel
        title="Publication controls"
        description="Master availability and global sales-surface visibility."
      >
        <div className="rounded-lg bg-secondary p-4 ring-1 ring-secondary ring-inset">
          <Toggle
            size="md"
            label="Enable sales enablement"
            hint="Master switch for the configured sales experience."
            isSelected={config.enabled}
            onChange={(value) => setTopLevel("enabled", value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Toggle
            label="Show enterprise page"
            hint="Publish the full buyer center."
            isSelected={config.visibility.showEnterprisePage}
            onChange={(value) =>
              setSection("visibility", { ...config.visibility, showEnterprisePage: value })
            }
          />
          <Toggle
            label="Show home preview"
            hint="Promote the buyer center on the homepage."
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
        title="Module order and visibility"
        description={`${enabledModuleCount} of ${config.sectionOrder.length} modules enabled. Reorder modules to match the buying narrative.`}
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
        title="20 live revenue capabilities"
        description="A compact readiness view of the connected buyer-enablement system. Each capability follows its parent module switch."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {SALES_UPGRADE_CATALOG.map((capability, index) => {
            const isLive = config.enabled && config.modules[capability.module];
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
                    {isLive ? "Live" : "Paused"} · {SALES_MODULE_LABELS[capability.module]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

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

      <EditorSection title="Global conversion surfaces" moduleId={null} enabled>
        <CopyFields
          value={config.global}
          onChange={(global) => setSection("global", global)}
          fields={[
            ["stickyTitle", "Sticky CTA title", "text"],
            ["stickyDescription", "Sticky CTA description", "textarea"],
            ["softLeadHeadline", "Soft lead headline", "text"],
            ["softLeadDescription", "Soft lead description", "textarea"],
            ["homePreviewEyebrow", "Home preview eyebrow", "text"],
            ["homePreviewHeading", "Home preview heading", "text"],
            ["homePreviewDescription", "Home preview description", "textarea"],
          ]}
        />
        <CtaFields
          title="Sticky primary CTA"
          value={config.global.stickyPrimaryCta}
          onChange={(stickyPrimaryCta) =>
            setSection("global", { ...config.global, stickyPrimaryCta })
          }
        />
        <CtaFields
          title="Sticky secondary CTA"
          value={config.global.stickySecondaryCta}
          onChange={(stickySecondaryCta) =>
            setSection("global", { ...config.global, stickySecondaryCta })
          }
        />
        <CtaFields
          title="Homepage preview CTA"
          value={config.global.homePreviewCta}
          onChange={(homePreviewCta) =>
            setSection("global", { ...config.global, homePreviewCta })
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
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
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
    <details className="group overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
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
