import { ActionButtons, LogsList, WorkerForm } from "@/components";
import Image from "next/image";
import type { WorkLoggerState } from "@/hooks/useWorkLogger";
import styles from "./WorkLoggerView.module.css";

export default function WorkLoggerView(props: WorkLoggerState) {
  const pillClass = props.isOnBreak
    ? styles.statusBreak
    : props.isWorking
      ? styles.statusWorking
      : styles.statusReady;

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.outerFrame}>
          <div className={styles.topHeader}>
            <div className={styles.brandWrap}>
              <Image
                src="/AHlogu.png"
                alt="AH LOGU"
                width={180}
                height={54}
                className={styles.logoImage}
                priority
              />
            </div>
          </div>

          <div className={styles.entryCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerText}>
                <h2 className={styles.cardTitle}>
                  Hi, {props.currentUserFullName}!
                </h2>

                <div className={styles.headerMetaRow}>
                  <button
                    type="button"
                    className={styles.signOutButton}
                    onClick={props.handleSignOut}
                  >
                    Sign out
                  </button>
                </div>
              </div>

              <div className={`${styles.statusPill} ${pillClass}`}>
                {props.workingStatusText}
              </div>
            </div>

            {props.bannerMessage ? (
              <div className={styles.banner}>{props.bannerMessage}</div>
            ) : null}

            <WorkerForm
              jobId={props.jobId}
              setJobId={props.setJobId}
              role={props.role}
              setRole={props.setRole}
              location={props.location}
              setLocation={props.setLocation}
              jobDocs={props.jobDocs}
              setJobDocs={props.setJobDocs}
              description={props.description}
              setDescription={props.setDescription}
              isWorking={props.isWorking}
              isOnBreak={props.isOnBreak}
            />

            <ActionButtons
              isOnBreak={props.isOnBreak}
              canStart={props.canStart}
              canBreak={props.canBreak}
              canStop={props.canStop}
              canClearAll={props.canClearAll}
              unsyncedCount={props.unsyncedCount}
              failedCount={props.failedCount}
              handleStart={props.handleStart}
              handleBreak={props.handleBreak}
              handleStop={props.handleStop}
              handleSync={props.handleSync}
              handleClearAll={props.handleClearAll}
            />
          </div>

          <LogsList
            logs={props.logs}
            expandedLogId={props.expandedLogId}
            toggleExpandedLog={props.toggleExpandedLog}
            getSyncBadgeClass={props.getSyncBadgeClass}
            onDelete={props.handleDeleteLog}
          />
        </div>
      </div>
    </div>
  );
}
