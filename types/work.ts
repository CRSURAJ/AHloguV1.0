export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export type UserRole = "admin" | "user";
export type CredentialType = "password" | "pin";

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
  username: string;
  fullName: string;
  role: UserRole;
  credentialType: CredentialType;
  mustChangeCredential: boolean;
};

export type OfflineUser = {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  credentialType: CredentialType;
  credentialHash: string;
  credentialSalt: string;
  mustChangeCredential: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LocalAuthSession = {
  userId: string;
  signedInAt: string;
};

export type CreateLocalUserInput = {
  username: string;
  fullName: string;
  role: UserRole;
  credentialType: CredentialType;
  secret: string;
};
