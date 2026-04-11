export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export type LogItem = {
  id: number;
  loguId: string;
  ts: number;
  syncedAt?: number;
  fullname: string;
  jobId: string;
  location: string;
  role: string;
  description: string;
  startedAt: string;
  stoppedAt: string;
  breakMinutes: number;
  workedMinutes: number;
  syncStatus: SyncStatus;
  syncMessage: string;
};
