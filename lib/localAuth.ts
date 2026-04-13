import type {
  CurrentUser,
  LocalAuthSession,
  OfflineUser,
} from "@/types/work";

const USERS_KEY = "project_logu:local_auth:users";
const SESSION_KEY = "project_logu:local_auth:session";

const DEFAULT_LOCAL_USERS_SEED = [
  {
    id: "suraj-dhungana",
    fullName: "Suraj Dhungana",
    role: "Technician",
    pin: "1234",
  },
  {
    id: "demo-worker",
    fullName: "Demo Worker",
    role: "Apprentice",
    pin: "1111",
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function ensureSeedUsers(): Promise<void> {
  if (!isBrowser()) return;

  const existing = loadOfflineUsers();
  if (existing.length > 0) return;

  const seededUsers: OfflineUser[] = await Promise.all(
    DEFAULT_LOCAL_USERS_SEED.map(async (user) => ({
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      pinHash: await sha256(user.pin),
      isActive: true,
    }))
  );

  saveOfflineUsers(seededUsers);
}

export function loadOfflineUsers(): OfflineUser[] {
  if (!isBrowser()) return [];

  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as OfflineUser[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        typeof item?.id === "string" &&
        typeof item?.fullName === "string" &&
        typeof item?.role === "string" &&
        typeof item?.pinHash === "string"
    );
  } catch {
    return [];
  }
}

export function saveOfflineUsers(users: OfflineUser[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loadLocalAuthSession(): LocalAuthSession | null {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as LocalAuthSession;
    if (
      typeof parsed?.userId === "string" &&
      typeof parsed?.signedInAt === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveLocalAuthSession(session: LocalAuthSession): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearLocalAuthSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(SESSION_KEY);
}

export function toCurrentUser(user: OfflineUser): CurrentUser {
  return {
    id: user.id,
    fullName: user.fullName,
    role: user.role,
  };
}

export function restoreCurrentUserFromSession(
  users: OfflineUser[],
  session: LocalAuthSession | null
): CurrentUser | null {
  if (!session) return null;

  const matched = users.find(
    (user) => user.id === session.userId && user.isActive
  );

  return matched ? toCurrentUser(matched) : null;
}

export async function verifyUserPin(
  user: OfflineUser,
  pin: string
): Promise<boolean> {
  const pinHash = await sha256(pin);
  return pinHash === user.pinHash;
}
