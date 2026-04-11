"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/workUtils";
import type { LogItem } from "@/types/work";
import styles from "./LogsList.module.css";

type LogsListProps = {
  logs: LogItem[];
  expandedLogId: number | null;
  toggleExpandedLog: (id: number) => void;
  getSyncBadgeClass: (
    status: "pending" | "syncing" | "synced" | "failed"
  ) => string;
  onDelete: (id: number) => void;
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
    <section className={styles.logsCard}>
      <button
        type="button"
        className={styles.logsToggle}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className={styles.logsTitleWrap}>
          <div className={styles.logsTitle}>Recent Logs</div>
          <div className={styles.logsSubtitle}>
            {logs.length} saved log{logs.length === 1 ? "" : "s"}
          </div>
        </div>

        <div
          className={`${styles.chevron} ${
            isOpen ? styles.chevronOpen : ""
          }`}
        >
          ▾
        </div>
      </button>

      {isOpen && (
        <div className={styles.logsBody}>
          {logs.length === 0 ? (
            <div className={styles.emptyState}>No logs yet.</div>
          ) : (
            <div className={styles.logsList}>
              {logs.map((item) => {
                const isExpanded = expandedLogId === item.id;
                const canExpand = (item.description ?? "").length > 90;

                return (
                  <article key={item.id} className={styles.logItem}>
                    <div className={styles.logTop}>
  <div className={styles.logIdentity}>
    <div className={styles.logTitle}>
      {item.fullname} · {item.jobId}
    </div>
    <div className={styles.logMeta}>
      {item.role} · {item.location}
    </div>
  </div>

  <div className={styles.logActions}>
    <span
      className={`${styles.badge} ${
        styles[getSyncBadgeClass(item.syncStatus)]
      }`}
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
      >
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
    </button>
  </div>
</div>

                    <div className={styles.metaChips}>
                      <span className={styles.metaChip}>
                        Worked {item.workedMinutes} min
                      </span>
                      <span className={styles.metaChip}>
                        Break {item.breakMinutes} min
                      </span>
                    </div>

                    <div
                      className={`${styles.logDescription} ${
                        isExpanded ? styles.logDescriptionExpanded : ""
                      }`}
                    >
                      {item.description || "No description"}
                    </div>

                    {canExpand && (
                      <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => toggleExpandedLog(item.id)}
                      >
                        {isExpanded ? "Show less" : "Show more"}
                      </button>
                    )}

                    <div className={styles.logFooter}>
                      <span className={styles.logMessage}>
                        {item.syncMessage || "Waiting to sync"}
                      </span>
                      <span className={styles.logMeta}>
                        {item.syncStatus === "synced"
  ? formatDateTime(new Date(item.ts).toISOString())
  : formatDateTime(item.stoppedAt)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
