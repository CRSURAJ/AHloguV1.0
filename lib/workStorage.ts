import type {
  ActiveSession,
  DraftState,
  LogItem,
  SyncStatus,
} from "@/types/work";

const LEGACY_LOGS_KEY = "project_logu_logs";

function getStorageKeys(userId: string) {
  return {
    logs: `project_logu:${userId}:logs`,
    session: `project_logu:${userId}:session`,
    draft: `project_logu:${userId}:draft`,
  };
}

function safeStatus(value: unknown): SyncStatus {
  if (
    value === "pending" ||
    value === "syncing" ||
    value === "synced" ||
    value === "failed"
  ) {
    return value;
  }

  return "pending";
}

function makeFallbackId(index: number): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `log-${Date.now()}-${index}`;
}

function normalizeLog(item: Partial<LogItem>, index: number): LogItem {
  return {
    id:
      typeof item.id === "string"
        ? item.id
        : typeof item.id === "number"
          ? String(item.id)
          : makeFallbackId(index),
    loguId:
      typeof item.loguId === "string" && item.loguId.trim() !== ""
        ? item.loguId
        : makeFallbackId(index + 1000),
    ts: typeof item.ts === "number" ? item.ts : Date.now(),
    syncedAt: typeof item.syncedAt === "number" ? item.syncedAt : undefined,
    fullname: typeof item.fullname === "string" ? item.fullname : "",
    jobId: typeof item.jobId === "string" ? item.jobId : "",
    location: typeof item.location === "string" ? item.location : "",
    role: typeof item.role === "string" ? item.role : "",
    jobDocs: typeof item.jobDocs === "string" ? item.jobDocs : "",
    description: typeof item.description === "string" ? item.description : "",
    startedAt: typeof item.startedAt === "string" ? item.startedAt : "",
    stoppedAt: typeof item.stoppedAt === "string" ? item.stoppedAt : "",
    breakMinutes:
      typeof item.breakMinutes === "number" ? item.breakMinutes : 0,
    workedMinutes:
      typeof item.workedMinutes === "number" ? item.workedMinutes : 0,
    syncStatus: safeStatus(item.syncStatus),
    syncMessage:
      typeof item.syncMessage === "string"
        ? item.syncMessage
        : "Waiting to sync",
  };
}

function normalizeSession(item: Partial<ActiveSession>): ActiveSession {
  return {
    isWorking: item.isWorking === true,
    isOnBreak: item.isOnBreak === true,
    startTime: typeof item.startTime === "string" ? item.startTime : null,
    breakStartTime:
      typeof item.breakStartTime === "string" ? item.breakStartTime : null,
    breakMinutes:
      typeof item.breakMinutes === "number" ? item.breakMinutes : 0,
    jobId: typeof item.jobId === "string" ? item.jobId : "",
    location: typeof item.location === "string" ? item.location : "",
    role: typeof item.role === "string" ? item.role : "",
    jobDocs: typeof item.jobDocs === "string" ? item.jobDocs : "",
    description: typeof item.description === "string" ? item.description : "",
  };
}

function normalizeDraft(item: Partial<DraftState>): DraftState {
  return {
    jobId: typeof item.jobId === "string" ? item.jobId : "",
    location: typeof item.location === "string" ? item.location : "",
    role: typeof item.role === "string" ? item.role : "",
    jobDocs: typeof item.jobDocs === "string" ? item.jobDocs : "",
    description: typeof item.description === "string" ? item.description : "",
  };
}

export function loadLogs(userId: string): LogItem[] {
  if (typeof window === "undefined") return [];

  const keys = getStorageKeys(userId);
  const raw = window.localStorage.getItem(keys.logs);

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<LogItem>[];
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeLog);
    } catch {
      return [];
    }
  }

  const legacyRaw = window.localStorage.getItem(LEGACY_LOGS_KEY);

  if (!legacyRaw) return [];

  try {
    const parsed = JSON.parse(legacyRaw) as Partial<LogItem>[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeLog);
  } catch {
    return [];
  }
}

export function saveLogs(userId: string, logs: LogItem[]): void {
  if (typeof window === "undefined") return;

  const keys = getStorageKeys(userId);
  window.localStorage.setItem(keys.logs, JSON.stringify(logs));
}

export function clearLogs(userId: string): void {
  if (typeof window === "undefined") return;

  const keys = getStorageKeys(userId);
  window.localStorage.removeItem(keys.logs);
}

export function loadSession(userId: string): ActiveSession | null {
  if (typeof window === "undefined") return null;

  const keys = getStorageKeys(userId);
  const raw = window.localStorage.getItem(keys.session);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ActiveSession>;
    return normalizeSession(parsed);
  } catch {
    return null;
  }
}

export function saveSession(userId: string, session: ActiveSession): void {
  if (typeof window === "undefined") return;

  const keys = getStorageKeys(userId);
  window.localStorage.setItem(keys.session, JSON.stringify(session));
}

export function clearSession(userId: string): void {
  if (typeof window === "undefined") return;

  const keys = getStorageKeys(userId);
  window.localStorage.removeItem(keys.session);
}

export function loadDraft(userId: string): DraftState | null {
  if (typeof window === "undefined") return null;

  const keys = getStorageKeys(userId);
  const raw = window.localStorage.getItem(keys.draft);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<DraftState>;
    return normalizeDraft(parsed);
  } catch {
    return null;
  }
}

export function saveDraft(userId: string, draft: DraftState): void {
  if (typeof window === "undefined") return;

  const keys = getStorageKeys(userId);
  window.localStorage.setItem(keys.draft, JSON.stringify(draft));
}

export function clearDraft(userId: string): void {
  if (typeof window === "undefined") return;

  const keys = getStorageKeys(userId);
  window.localStorage.removeItem(keys.draft);
}
