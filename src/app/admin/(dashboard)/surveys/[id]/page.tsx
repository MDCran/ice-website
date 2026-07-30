"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ClipboardCheck,
  DotsGrid,
  FlipBackward,
  Pencil01,
  Plus,
  Save01,
  Send01,
  Trash01,
  XClose,
} from "@untitledui/icons";
import { writeAuditLog } from "@/lib/auditLog";
import { Badge } from "@/components/base/badges/badges";
import type { BadgeColor } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { CloseButton } from "@/components/base/buttons/close-button";
import { Input } from "@/components/base/input/input";
import { NativeSelect } from "@/components/base/select/select-native";
import { TextArea } from "@/components/base/textarea/textarea";
import { Toggle } from "@/components/base/toggle/toggle";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Question {
  id: string;
  survey_id: string;
  question_type: string;
  question_text: string;
  description: string | null;
  config: Record<string, any>;
  is_required: boolean;
  sort_order: number;
  _isNew?: boolean;
  _deleted?: boolean;
}

interface Survey {
  id: string;
  title: string;
  description: string | null;
  status: string;
  expires_at: string | null;
  client_account_id: string;
  created_at: string;
}

const QUESTION_TYPES = [
  { value: "short_text", label: "Short Text" },
  { value: "long_text", label: "Long Text" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "yes_no", label: "Yes / No" },
  { value: "ranking", label: "Ranking" },
  { value: "phone_time_day", label: "Phone Time / Day" },
  { value: "star_rating", label: "Star Rating" },
];

const QUESTION_TEMPLATES: Array<{
  label: string;
  question_type: string;
  question_text: string;
  description?: string;
  config?: Record<string, unknown>;
  is_required?: boolean;
}> = [
  {
    label: "Primary contact",
    question_type: "short_text",
    question_text: "Who is the primary technical contact?",
    is_required: true,
  },
  {
    label: "Platforms in scope",
    question_type: "multiple_choice",
    question_text: "Which platforms are in scope?",
    description: "Select all that apply.",
    config: {
      choices: ["IBM i / Power", "Microsoft 365", "VMware / x86", "Public cloud", "Other"],
      maxSelections: 5,
    },
    is_required: true,
  },
  {
    label: "DR plan exists",
    question_type: "yes_no",
    question_text: "Do you currently have a documented disaster recovery plan?",
    is_required: true,
  },
  {
    label: "Satisfaction",
    question_type: "star_rating",
    question_text: "How would you rate ICE support this quarter?",
    config: { maxStars: 5 },
    is_required: true,
  },
  {
    label: "Callback window",
    question_type: "phone_time_day",
    question_text: "Best day and time for a follow-up call?",
    is_required: false,
  },
];

