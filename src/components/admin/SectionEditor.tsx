"use client";

import { useState, useCallback } from "react";
import { AlertCircle, Check, Save01 } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { TextAreaBase } from "@/components/base/textarea/textarea";
import { cx } from "@/utils/cx";

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
          <span className="text-sm text-tertiary">
            Editing <span className="font-medium text-primary">{sectionKey}</span>
          </span>
          <Badge size="sm" color="gray">
            {sectionType}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" color="secondary" onClick={handleFormat}>
            Format JSON
          </Button>
        </div>
      </div>

      <div className="relative">
        <TextAreaBase
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (saveStatus === "saved" || saveStatus === "error") {
              setSaveStatus("idle");
            }
          }}
          spellCheck={false}
          size="sm"
          className={cx(
            "min-h-[320px] resize-y font-mono text-sm leading-relaxed",
            !isValidJson && content.trim().length > 0 && "ring-error_subtle focus:ring-2 focus:ring-error"
          )}
        />
        {!isValidJson && content.trim().length > 0 && (
          <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-md bg-error-primary px-2 py-1 text-xs text-error-primary ring-1 ring-error_subtle ring-inset">
            <AlertCircle className="size-3" />
            Invalid JSON
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="min-h-[24px]">
          {saveStatus === "error" && errorMessage && (
            <p className="flex items-center gap-1.5 text-sm text-error-primary">
              <AlertCircle className="size-3.5" />
              {errorMessage}
            </p>
          )}
          {saveStatus === "saved" && (
            <p className="flex items-center gap-1.5 text-sm text-success-primary">
              <Check className="size-3.5" />
              Saved successfully
            </p>
          )}
        </div>
        <Button
          size="md"
          iconLeading={saveStatus === "saved" ? Check : Save01}
          isLoading={saveStatus === "saving"}
          showTextWhileLoading
          isDisabled={saveStatus === "saving" || (!isValidJson && content.trim().length > 0)}
          onClick={handleSave}
        >
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
              ? "Saved"
              : "Save Section"}
        </Button>
      </div>
    </div>
  );
}
