export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export type LogItem = {
  id: string;
  loguId: string;
  ts: number;
  syncedAt?: number;
  fullname: string;
  jobId: string;
  location: string;
  role: string;
  jobDocs?: string;
  description: string;
  startedAt: string;
  stoppedAt: string;
  breakMinutes: number;
  workedMinutes: number;
  syncStatus: SyncStatus;
  syncMessage: string;
};

export type ActiveSession = {
  isWorking: boolean;
  isOnBreak: boolean;
  startTime: string | null;
  breakStartTime: string | null;
  breakMinutes: number;
  jobId: string;
  location: string;
  role: string;
  jobDocs: string;
  description: string;
};

export type DraftState = {
  jobId: string;
  location: string;
  role: string;
  jobDocs: string;
  description: string;
};

export type CurrentUser = {
  id: string;
  fullName: string;
  role: string;
};
