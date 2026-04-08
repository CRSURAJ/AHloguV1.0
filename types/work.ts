export type BreakPeriod = {
  startAt: string;
  endAt?: string;
};

export type PendingActionType = "start" | "stop" | "break_start" | "break_end";

export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export type PendingAction = {
  id: string;
  type: PendingActionType;
  payload: {
    sessionId: string;
    plumber: string;
    jobId: string;
    location: string;
    description: string;
    role: string;
    ts: string;
  };
  status: SyncStatus;
};

export type WorkSession = {
  sessionId: string;
  plumber: string;
  jobId: string;
  location: string;
  description: string;
  role: string;
  startedAt: string;
  stoppedAt?: string;
  breaks: BreakPeriod[];
  syncState: SyncStatus;
};

export type DemoState = {
  activeSession: WorkSession | null;
  sessions: WorkSession[];
  pendingQueue: PendingAction[];
};
