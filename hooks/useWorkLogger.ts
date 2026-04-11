"use client";

import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";
import { clearLogs, loadLogs, saveLogs } from "@/lib/workStorage";
import { getWorkingStatusText, minutesBetween } from "@/lib/workUtils";
import type { LogItem, SyncStatus } from "@/types/work";

const TB_URL = process.env.NEXT_PUBLIC_PROJECT_LOGU_SYNC_URL ?? "";

export const FULL_NAME_OPTIONS = ["", "Ryan Stephens", "Anita Draper", "Tyron Fourie"];

export type WorkLoggerState = {
  fullname: string;
  setFullname: Dispatch<SetStateAction<string>>;
  jobId: string;
  setJobId: Dispatch<SetStateAction<string>>;
  location: string;
  setLocation: Dispatch<SetStateAction<string>>;
  role: string;
  setRole: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  isWorking: boolean;
  isOnBreak: boolean;
  breakMinutes: number;
  bannerMessage: string;
  logs: LogItem[];
  expandedLogId: number | null;
  canStart: boolean;
  canBreak: boolean;
  canStop: boolean;
  canClearAll: boolean;
  unsyncedCount: number;
  syncedCount: number;
  failedCount: number;
  workingStatusText: string;
  fullNameOptions: string[];
  handleStart: () => void;
  handleBreak: () => void;
  handleStop: () => void;
  handleSync: () => Promise<void>;
  handleClearAll: () => void;
  handleDeleteLog: (id: number) => void;
  toggleExpandedLog: (id: number) => void;
  getSyncBadgeClass: (status: SyncStatus) => string;
};

