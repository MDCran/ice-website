"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  Plus,
  X,
  Trash2,
  Pencil,
  Loader2,
  AlertCircle,
  Save,
  GripVertical,
  Send,
  RotateCcw,
} from "lucide-react";

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

const typeBadge: Record<string, { bg: string; text: string }> = {
  short_text: { bg: "bg-blue-500/10", text: "text-blue-400" },
  long_text: { bg: "bg-indigo-500/10", text: "text-indigo-400" },
  multiple_choice: { bg: "bg-violet-500/10", text: "text-violet-400" },
  yes_no: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  ranking: { bg: "bg-amber-500/10", text: "text-amber-400" },
  phone_time_day: { bg: "bg-cyan-500/10", text: "text-cyan-400" },
  star_rating: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
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
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-red-400 text-center py-12">Survey not found.</div>
    );
  }

  const visibleQuestions = questions.filter((q) => !q._deleted);

  return (
    <div>
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/admin/surveys"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Surveys
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <ClipboardList size={20} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold admin-text">Survey Builder</h1>
            <p className="text-sm text-slate-400">
              Editing: {survey.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Status transition buttons */}
          {survey.status === "draft" && (
            <button
              onClick={() => handleStatusChange("active")}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              Send to Client
            </button>
          )}
          {survey.status === "active" && (
            <button
              onClick={() => handleStatusChange("draft")}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Revoke
            </button>
          )}
          {survey.status === "completed" && (
            <span className="px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium">
              Completed
            </span>
          )}

          <button
            onClick={handleSaveAll}
            disabled={saving || survey.status === "completed"}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
          {success}
        </div>
      )}

      {/* Survey meta fields */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold admin-text mb-6">
          Survey Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Title
            </label>
            <input
              type="text"
              value={survey.title}
              onChange={(e) =>
                setSurvey({ ...survey, title: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Status
            </label>
            <div className="flex items-center gap-3">
              {(["draft", "active", "completed"] as const).map((s) => {
                const colors = {
                  draft: "bg-slate-600 text-white",
                  active: "bg-sky-500 text-white",
                  completed: "bg-emerald-500 text-white",
                };
                return (
                  <span
                    key={s}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize ${
                      survey.status === s
                        ? colors[s]
                        : "bg-white/[0.06] border border-white/10 text-slate-500"
                    }`}
                  >
                    {s}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={survey.description ?? ""}
              onChange={(e) =>
                setSurvey({
                  ...survey,
                  description: e.target.value || null,
                })
              }
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Expiration Date
            </label>
            <input
              type="date"
              value={
                survey.expires_at
                  ? survey.expires_at.substring(0, 10)
                  : ""
              }
              onChange={(e) =>
                setSurvey({
                  ...survey,
                  expires_at: e.target.value || null,
                })
              }
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Questions section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold admin-text">
          Questions ({visibleQuestions.length})
        </h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Plus size={16} />
          Add Question
        </button>
      </div>

      {visibleQuestions.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
          <ClipboardList
            size={48}
            className="mx-auto text-slate-600 mb-4"
          />
          <p className="text-slate-400 text-lg mb-2">No questions yet</p>
          <p className="text-slate-500 text-sm">
            Add questions to build your survey.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleQuestions.map((q, idx) => {
            const badge = typeBadge[q.question_type] ?? {
              bg: "bg-slate-500/10",
              text: "text-slate-400",
            };
            const realIndex = questions.indexOf(q);
            return (
              <div
                key={q.id}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-start gap-4"
              >
                <div className="pt-1 text-slate-600">
                  <GripVertical size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-slate-500 font-mono">
                      Q{idx + 1}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${badge.bg} ${badge.text}`}
                    >
                      {q.question_type.replace(/_/g, " ")}
                    </span>
                    {q.is_required && (
                      <span className="text-[10px] text-red-400 font-medium">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm admin-text font-medium">
                    {q.question_text}
                  </p>
                  {q.description && (
                    <p className="text-xs text-slate-500 mt-1">
                      {q.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(realIndex)}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(realIndex)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Question modal */}
      {modalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => {
              setModalOpen(false);
              resetForm();
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold admin-text">
                  {editingIndex !== null ? "Edit Question" : "Add Question"}
                </h2>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Question Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option
                        key={t.value}
                        value={t.value}
                        className="bg-slate-900"
                      >
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question text */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="Enter your question..."
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Additional context for this question..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all resize-none"
                  />
                </div>

                {/* Required toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormRequired(!formRequired)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      formRequired ? "bg-sky-500" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        formRequired ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-300">Required</span>
                </div>

                {/* Multiple choice config */}
                {formType === "multiple_choice" && (
                  <div className="space-y-3 border-t border-white/10 pt-5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Choices
                    </label>
                    {formChoices.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={c}
                          onChange={(e) => {
                            const updated = [...formChoices];
                            updated[i] = e.target.value;
                            setFormChoices(updated);
                          }}
                          placeholder={`Choice ${i + 1}`}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 admin-text text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 transition-all"
                        />
                        {formChoices.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormChoices(
                                formChoices.filter((_, j) => j !== i)
                              )
                            }
                            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormChoices([...formChoices, ""])}
                      className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      + Add choice
                    </button>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Max Selections
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formMaxSelections}
                        onChange={(e) =>
                          setFormMaxSelections(
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-32 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 admin-text text-sm focus:outline-none focus:border-sky-400/60 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Ranking config */}
                {formType === "ranking" && (
                  <div className="space-y-3 border-t border-white/10 pt-5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Items to Rank
                    </label>
                    {formRankItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const updated = [...formRankItems];
                            updated[i] = e.target.value;
                            setFormRankItems(updated);
                          }}
                          placeholder={`Item ${i + 1}`}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 admin-text text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 transition-all"
                        />
                        {formRankItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormRankItems(
                                formRankItems.filter((_, j) => j !== i)
                              )
                            }
                            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setFormRankItems([...formRankItems, ""])
                      }
                      className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      + Add item
                    </button>
                  </div>
                )}

                {/* Star rating config */}
                {formType === "star_rating" && (
                  <div className="border-t border-white/10 pt-5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Max Stars
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formMaxStars}
                      onChange={(e) =>
                        setFormMaxStars(parseInt(e.target.value) || 5)
                      }
                      className="w-32 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 admin-text text-sm focus:outline-none focus:border-sky-400/60 transition-all"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveQuestion}
                    disabled={!formText.trim()}
                    className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    {editingIndex !== null
                      ? "Update Question"
                      : "Add Question"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
