"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout>(undefined);
  const dataRef = useRef(data);
  const initialRef = useRef(true);

  dataRef.current = data;

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await onSave(dataRef.current);
      setLastSaved(new Date());
    } catch (e) {
      console.error("Auto-save failed:", e);
    } finally {
      setSaving(false);
    }
  }, [onSave]);

  useEffect(() => {
    if (!enabled) return;
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, save, debounceMs, enabled]);

  return { saving, lastSaved };
}
