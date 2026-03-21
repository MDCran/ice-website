"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAutoSave } from "@/hooks/useAutoSave";
import ContactSelector from "@/components/portal/ContactSelector";
import {
  Loader2,
  Check,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Star,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import type { Survey, SurveyQuestion } from "@/lib/types/database";

// ---------------------------------------------------------------------------
// Inline question components
// ---------------------------------------------------------------------------

function ShortTextQuestion({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
      className="w-full max-w-lg px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all text-lg"
      placeholder="Type your answer..."
    />
  );
}

function LongTextQuestion({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
      rows={5}
      className="w-full max-w-lg px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all resize-none"
      placeholder="Type your answer..."
    />
  );
}

function MultipleChoiceQuestion({
  options,
  value,
  onChange,
  maxSelections,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  maxSelections: number;
}) {
  const selected: string[] = value ? JSON.parse(value) : [];

  if (maxSelections === 1) {
    return (
      <div className="space-y-3 max-w-lg">
        {options.map((option) => (
          <label
            key={option}
            className={cn(
              "flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer transition-all",
              selected.includes(option)
                ? "bg-sky-500/10 border-sky-400/40 text-white"
                : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]"
            )}
          >
            <input
              type="radio"
              name="mc-choice"
              value={option}
              checked={selected.includes(option)}
              onChange={() => onChange(JSON.stringify([option]))}
              className="sr-only"
            />
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                selected.includes(option)
                  ? "border-sky-400 bg-sky-500"
                  : "border-white/20"
              )}
            >
              {selected.includes(option) && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
            <span className="text-sm">{option}</span>
          </label>
        ))}
      </div>
    );
  }

  const toggleOption = (option: string) => {
    let next: string[];
    if (selected.includes(option)) {
      next = selected.filter((s) => s !== option);
    } else {
      if (maxSelections > 0 && selected.length >= maxSelections) return;
      next = [...selected, option];
    }
    onChange(JSON.stringify(next));
  };

  return (
    <div className="space-y-3 max-w-lg">
      {maxSelections > 1 && (
        <p className="text-xs text-slate-500 mb-2">
          Select up to {maxSelections} options
        </p>
      )}
      {options.map((option) => (
        <label
          key={option}
          className={cn(
            "flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer transition-all",
            selected.includes(option)
              ? "bg-sky-500/10 border-sky-400/40 text-white"
              : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]"
          )}
        >
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => toggleOption(option)}
            className="sr-only"
          />
          <div
            className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
              selected.includes(option)
                ? "border-sky-400 bg-sky-500"
                : "border-white/20"
            )}
          >
            {selected.includes(option) && <Check size={12} className="admin-text" />}
          </div>
          <span className="text-sm">{option}</span>
        </label>
      ))}
    </div>
  );
}

