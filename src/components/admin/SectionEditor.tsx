"use client";

import { useState, useCallback } from "react";
import { Save, Check, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SectionEditorProps {
  sectionId: string;
  sectionKey: string;
  sectionType: string;
  initialContent: unknown;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function SectionEditor({
  sectionId,
  sectionKey,
  sectionType,
  initialContent,
}: SectionEditorProps) {
  const [content, setContent] = useState<string>(
    JSON.stringify(initialContent ?? {}, null, 2)
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validateJson = useCallback((text: string): boolean => {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  const isValidJson = validateJson(content);

  const handleSave = async () => {
    if (!isValidJson) {
      setSaveStatus("error");
      setErrorMessage("Invalid JSON. Please fix syntax errors before saving.");
      return;
    }

    setSaveStatus("saving");
    setErrorMessage("");

    const supabase = createClient();
    const parsedContent = JSON.parse(content);

    // Update the page section
    const { error: updateError } = await supabase
      .from("page_sections")
      .update({
        content: parsedContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sectionId);

    if (updateError) {
      setSaveStatus("error");
      setErrorMessage(updateError.message);
      return;
    }

    // Create a version entry
    const { error: versionError } = await supabase
      .from("page_section_versions")
      .insert({
        section_id: sectionId,
        content: parsedContent,
      });

    if (versionError) {
      // Section saved but version failed — warn but don't fail
      console.warn("Version creation failed:", versionError.message);
    }

    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2500);
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(content);
      setContent(JSON.stringify(parsed, null, 2));
    } catch {
      // Ignore — user will see the invalid JSON indicator
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            Editing <span className="admin-text font-medium">{sectionKey}</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-slate-300">
            {sectionType}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFormat}
            className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-3 py-1.5 text-xs font-medium transition-colors"
          >
            Format JSON
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (saveStatus === "saved" || saveStatus === "error") {
              setSaveStatus("idle");
            }
          }}
          spellCheck={false}
          className={`w-full min-h-[320px] bg-white/[0.06] border rounded-xl px-4 py-3 admin-text text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 transition-colors ${
            !isValidJson && content.trim().length > 0
              ? "border-red-500/50 focus:ring-red-500/30"
              : "border-white/10 focus:ring-sky-500/50 focus:border-sky-500/50"
          }`}
        />
        {!isValidJson && content.trim().length > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-red-400 text-xs bg-red-500/10 px-2 py-1 rounded-lg">
            <AlertCircle size={12} />
            Invalid JSON
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="min-h-[24px]">
          {saveStatus === "error" && errorMessage && (
            <p className="text-red-400 text-sm flex items-center gap-1.5">
              <AlertCircle size={14} />
              {errorMessage}
            </p>
          )}
          {saveStatus === "saved" && (
            <p className="text-emerald-400 text-sm flex items-center gap-1.5">
              <Check size={14} />
              Saved successfully
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving" || (!isValidJson && content.trim().length > 0)}
          className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
        >
          {saveStatus === "saving" ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : saveStatus === "saved" ? (
            <>
              <Check size={16} />
              Saved
            </>
          ) : (
            <>
              <Save size={16} />
              Save Section
            </>
          )}
        </button>
      </div>
    </div>
  );
}
