import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "dockerquest:progress";

type ProgressState = {
  completedIds: string[];
};

function readProgress(): ProgressState {
  if (typeof window === "undefined") return { completedIds: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedIds: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.completedIds)) return { completedIds: [] };
    return { completedIds: parsed.completedIds.filter((id: unknown) => typeof id === "string") };
  } catch {
    return { completedIds: [] };
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
    const updated = { completedIds: [...current.completedIds, challengeId] };
    writeProgress(updated);
    emitChange();
  }, []);

  const reset = useCallback(() => {
    writeProgress({ completedIds: [] });
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
    reset,
  };
}

/**
 * Given an ordered list of challenge IDs and the set of completed ones,
 * returns a function that determines whether a given challenge is locked.
 *
 * A challenge is unlocked if it's the first one OR the previous one
 * (by `order`) has been completed.
 */
export function buildLockChecker(orderedIds: string[], completedIds: string[]) {
  const completedSet = new Set(completedIds);
  return (id: string): boolean => {
    const idx = orderedIds.indexOf(id);
    if (idx <= 0) return false;
    const prev = orderedIds[idx - 1];
    return !completedSet.has(prev);
  };
}