const typeBadge: Record<string, BadgeColor<"pill-color">> = {
  short_text: "blue",
  long_text: "indigo",
  multiple_choice: "purple",
  yes_no: "success",
  ranking: "warning",
  phone_time_day: "sky",
  star_rating: "orange",
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function SurveyBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ----- modal state ----- */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formType, setFormType] = useState("short_text");
  const [formText, setFormText] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formRequired, setFormRequired] = useState(true);
  const [formChoices, setFormChoices] = useState<string[]>([""]);
  const [formMaxSelections, setFormMaxSelections] = useState<number>(1);
  const [formRankItems, setFormRankItems] = useState<string[]>([""]);
  const [formMaxStars, setFormMaxStars] = useState<number>(5);

  /* ----- fetch ----- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: s, error: se } = await supabase
      .from("surveys")
      .select("*")
      .eq("id", id)
      .single();

    if (se || !s) {
      setError("Survey not found.");
      setLoading(false);
      return;
    }
    setSurvey(s);

    const { data: q } = await supabase
      .from("survey_questions")
      .select("*")
      .eq("survey_id", id)
      .order("sort_order", { ascending: true });

    setQuestions(q ?? []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ----- helpers ----- */
  const resetForm = () => {
    setFormType("short_text");
    setFormText("");
    setFormDesc("");
    setFormRequired(true);
    setFormChoices([""]);
    setFormMaxSelections(1);
    setFormRankItems([""]);
    setFormMaxStars(5);
    setEditingIndex(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (idx: number) => {
    const q = questions[idx];
    setFormType(q.question_type);
    setFormText(q.question_text);
    setFormDesc(q.description ?? "");
    setFormRequired(q.is_required);
    if (q.question_type === "multiple_choice") {
      setFormChoices(q.config?.choices ?? [""]);
      setFormMaxSelections(q.config?.maxSelections ?? 1);
    }
    if (q.question_type === "ranking") {
      setFormRankItems(q.config?.items ?? [""]);
    }
    if (q.question_type === "star_rating") {
      setFormMaxStars(q.config?.maxStars ?? 5);
    }
    setEditingIndex(idx);
    setModalOpen(true);
  };

  const buildConfig = (): Record<string, any> => {
    if (formType === "multiple_choice") {
      return {
        choices: formChoices.filter((c) => c.trim()),
        maxSelections: formMaxSelections,
      };
    }
    if (formType === "ranking") {
      return { items: formRankItems.filter((i) => i.trim()) };
    }
    if (formType === "star_rating") {
      return { maxStars: formMaxStars };
    }
    return {};
  };

  const handleSaveQuestion = () => {
    if (!formText.trim()) return;

    const config = buildConfig();
    if (editingIndex !== null) {
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === editingIndex
            ? {
                ...q,
                question_type: formType,
                question_text: formText.trim(),
                description: formDesc.trim() || null,
                is_required: formRequired,
                config,
              }
            : q
        )
      );
    } else {
      const newQ: Question = {
        id: crypto.randomUUID(),
        survey_id: id,
        question_type: formType,
        question_text: formText.trim(),
        description: formDesc.trim() || null,
        config,
        is_required: formRequired,
        sort_order: questions.filter((q) => !q._deleted).length,
        _isNew: true,
      };
      setQuestions((prev) => [...prev, newQ]);
    }
    setModalOpen(false);
    resetForm();
  };

  const handleDeleteQuestion = (idx: number) => {
    const q = questions[idx];
    if (q._isNew) {
      setQuestions((prev) => prev.filter((_, i) => i !== idx));
    } else {
      setQuestions((prev) =>
        prev.map((item, i) => (i === idx ? { ...item, _deleted: true } : item))
      );
    }
  };

  const moveQuestion = (visibleIndex: number, direction: -1 | 1) => {
    const visible = questions.filter((q) => !q._deleted);
    const target = visibleIndex + direction;
    if (target < 0 || target >= visible.length) return;
    const fromId = visible[visibleIndex].id;
    const toId = visible[target].id;
    setQuestions((prev) => {
      const next = [...prev];
      const fromIdx = next.findIndex((q) => q.id === fromId);
      const toIdx = next.findIndex((q) => q.id === toId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const tmp = next[fromIdx];
      next[fromIdx] = next[toIdx];
      next[toIdx] = tmp;
      return next.map((q, i) => ({ ...q, sort_order: i }));
    });
  };

  const addFromTemplate = (template: (typeof QUESTION_TEMPLATES)[number]) => {
    const newQ: Question = {
      id: crypto.randomUUID(),
      survey_id: id,
      question_type: template.question_type,
      question_text: template.question_text,
      description: template.description ?? null,
      config: template.config ?? {},
      is_required: template.is_required ?? true,
      sort_order: questions.filter((q) => !q._deleted).length,
      _isNew: true,
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  /* ----- persist all changes ----- */
  const handleSaveAll = async () => {
    if (!survey) return;
    setSaving(true);
    setError("");
    setSuccess("");

    // Update survey fields
    const { error: sErr } = await supabase
      .from("surveys")
      .update({
        title: survey.title,
        description: survey.description,
        status: survey.status,
        expires_at: survey.expires_at || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (sErr) {
      setError(sErr.message);
      setSaving(false);
      return;
    }

    // Delete removed questions
    const toDelete = questions.filter((q) => q._deleted && !q._isNew);
    for (const q of toDelete) {
      await supabase.from("survey_questions").delete().eq("id", q.id);
    }

    // Upsert remaining questions
    const remaining = questions.filter((q) => !q._deleted);
    for (let i = 0; i < remaining.length; i++) {
      const q = remaining[i];
      const row = {
        survey_id: id,
        question_type: q.question_type,
        question_text: q.question_text,
        description: q.description,
        config: q.config,
        is_required: q.is_required,
        sort_order: i,
      };

      if (q._isNew) {
        await supabase.from("survey_questions").insert(row);
      } else {
        await supabase
          .from("survey_questions")
          .update(row)
          .eq("id", q.id);
      }
    }

    await writeAuditLog(supabase, {
      action: "survey.saved",
      entityType: "survey",
      entityId: id,
      summary: `Saved survey ${survey.title}`,
    });

    setSuccess("Survey saved successfully.");
    setTimeout(() => setSuccess(""), 3000);
    await fetchData();
    setSaving(false);
  };

  /* ----- status transitions ----- */
  const handleStatusChange = async (newStatus: string) => {
    if (!survey) return;
    setSaving(true);
    setError("");
    setSuccess("");

    const { error: updateErr } = await supabase
      .from("surveys")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateErr) {
      setError(updateErr.message);
      setSaving(false);
      return;
    }

    setSurvey({ ...survey, status: newStatus });
    setSuccess(
      newStatus === "active"
        ? "Survey sent to client."
        : newStatus === "draft"
          ? "Survey revoked to draft."
          : `Status changed to ${newStatus}.`
    );
    setTimeout(() => setSuccess(""), 3000);
    setSaving(false);
  };

  /* ----- render ----- */

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingIndicator type="line-spinner" size="md" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="py-12 text-center text-sm text-error-primary">Survey not found.</div>
    );
  }

  const visibleQuestions = questions.filter((q) => !q._deleted);

  return (
    <div>
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/admin/surveys"
          className="inline-flex items-center gap-2 text-sm font-semibold text-tertiary transition-colors hover:text-tertiary_hover"
        >
          <ArrowLeft className="size-4" />
          Back to Surveys
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FeaturedIcon color="brand" theme="modern" size="md" icon={ClipboardCheck} />
          <div>
            <h1 className="text-display-xs font-semibold text-primary">Survey Builder</h1>
            <p className="text-sm text-tertiary">
              Editing: {survey.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Status transition buttons */}
          {survey.status === "draft" && (
            <Button
              size="md"
              color="secondary"
              iconLeading={Send01}
              isDisabled={saving}
              onClick={() => handleStatusChange("active")}
            >
              Send to Client
            </Button>
          )}
          {survey.status === "active" && (
            <Button
              size="md"
              color="secondary"
              iconLeading={FlipBackward}
              isDisabled={saving}
              onClick={() => handleStatusChange("draft")}
            >
              Revoke
            </Button>
          )}
          {survey.status === "completed" && (
            <Badge size="md" color="success">
              Completed
            </Badge>
          )}

          <Button
            size="md"
            color="primary"
            iconLeading={Save01}
            isLoading={saving}
            showTextWhileLoading
            isDisabled={saving || survey.status === "completed"}
            onClick={handleSaveAll}
          >
            {saving ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-utility-red-50 p-3 text-sm text-utility-red-700 ring-1 ring-utility-red-200 ring-inset">
          <AlertCircle className="size-4 shrink-0 text-utility-red-500" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-lg bg-utility-green-50 p-3 text-sm text-utility-green-700 ring-1 ring-utility-green-200 ring-inset">
          {success}
        </div>
      )}

      {/* Survey meta fields */}
      <div className="mb-8 rounded-xl bg-primary p-6 shadow-xs ring-1 ring-secondary">
        <h2 className="mb-6 text-lg font-semibold text-primary">
          Survey Details
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Input
            label="Title"
            value={survey.title}
            onChange={(value) => setSurvey({ ...survey, title: value })}
          />
          <div>
            <p className="mb-1.5 text-sm font-medium text-secondary">Status</p>
            <div className="flex items-center gap-2 pt-1.5">
              {(["draft", "active", "completed"] as const).map((s) => {
                const activeColors: Record<string, BadgeColor<"pill-color">> = {
                  draft: "gray",
                  active: "brand",
                  completed: "success",
                };
                return (
                  <Badge
                    key={s}
                    size="lg"
                    color={survey.status === s ? activeColors[s] : "gray"}
                    className={survey.status === s ? "capitalize" : "capitalize opacity-50"}
                  >
                    {s}
                  </Badge>
                );
              })}
            </div>
          </div>
          <div className="md:col-span-2">
            <TextArea
              label="Description"
              rows={3}
              value={survey.description ?? ""}
              onChange={(value) =>
                setSurvey({
                  ...survey,
                  description: value || null,
                })
              }
              textAreaClassName="resize-none"
            />
          </div>
          <Input
            label="Expiration Date"
            type="date"
            value={survey.expires_at ? survey.expires_at.substring(0, 10) : ""}
            onChange={(value) =>
              setSurvey({
                ...survey,
                expires_at: value || null,
              })
            }
          />
        </div>
      </div>

      {/* Questions section */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-primary">
          Questions ({visibleQuestions.length})
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <NativeSelect
            aria-label="Add from template"
            value=""
            onChange={(e) => {
              const t = QUESTION_TEMPLATES.find((x) => x.label === e.target.value);
              if (t) addFromTemplate(t);
              e.target.value = "";
            }}
            options={[
              { value: "", label: "Add from template…" },
              ...QUESTION_TEMPLATES.map((t) => ({ value: t.label, label: t.label })),
            ]}
          />
          <Button size="sm" color="secondary" iconLeading={Plus} onClick={openAddModal}>
            Add Question
          </Button>
        </div>
      </div>

      {visibleQuestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-primary px-6 py-16 text-center shadow-xs ring-1 ring-secondary">
          <FeaturedIcon color="gray" theme="modern" size="lg" icon={ClipboardCheck} />
          <p className="mt-4 text-md font-semibold text-primary">No questions yet</p>
          <p className="mt-1 text-sm text-tertiary">
            Add questions to build your survey.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleQuestions.map((q, idx) => {
            const realIndex = questions.indexOf(q);
            return (
              <div
                key={q.id}
                className="flex items-start gap-4 rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary"
              >
                <div className="pt-1 text-fg-quaternary">
                  <DotsGrid className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="font-mono text-xs text-quaternary">
                      Q{idx + 1}
                    </span>
                    <Badge size="sm" color={typeBadge[q.question_type] ?? "gray"} className="uppercase">
                      {q.question_type.replace(/_/g, " ")}
                    </Badge>
                    {q.is_required && (
                      <span className="text-xs font-medium text-error-primary">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-primary">
                    {q.question_text}
                  </p>
                  {q.description && (
                    <p className="mt-1 text-xs text-tertiary">
                      {q.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <ButtonUtility
                    size="sm"
                    color="tertiary"
                    icon={ArrowUp}
                    tooltip="Move up"
                    isDisabled={idx === 0 || survey.status === "completed"}
                    onClick={() => moveQuestion(idx, -1)}
                  />
                  <ButtonUtility
                    size="sm"
                    color="tertiary"
                    icon={ArrowDown}
                    tooltip="Move down"
                    isDisabled={idx === visibleQuestions.length - 1 || survey.status === "completed"}
                    onClick={() => moveQuestion(idx, 1)}
                  />
                  <ButtonUtility
                    size="sm"
                    color="tertiary"
                    icon={Pencil01}
                    tooltip="Edit"
                    onClick={() => openEditModal(realIndex)}
                  />
                  <ButtonUtility
                    size="sm"
                    color="tertiary"
                    icon={Trash01}
                    tooltip="Delete"
                    onClick={() => handleDeleteQuestion(realIndex)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Question modal */}
      <ModalOverlay
        isOpen={modalOpen}
        onOpenChange={(isOpen) => {
          setModalOpen(isOpen);
          if (!isOpen) resetForm();
        }}
        isDismissable
      >
        <Modal className="w-full max-w-lg">
          <Dialog>
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary">
                  {editingIndex !== null ? "Edit Question" : "Add Question"}
                </h2>
                <CloseButton
                  size="sm"
                  onPress={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                />
              </div>

              <div className="space-y-5">
                {/* Type */}
                <NativeSelect
                  label="Question Type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  options={QUESTION_TYPES.map((t) => ({ label: t.label, value: t.value }))}
                />

                {/* Question text */}
                <Input
                  label="Question Text"
                  placeholder="Enter your question..."
                  value={formText}
                  onChange={(value) => setFormText(value)}
                />

                {/* Description */}
                <TextArea
                  label="Description (optional)"
                  placeholder="Additional context for this question..."
                  rows={2}
                  value={formDesc}
                  onChange={(value) => setFormDesc(value)}
                  textAreaClassName="resize-none"
                />

                {/* Required toggle */}
                <Toggle
                  size="sm"
                  label="Required"
                  isSelected={formRequired}
                  onChange={(isSelected) => setFormRequired(isSelected)}
                />

                {/* Multiple choice config */}
                {formType === "multiple_choice" && (
                  <div className="space-y-3 border-t border-secondary pt-5">
                    <p className="text-sm font-medium text-secondary">Choices</p>
                    {formChoices.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          size="sm"
                          aria-label={`Choice ${i + 1}`}
                          placeholder={`Choice ${i + 1}`}
                          value={c}
                          onChange={(value) => {
                            const updated = [...formChoices];
                            updated[i] = value;
                            setFormChoices(updated);
                          }}
                          className="flex-1"
                        />
                        {formChoices.length > 1 && (
                          <ButtonUtility
                            size="xs"
                            color="tertiary"
                            icon={XClose}
                            tooltip="Remove choice"
                            onClick={() =>
                              setFormChoices(formChoices.filter((_, j) => j !== i))
                            }
                          />
                        )}
                      </div>
                    ))}
                    <Button
                      size="sm"
                      color="link-color"
                      iconLeading={Plus}
                      onClick={() => setFormChoices([...formChoices, ""])}
                    >
                      Add choice
                    </Button>
                    <Input
                      size="sm"
                      type="number"
                      label="Max Selections"
                      value={String(formMaxSelections)}
                      onChange={(value) => setFormMaxSelections(parseInt(value) || 1)}
                      className="w-32"
                    />
                  </div>
                )}

                {/* Ranking config */}
                {formType === "ranking" && (
                  <div className="space-y-3 border-t border-secondary pt-5">
                    <p className="text-sm font-medium text-secondary">Items to Rank</p>
                    {formRankItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          size="sm"
                          aria-label={`Item ${i + 1}`}
                          placeholder={`Item ${i + 1}`}
                          value={item}
                          onChange={(value) => {
                            const updated = [...formRankItems];
                            updated[i] = value;
                            setFormRankItems(updated);
                          }}
                          className="flex-1"
                        />
                        {formRankItems.length > 1 && (
                          <ButtonUtility
                            size="xs"
                            color="tertiary"
                            icon={XClose}
                            tooltip="Remove item"
                            onClick={() =>
                              setFormRankItems(formRankItems.filter((_, j) => j !== i))
                            }
                          />
                        )}
                      </div>
                    ))}
                    <Button
                      size="sm"
                      color="link-color"
                      iconLeading={Plus}
                      onClick={() => setFormRankItems([...formRankItems, ""])}
                    >
                      Add item
                    </Button>
                  </div>
                )}

                {/* Star rating config */}
                {formType === "star_rating" && (
                  <div className="border-t border-secondary pt-5">
                    <Input
                      size="sm"
                      type="number"
                      label="Max Stars"
                      value={String(formMaxStars)}
                      onChange={(value) => setFormMaxStars(parseInt(value) || 5)}
                      className="w-32"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    size="md"
                    color="primary"
                    isDisabled={!formText.trim()}
                    onClick={handleSaveQuestion}
                    className="flex-1"
                  >
                    {editingIndex !== null ? "Update Question" : "Add Question"}
                  </Button>
                  <Button
                    size="md"
                    color="secondary"
                    onClick={() => {
                      setModalOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}