export function useWorkLogger(): WorkLoggerState {
  const [fullname, setFullname] = useState("");
  const [jobId, setJobId] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<string | null>(null);
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [bannerMessage, setBannerMessage] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setLogs(loadLogs());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveLogs(logs);
  }, [logs, isHydrated]);

  const canStart =
    !isWorking &&
    fullname.trim() !== "" &&
    jobId.trim() !== "" &&
    role.trim() !== "" &&
    location.trim() !== "";

  const canBreak = isWorking;
  const canStop = isWorking && !isOnBreak && description.trim() !== "";

  const unsyncedCount = useMemo(
    () => logs.filter((item) => item.syncStatus !== "synced").length,
    [logs]
  );

  const syncedCount = useMemo(
    () => logs.filter((item) => item.syncStatus === "synced").length,
    [logs]
  );

  const failedCount = useMemo(
    () => logs.filter((item) => item.syncStatus === "failed").length,
    [logs]
  );

  const canClearAll =
    logs.length > 0 && logs.every((item) => item.syncStatus === "synced");

  const workingStatusText = getWorkingStatusText(isWorking, isOnBreak);

  function validateBeforeStart(): string {
    if (fullname.trim() === "") return "Full name is required.";
    if (jobId.trim() === "") return "Job ID is required.";
    if (role.trim() === "") return "Role is required.";
    if (location.trim() === "") return "Location is required.";
    return "";
  }

  function handleStart() {
    const validationError = validateBeforeStart();

    if (validationError) {
      setBannerMessage(validationError);
      return;
    }

    const now = new Date().toISOString();

    setDescription("");
    setIsWorking(true);
    setIsOnBreak(false);
    setStartTime(now);
    setBreakStartTime(null);
    setBreakMinutes(0);
    setBannerMessage("Work started. Add description before finishing.");
  }

  function handleBreak() {
    if (!isWorking) return;

    const now = new Date().toISOString();

    if (!isOnBreak) {
      setIsOnBreak(true);
      setBreakStartTime(now);
      setBannerMessage("Break started. Resume work before finishing the log.");
      return;
    }

    if (breakStartTime) {
      const mins = minutesBetween(breakStartTime, now);
      setBreakMinutes((prev) => prev + mins);
    }

    setIsOnBreak(false);
    setBreakStartTime(null);
    setBannerMessage("Break ended. Add description, then finish the log.");
  }

  function handleStop() {
    if (!isWorking || !startTime) return;

    if (isOnBreak) {
      setBannerMessage("Resume work before finishing the log.");
      return;
    }

    if (description.trim() === "") {
      setBannerMessage("Description is required before finishing.");
      return;
    }

    const stopTime = new Date().toISOString();
    const totalMinutes = minutesBetween(startTime, stopTime);
    const workedMinutes = Math.max(0, totalMinutes - breakMinutes);

    const logItem: LogItem = {
      id: Date.now(),
      loguId: `logu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: new Date(stopTime).getTime(),
      fullname,
      jobId,
      location,
      role,
      description,
      startedAt: startTime,
      stoppedAt: stopTime,
      breakMinutes,
      workedMinutes,
      syncStatus: "pending",
      syncMessage: "Waiting to sync",
    };

    setLogs((prev) => [logItem, ...prev]);
    setIsWorking(false);
    setIsOnBreak(false);
    setStartTime(null);
    setBreakStartTime(null);
    setBreakMinutes(0);
    setDescription("");
    setBannerMessage("Work finished. Log saved as pending.");
  }

async function syncOneItem(item: LogItem): Promise<number> {
  if (!TB_URL) {
    throw new Error("Sync URL is not configured.");
  }

  setLogs((prev) =>
    prev.map((log) =>
      log.id === item.id
        ? { ...log, syncStatus: "syncing", syncMessage: "Syncing..." }
        : log
    )
  );

  const payload = {
    loguId: item.loguId,
    fullname: item.fullname,
    jobId: item.jobId,
    location: item.location,
    role: item.role,
    description: item.description,
    startedAt: item.startedAt,
    stoppedAt: item.stoppedAt,
    breakMinutes: item.breakMinutes,
    workedMinutes: item.workedMinutes,
  };

  const res = await fetch(TB_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Sync failed with status ${res.status}`);
  }

  return Date.now();
}
  async function handleSync() {
    const itemsToSync = logs.filter(
      (item) => item.syncStatus === "pending" || item.syncStatus === "failed"
    );

    if (itemsToSync.length === 0) {
      setBannerMessage("Nothing to sync.");
      return;
    }

    let successCount = 0;
    let failCount = 0;

for (const item of itemsToSync) {
  try {
    const syncedAt = await syncOneItem(item);

    setLogs((prev) =>
      prev.map((log) =>
        log.id === item.id
          ? {
              ...log,
              syncedAt,
              syncStatus: "synced",
              syncMessage: "Synced successfully",
            }
          : log
      )
    );

    successCount += 1;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown sync error";

    setLogs((prev) =>
      prev.map((log) =>
        log.id === item.id
          ? {
              ...log,
              syncStatus: "failed",
              syncMessage: message,
            }
          : log
      )
    );

    failCount += 1;
  }
}
    if (failCount === 0) {
      setBannerMessage(`${successCount} log(s) synced successfully.`);
    } else {
      setBannerMessage(`${successCount} synced, ${failCount} failed. Retry failed logs.`);
    }
  }

  function handleClearAll() {
    if (!canClearAll) {
      setBannerMessage("Clear All is available only when every log is synced.");
      return;
    }

    const confirmed = window.confirm("Clear all saved logs?");
    if (!confirmed) return;

    setLogs([]);
    setExpandedLogId(null);
    clearLogs();
    setBannerMessage("All saved logs cleared.");
  }

  function toggleExpandedLog(id: number) {
    setExpandedLogId((prev) => (prev === id ? null : id));
  }
  
  function handleDeleteLog(id: number) {
  setLogs((prev) => prev.filter((log) => log.id !== id));
  }

  function getSyncBadgeClass(status: SyncStatus) {
    switch (status) {
      case "pending":
        return "badgePending";
      case "syncing":
        return "badgeSyncing";
      case "synced":
        return "badgeSynced";
      case "failed":
      default:
        return "badgeFailed";
    }
  }

  return {
    fullname,
    setFullname,
    jobId,
    setJobId,
    location,
    setLocation,
    role,
    setRole,
    description,
    setDescription,
    isWorking,
    isOnBreak,
    breakMinutes,
    bannerMessage,
    logs,
    expandedLogId,
    canStart,
    canBreak,
    canStop,
    canClearAll,
    unsyncedCount,
    syncedCount,
    failedCount,
    workingStatusText,
    fullNameOptions: FULL_NAME_OPTIONS,
    handleStart,
    handleBreak,
    handleStop,
    handleSync,
    handleClearAll,
    handleDeleteLog,
    toggleExpandedLog,
    getSyncBadgeClass,
  };
}
