"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAutoSave } from "@/hooks/useAutoSave";
import ContactSelector from "@/components/portal/ContactSelector";
import {
  Check,
  RefreshCcw01,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Star01,
  AlertCircle,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { RadioButton, RadioGroup } from "@/components/base/radio-buttons/radio-buttons";
import { NativeSelect } from "@/components/base/select/select-native";
import { TextArea } from "@/components/base/textarea/textarea";
import { ProgressBarBase } from "@/components/base/progress-indicators/progress-indicators";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { cx } from "@/utils/cx";
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
    <Input
      size="md"
      value={value}
      onChange={onChange}
      autoFocus
      placeholder="Type your answer..."
      aria-label="Your answer"
      className="max-w-lg"
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
    <TextArea
      value={value}
      onChange={onChange}
      autoFocus
      rows={5}
      placeholder="Type your answer..."
      aria-label="Your answer"
      className="max-w-lg"
      textAreaClassName="resize-none"
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
      <RadioGroup
        aria-label="Answer options"
        value={selected[0] ?? null}
        onChange={(v) => onChange(JSON.stringify([v]))}
        className="max-w-lg gap-3"
      >
        {options.map((option) => (
          <RadioButton
            key={option}
            value={option}
            label={option}
            className="w-full cursor-pointer rounded-xl bg-primary p-4 ring-1 ring-secondary ring-inset transition duration-100 ease-linear selected:ring-2 selected:ring-brand hover:bg-primary_hover"
          />
        ))}
      </RadioGroup>
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
    <div className="max-w-lg space-y-3">
      {maxSelections > 1 && (
        <p className="mb-2 text-sm text-tertiary">
          Select up to {maxSelections} options
        </p>
      )}
      {options.map((option) => (
        <Checkbox
          key={option}
          isSelected={selected.includes(option)}
          onChange={() => toggleOption(option)}
          label={option}
          className="w-full cursor-pointer rounded-xl bg-primary p-4 ring-1 ring-secondary ring-inset transition duration-100 ease-linear selected:ring-2 selected:ring-brand hover:bg-primary_hover"
        />
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
    <div className="flex max-w-lg items-center gap-4">
      {["Yes", "No"].map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={cx(
            "flex-1 cursor-pointer rounded-xl py-5 text-lg font-semibold ring-inset outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2",
            value === option
              ? "bg-brand-primary_alt text-brand-secondary ring-2 ring-brand"
              : "bg-primary text-secondary ring-1 ring-secondary hover:bg-primary_hover"
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
    <div className="max-w-lg space-y-2">
      {items.map((item, index) => (
        <div
          key={item}
          className="flex items-center gap-3 rounded-lg bg-primary px-4 py-3 shadow-xs ring-1 ring-secondary ring-inset"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-primary text-xs font-semibold text-brand-secondary">
            {index + 1}
          </span>
          <span className="flex-1 text-sm font-medium text-primary">{item}</span>
          <div className="flex flex-col gap-0.5">
            <ButtonUtility
              size="xs"
              color="tertiary"
              icon={ChevronUp}
              aria-label={`Move ${item} up`}
              isDisabled={index === 0}
              onClick={() => moveItem(index, "up")}
            />
            <ButtonUtility
              size="xs"
              color="tertiary"
              icon={ChevronDown}
              aria-label={`Move ${item} down`}
              isDisabled={index === items.length - 1}
              onClick={() => moveItem(index, "down")}
            />
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

  const timeOptions = [
    { label: "Select", value: "" },
    ...times.map((t) => ({ label: t, value: t })),
  ];

  return (
    <div className="max-w-lg space-y-4">
      <Input
        label="Contact Name"
        value={data.name}
        onChange={(v) => update({ name: v })}
        placeholder="Full name"
      />
      <Input
        label="Phone Number"
        type="tel"
        value={data.phone}
        onChange={(v) => update({ phone: v })}
        placeholder="(555) 123-4567"
      />
      <div className="grid grid-cols-2 gap-4">
        <NativeSelect
          label="Available From"
          value={data.startTime}
          onChange={(e) => update({ startTime: e.target.value })}
          options={timeOptions}
        />
        <NativeSelect
          label="Available Until"
          value={data.endTime}
          onChange={(e) => update({ endTime: e.target.value })}
          options={timeOptions}
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-secondary">Available Days</p>
        <div role="group" aria-label="Available days" className="flex flex-wrap gap-2">
          {weekdays.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              aria-pressed={(data.days || []).includes(day)}
              className={cx(
                "cursor-pointer rounded-lg px-3 py-2 text-sm font-medium ring-inset outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2",
                (data.days || []).includes(day)
                  ? "bg-brand-primary text-brand-secondary ring-1 ring-brand"
                  : "bg-primary text-secondary ring-1 ring-primary hover:bg-primary_hover"
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
          type="button"
          onClick={() => onChange(String(star))}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          className="cursor-pointer rounded-md p-1 outline-focus-ring transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Star01
            aria-hidden="true"
            className={cx(
              "size-9 transition-colors",
              star <= rating
                ? "fill-utility-yellow-400 text-utility-yellow-400"
                : "text-fg-quaternary hover:text-utility-yellow-400"
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
        <LoadingIndicator type="line-spinner" size="md" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FeaturedIcon color="success" theme="light" size="xl" icon={Check} className="mb-4" />
        <h2 className="mb-2 text-xl font-semibold text-primary">
          Survey Submitted Successfully
        </h2>
        <p className="text-md text-tertiary">
          Thank you for your responses. Redirecting...
        </p>
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FeaturedIcon color="error" theme="light" size="xl" icon={AlertCircle} className="mb-4" />
        <p className="text-md text-tertiary">{error}</p>
        <Button
          color="link-color"
          size="md"
          className="mt-4"
          onClick={() => router.push("/portal/surveys")}
        >
          Back to Surveys
        </Button>
      </div>
    );
  }

  const isLastQuestion = currentIndex === totalScreens - 1;
  const currentQuestion =
    currentIndex > 0 ? questions[currentIndex - 1] : null;
  const progressPercent =
    totalScreens > 1 ? (currentIndex / (totalScreens - 1)) * 100 : 0;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-tertiary">
            {currentIndex === 0
              ? "Getting started"
              : `Question ${currentIndex} of ${questions.length}`}
          </span>
          <div className="flex items-center gap-2 text-sm text-tertiary">
            {saving && <span className="animate-pulse">Saving...</span>}
            {!saving && lastSaved && (
              <span className="flex items-center gap-1 text-fg-success-primary">
                <Check aria-hidden="true" className="size-3.5 stroke-[2.5px]" />
                Saved
              </span>
            )}
          </div>
        </div>
        <ProgressBarBase value={progressPercent} className="h-2" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center">
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
                <h2 className="mb-2 text-display-xs font-semibold text-primary">
                  {survey?.title}
                </h2>
                {survey?.description && (
                  <p className="mx-auto mb-8 max-w-md text-md text-tertiary">
                    {survey.description}
                  </p>
                )}
                <div className="mx-auto max-w-md text-left">
                  <Label className="mb-3">Who is filling out this survey?</Label>
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
                <h2 className="mb-2 text-xl font-semibold text-primary">
                  {currentQuestion.question_text}
                  {currentQuestion.is_required && (
                    <span className="ml-1 text-brand-tertiary">*</span>
                  )}
                </h2>
                {currentQuestion.description && (
                  <p className="mb-6 text-md text-tertiary">
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
        <div className="mt-4 mb-4 flex items-center gap-2 rounded-lg bg-error-primary p-3 text-sm font-medium text-error-primary ring-1 ring-error_subtle ring-inset">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-secondary pt-6 pb-4">
        <div className="flex items-center gap-2">
          {currentIndex > 0 && (
            <Button size="md" color="secondary" iconLeading={ArrowLeft} onClick={goBack}>
              Back
            </Button>
          )}
          <Button size="md" color="tertiary" iconLeading={RefreshCcw01} onClick={handleReset}>
            Reset
          </Button>
        </div>

        {isLastQuestion ? (
          <Button
            size="md"
            color="primary"
            iconLeading={Check}
            isLoading={submitting}
            showTextWhileLoading
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Submit Survey"}
          </Button>
        ) : (
          <Button size="md" color="primary" iconTrailing={ArrowRight} onClick={goNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
