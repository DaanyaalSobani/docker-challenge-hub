import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@workspace/replit-auth-web";

const STORAGE_KEY = "dockerquest:progress";
const PROGRESS_URL = "/api/me/progress";

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
        files.push({
          name: (f as SavedFile).name,
          content: (f as SavedFile).content,
        });
      }
    }
    if (files.length > 0) out[key] = files;
  }
  return out;
}

function sanitizeState(value: unknown): ProgressState {
  if (!value || typeof value !== "object") return EMPTY_STATE;
  const v = value as Record<string, unknown>;
  const completedIds = Array.isArray(v.completedIds)
    ? (v.completedIds.filter((id) => typeof id === "string") as string[])
    : [];
  const submissions = sanitizeSubmissions(v.submissions);
  return { completedIds, submissions };
}

function readLocal(): ProgressState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    return sanitizeState(JSON.parse(raw));
  } catch {
    return EMPTY_STATE;
  }
}

function writeLocal(state: ProgressState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearLocal() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function isEmpty(s: ProgressState): boolean {
  return s.completedIds.length === 0 && Object.keys(s.submissions).length === 0;
}

function mergeState(a: ProgressState, b: ProgressState): ProgressState {
  return {
    completedIds: Array.from(new Set([...a.completedIds, ...b.completedIds])),
    submissions: { ...a.submissions, ...b.submissions },
  };
}

async function fetchServer(): Promise<ProgressState | null> {
  try {
    const res = await fetch(PROGRESS_URL, { credentials: "include" });
    if (!res.ok) return null;
    return sanitizeState(await res.json());
  } catch {
    return null;
  }
}

async function pushServer(state: ProgressState): Promise<boolean> {
  try {
    const res = await fetch(PROGRESS_URL, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    return res.ok;
  } catch {
    return false;
  }
}

interface ProgressContextValue {
  state: ProgressState;
  source: "local" | "server" | "loading";
  markComplete: (challengeId: string) => void;
  saveSubmission: (challengeId: string, files: SavedFile[]) => void;
  getSubmission: (challengeId: string) => SavedFile[] | undefined;
  isCompleted: (challengeId: string) => boolean;
  reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<ProgressState>(() => readLocal());
  const [source, setSource] = useState<"local" | "server" | "loading">(
    "local",
  );

  // Track current source mode in a ref so writes know where to persist.
  const sourceRef = useRef<"local" | "server" | "loading">("local");
  sourceRef.current = source;

  // When auth state resolves, decide which source backs the state.
  useEffect(() => {
    if (authLoading) {
      setSource("loading");
      return;
    }

    if (!isAuthenticated) {
      // Logged out: re-read local (in case we just signed out).
      setSource("local");
      setState(readLocal());
      return;
    }

    // Authenticated: pull server state, optionally migrating local progress.
    let cancelled = false;
    setSource("loading");
    (async () => {
      const server = await fetchServer();
      if (cancelled) return;

      const local = readLocal();
      let next: ProgressState;
      if (server === null) {
        // Server unreachable — fall back to local but stay in loading so we
        // don't accidentally overwrite the server with stale data.
        next = local;
        setState(next);
        setSource("local");
        return;
      }

      if (!isEmpty(local)) {
        // Migrate local into server. Only clear the local copy if the
        // server confirms the merged write — otherwise we'd silently drop
        // the user's only persisted progress.
        next = mergeState(server, local);
        const ok = await pushServer(next);
        if (cancelled) return;
        if (ok) clearLocal();
      } else {
        next = server;
      }
      setState(next);
      setSource("server");
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading]);

  const persist = useCallback((next: ProgressState) => {
    setState(next);
    if (sourceRef.current === "server") {
      void pushServer(next);
    } else if (sourceRef.current === "local") {
      writeLocal(next);
    }
  }, []);

  const markComplete = useCallback(
    (challengeId: string) => {
      setState((current) => {
        if (current.completedIds.includes(challengeId)) return current;
        const next: ProgressState = {
          ...current,
          completedIds: [...current.completedIds, challengeId],
        };
        if (sourceRef.current === "server") void pushServer(next);
        else if (sourceRef.current === "local") writeLocal(next);
        return next;
      });
    },
    [],
  );

  const saveSubmission = useCallback(
    (challengeId: string, files: SavedFile[]) => {
      const trimmed: SavedFile[] = files.map((f) => ({
        name: f.name,
        content: f.content,
      }));
      setState((current) => {
        const next: ProgressState = {
          ...current,
          submissions: { ...current.submissions, [challengeId]: trimmed },
        };
        if (sourceRef.current === "server") void pushServer(next);
        else if (sourceRef.current === "local") writeLocal(next);
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    persist(EMPTY_STATE);
  }, [persist]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      source,
      markComplete,
      saveSubmission,
      getSubmission: (id: string) => state.submissions[id],
      isCompleted: (id: string) => state.completedIds.includes(id),
      reset,
    }),
    [state, source, markComplete, saveSubmission, reset],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return {
    completedIds: ctx.state.completedIds,
    totalCompleted: ctx.state.completedIds.length,
    isCompleted: ctx.isCompleted,
    markComplete: ctx.markComplete,
    saveSubmission: ctx.saveSubmission,
    getSubmission: ctx.getSubmission,
    reset: ctx.reset,
    source: ctx.source,
  };
}
