import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "dockerquest:progress";

export type SavedFile = {
  name: string;
  content: string;
};

type ProgressState = {
  completedIds: string[];
  submissions: Record<string, SavedFile[]>;
};

const EMPTY_STATE: ProgressState = { completedIds: [], submissions: {} };

function sanitizeSubmissions(value: unknown): Record<string, SavedFile[]> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, SavedFile[]> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof key !== "string" || !Array.isArray(raw)) continue;
    const files: SavedFile[] = [];
    for (const f of raw) {
      if (
        f &&
        typeof f === "object" &&
        typeof (f as SavedFile).name === "string" &&
        typeof (f as SavedFile).content === "string"
      ) {
        files.push({ name: (f as SavedFile).name, content: (f as SavedFile).content });
      }
    }
    if (files.length > 0) out[key] = files;
  }
  return out;
}

function readProgress(): ProgressState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return EMPTY_STATE;
    const completedIds = Array.isArray(parsed.completedIds)
      ? parsed.completedIds.filter((id: unknown) => typeof id === "string")
      : [];
    const submissions = sanitizeSubmissions(parsed.submissions);
    return { completedIds, submissions };
  } catch {
    return EMPTY_STATE;
  }
}

function writeProgress(state: ProgressState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const STORAGE_EVENT = "dockerquest:progress-updated";

function emitChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(() => readProgress());

  useEffect(() => {
    const sync = () => setState(readProgress());
    window.addEventListener(STORAGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(STORAGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const markComplete = useCallback((challengeId: string) => {
    const current = readProgress();
    if (current.completedIds.includes(challengeId)) return;
    writeProgress({
      ...current,
      completedIds: [...current.completedIds, challengeId],
    });
    emitChange();
  }, []);

  const saveSubmission = useCallback(
    (challengeId: string, files: SavedFile[]) => {
      const current = readProgress();
      const trimmed: SavedFile[] = files.map((f) => ({
        name: f.name,
        content: f.content,
      }));
      writeProgress({
        ...current,
        submissions: { ...current.submissions, [challengeId]: trimmed },
      });
      emitChange();
    },
    [],
  );

  const getSubmission = useCallback(
    (challengeId: string): SavedFile[] | undefined => state.submissions[challengeId],
    [state.submissions],
  );

  const reset = useCallback(() => {
    writeProgress(EMPTY_STATE);
    emitChange();
  }, []);

  const isCompleted = useCallback(
    (challengeId: string) => state.completedIds.includes(challengeId),
    [state.completedIds],
  );

  return {
    completedIds: state.completedIds,
    totalCompleted: state.completedIds.length,
    isCompleted,
    markComplete,
    saveSubmission,
    getSubmission,
    reset,
  };
}
