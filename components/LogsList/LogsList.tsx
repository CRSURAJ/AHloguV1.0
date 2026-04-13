"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/workUtils";
import type { LogItem } from "@/types/work";
import styles from "./LogsList.module.css";

type LogsListProps = {
  logs: LogItem[];
  expandedLogId: string | null;
  toggleExpandedLog: (id: string) => void;
  getSyncBadgeClass: (
    status: "pending" | "syncing" | "synced" | "failed"
  ) => string;
  onDelete: (id: string) => void;
};

export default function LogsList({
  logs,
  expandedLogId,
  toggleExpandedLog,
  getSyncBadgeClass,
  onDelete,
}: LogsListProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.logsWrap}>
      <button
        type="button"
        className={styles.logsToggle}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div>
          <div className={styles.logsTitle}>Recent Logs</div>
          <div className={styles.logsCount}>
            {logs.length} saved log{logs.length === 1 ? "" : "s"}
          </div>
        </div>
        <span className={styles.logsChevron}>{isOpen ? "▴" : "▾"}</span>
      </button>

      {isOpen && (
        <div className={styles.logsPanel}>
          {logs.length === 0 ? (
            <div className={styles.emptyState}>No logs yet.</div>
          ) : (
            <div className={styles.logsList}>
              {logs.map((item) => {
                const isExpanded = expandedLogId === item.id;
                const canExpand = (item.description ?? "").length > 90;

                const displayDescription =
                  canExpand && !isExpanded
                    ? `${item.description.slice(0, 90)}…`
                    : item.description || "No description";

                const displayTimestamp =
                  item.syncStatus === "synced" && item.syncedAt
                    ? `Synced ${formatDateTime(
                        new Date(item.syncedAt).toISOString()
                      )}`
                    : `Finished ${formatDateTime(item.stoppedAt)}`;

                return (
                  <div key={item.id} className={styles.logCard}>
                    <div className={styles.logHeader}>
                      <div>
                        <div className={styles.logTitle}>
                          {item.fullname || "Unknown worker"} · {item.jobId}
                        </div>
                        <div className={styles.logMeta}>
                          {item.role} · {item.location}
                        </div>
                      </div>

                      <div className={styles.logHeaderRight}>
                        <span
                          className={`${styles.syncBadge} ${styles[getSyncBadgeClass(item.syncStatus)]}`}
                        >
                          {item.syncStatus.toUpperCase()}
                        </span>

                        <button
                          type="button"
                          className={styles.deleteButton}
                          onClick={() => {
                            const ok = window.confirm("Delete this log?");
                            if (ok) onDelete(item.id);
                          }}
                          aria-label={`Delete log for ${item.fullname}`}
                          title="Delete log"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <div className={styles.logStats}>
                      <span>Worked {item.workedMinutes} min</span>
                      <span>Break {item.breakMinutes} min</span>
                    </div>

                    <div className={styles.logDescription}>
                      {displayDescription}
                    </div>

                    {canExpand && (
                      <button
                        type="button"
                        className={styles.expandButton}
                        onClick={() => toggleExpandedLog(item.id)}
                      >
                        {isExpanded ? "Show less" : "Show more"}
                      </button>
                    )}

                    <div className={styles.logFooter}>
                      <span>{item.syncMessage || "Waiting to sync"}</span>
                      <span>{displayTimestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