function YesNoQuestion({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 max-w-lg">
      {["Yes", "No"].map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            "flex-1 py-5 rounded-xl border text-lg font-medium transition-all",
            value === option
              ? "bg-sky-500/10 border-sky-400/40 text-white"
              : "bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06] hover:text-white"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function RankingQuestion({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const items: string[] = value ? JSON.parse(value) : [...options];

  const moveItem = (index: number, direction: "up" | "down") => {
    const next = [...items];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    onChange(JSON.stringify(next));
  };

  return (
    <div className="space-y-2 max-w-lg">
      {items.map((item, index) => (
        <div
          key={item}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10"
        >
          <span className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">
            {index + 1}
          </span>
          <span className="flex-1 text-sm admin-text">{item}</span>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => moveItem(index, "up")}
              disabled={index === 0}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={() => moveItem(index, "down")}
              disabled={index === items.length - 1}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PhoneTimeDayQuestion({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const data = value
    ? JSON.parse(value)
    : { name: "", phone: "", startTime: "", endTime: "", days: [] as string[] };

  const update = (patch: Record<string, unknown>) => {
    onChange(JSON.stringify({ ...data, ...patch }));
  };

  const toggleDay = (day: string) => {
    const days: string[] = data.days || [];
    const next = days.includes(day)
      ? days.filter((d: string) => d !== day)
      : [...days, day];
    update({ days: next });
  };

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const times = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6;
    const min = i % 2 === 0 ? "00" : "30";
    const h = hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? "PM" : "AM";
    return `${h}:${min} ${period}`;
  });

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Contact Name
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
          placeholder="Full name"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => update({ phone: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all"
          placeholder="(555) 123-4567"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Available From
          </label>
          <select
            value={data.startTime}
            onChange={(e) => update({ startTime: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all appearance-none"
          >
            <option value="" className="bg-slate-900">
              Select
            </option>
            {times.map((t) => (
              <option key={t} value={t} className="bg-slate-900">
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Available Until
          </label>
          <select
            value={data.endTime}
            onChange={(e) => update({ endTime: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20 transition-all appearance-none"
          >
            <option value="" className="bg-slate-900">
              Select
            </option>
            {times.map((t) => (
              <option key={t} value={t} className="bg-slate-900">
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Available Days
        </label>
        <div className="flex flex-wrap gap-2">
          {weekdays.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                (data.days || []).includes(day)
                  ? "bg-sky-500/10 border border-sky-400/40 text-sky-400"
                  : "bg-white/[0.03] border border-white/10 text-slate-400 hover:text-white"
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StarRatingQuestion({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const rating = value ? parseInt(value, 10) : 0;

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(String(star))}
          className="p-1 transition-transform hover:scale-110"
        >
          <Star
            size={36}
            className={cn(
              "transition-colors",
              star <= rating
                ? "text-amber-400 fill-amber-400"
                : "text-slate-600 hover:text-amber-400/50"
            )}
          />
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main survey page
// ---------------------------------------------------------------------------

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // 0 = contact screen
  const [responseValues, setResponseValues] = useState<
    Record<string, string>
  >({});
  const [contactId, setContactId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState(1); // 1=forward, -1=backward

  const totalScreens = questions.length + 1; // +1 for contact screen

  const fetchSurvey = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/portal/login");
      return;
    }

    const { data: clientUser } = await supabase
      .from("client_users")
      .select("client_account_id")
      .eq("id", user.id)
      .single();
    if (!clientUser) {
      router.push("/portal/login");
      return;
    }

    setAccountId(clientUser.client_account_id);
    setUserId(user.id);

    const [surveyResult, questionsResult] = await Promise.all([
      supabase
        .from("surveys")
        .select("*")
        .eq("id", surveyId)
        .eq("client_account_id", clientUser.client_account_id)
        .single(),
      supabase
        .from("survey_questions")
        .select("*")
        .eq("survey_id", surveyId)
        .order("sort_order", { ascending: true }),
    ]);

    if (!surveyResult.data) {
      setError("Survey not found.");
      setLoading(false);
      return;
    }

    setSurvey(surveyResult.data);
    setQuestions(questionsResult.data ?? []);
    setContactId(surveyResult.data.contact_id ?? null);

    // Resume from saved position
    if (surveyResult.data.response_values) {
      setResponseValues(
        surveyResult.data.response_values as Record<string, string>
      );
    }
    if (surveyResult.data.current_question_index > 0) {
      setCurrentIndex(surveyResult.data.current_question_index);
    }

    setLoading(false);
  }, [surveyId, router]);

  useEffect(() => {
    fetchSurvey();
  }, [fetchSurvey]);

  // Auto-save
  const savePayload = useMemo(
    () => ({ responseValues, currentIndex }),
    [responseValues, currentIndex]
  );

  const saveData = useCallback(
    async (data: { responseValues: Record<string, string>; currentIndex: number }) => {
      const supabase = createClient();
      await supabase
        .from("surveys")
        .update({
          response_values: data.responseValues,
          current_question_index: data.currentIndex,
          contact_id: contactId,
        })
        .eq("id", surveyId);
    },
    [surveyId, contactId]
  );

  const { saving, lastSaved } = useAutoSave({
    data: savePayload,
    onSave: saveData,
    debounceMs: 1500,
    enabled: !loading && !submitted,
  });

  // Navigation
  const goNext = () => {
    if (currentIndex === 0 && !contactId) {
      setError("Please select a contact before proceeding.");
      return;
    }
    setError("");
    if (currentIndex < totalScreens - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goBack = () => {
    setError("");
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Handle Enter key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "TEXTAREA") return;
        e.preventDefault();
        if (currentIndex < totalScreens - 1) {
          goNext();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIndex, totalScreens, contactId]);

  const handleReset = () => {
    setResponseValues({});
    setCurrentIndex(0);
    setContactId(null);
    setDirection(-1);
  };

  const handleSubmit = async () => {
    // Validate required questions
    const missingRequired = questions.filter(
      (q) => q.is_required && !responseValues[q.id]?.trim()
    );
    if (missingRequired.length > 0) {
      setError(
        `Please answer all required questions before submitting.`
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("surveys")
        .update({
          status: "completed",
          submitted_at: new Date().toISOString(),
          submitted_by: userId,
          response_values: responseValues,
          contact_id: contactId,
          current_question_index: totalScreens - 1,
        })
        .eq("id", surveyId);

      if (updateError) throw updateError;

      setSubmitted(true);
      setTimeout(() => {
        router.push("/portal/surveys");
      }, 2000);
    } catch {
      setError("Failed to submit survey. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateResponse = (questionId: string, value: string) => {
    setResponseValues((prev) => ({ ...prev, [questionId]: value }));
  };

  // Render question based on type
  const renderQuestion = (question: SurveyQuestion) => {
    const value = responseValues[question.id] || "";
    const config = question.config || {};
    const maxSelections =
      (config.maxSelections as number) || (question.options?.length ?? 0);

    switch (question.question_type) {
      case "short_text":
        return (
          <ShortTextQuestion
            value={value}
            onChange={(v) => updateResponse(question.id, v)}
          />
        );
      case "long_text":
        return (
          <LongTextQuestion
            value={value}
            onChange={(v) => updateResponse(question.id, v)}
          />
        );
      case "multiple_choice":
        return (
          <MultipleChoiceQuestion
            options={question.options || []}
            value={value}
            onChange={(v) => updateResponse(question.id, v)}
            maxSelections={maxSelections}
          />
        );
      case "yes_no":
        return (
          <YesNoQuestion
            value={value}
            onChange={(v) => updateResponse(question.id, v)}
          />
        );
      case "ranking":
        return (
          <RankingQuestion
            options={question.options || []}
            value={value}
            onChange={(v) => updateResponse(question.id, v)}
          />
        );
      case "phone_time_day":
        return (
          <PhoneTimeDayQuestion
            value={value}
            onChange={(v) => updateResponse(question.id, v)}
          />
        );
      case "star_rating":
        return (
          <StarRatingQuestion
            value={value}
            onChange={(v) => updateResponse(question.id, v)}
          />
        );
      default:
        return (
          <ShortTextQuestion
            value={value}
            onChange={(v) => updateResponse(question.id, v)}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <Check size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold admin-text mb-2">
          Survey Submitted Successfully
        </h2>
        <p className="text-sm text-slate-400">
          Thank you for your responses. Redirecting...
        </p>
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle size={32} className="text-red-400 mb-4" />
        <p className="text-sm text-slate-400">{error}</p>
        <button
          onClick={() => router.push("/portal/surveys")}
          className="mt-4 text-sm text-sky-400 hover:text-sky-300 transition-colors"
        >
          Back to Surveys
        </button>
      </div>
    );
  }

  const isLastQuestion = currentIndex === totalScreens - 1;
  const currentQuestion =
    currentIndex > 0 ? questions[currentIndex - 1] : null;
  const progressPercent =
    totalScreens > 1 ? (currentIndex / (totalScreens - 1)) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">
            {currentIndex === 0
              ? "Getting started"
              : `Question ${currentIndex} of ${questions.length}`}
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {saving && (
              <span className="flex items-center gap-1.5 text-amber-400">
                <Loader2 size={10} className="animate-spin" />
                Saving
              </span>
            )}
            {!saving && lastSaved && (
              <span className="text-emerald-400">Saved</span>
            )}
          </div>
        </div>
        <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-sky-500 rounded-full"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {currentIndex === 0 ? (
              /* Contact Selector Screen */
              <div className="text-center">
                <h2 className="text-2xl font-bold admin-text mb-2">
                  {survey?.title}
                </h2>
                {survey?.description && (
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    {survey.description}
                  </p>
                )}
                <div className="max-w-md mx-auto text-left">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Who is filling out this survey?
                  </label>
                  <ContactSelector
                    clientAccountId={accountId}
                    value={contactId}
                    onChange={setContactId}
                    allowAdd={true}
                  />
                </div>
              </div>
            ) : currentQuestion ? (
              /* Question Screen */
              <div>
                <h2 className="text-xl font-bold admin-text mb-2">
                  {currentQuestion.question_text}
                  {currentQuestion.is_required && (
                    <span className="text-red-400 ml-1">*</span>
                  )}
                </h2>
                {currentQuestion.description && (
                  <p className="text-sm text-slate-400 mb-6">
                    {currentQuestion.description}
                  </p>
                )}
                <div className="mt-6">{renderQuestion(currentQuestion)}</div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4 mt-4">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 pb-4 border-t border-white/5 mt-8">
        <div className="flex items-center gap-2">
          {currentIndex > 0 && (
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-300 transition-colors text-sm"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check size={16} />
                Submit Survey
              </>
            )}
          </button>
        ) : (
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors"
          >
            Next
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
