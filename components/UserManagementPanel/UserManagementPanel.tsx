"use client";

import { useMemo, useState } from "react";
import type { CredentialType, OfflineUser, UserRole } from "@/types/work";
import styles from "./UserManagementPanel.module.css";

type UserManagementPanelProps = {
  users: OfflineUser[];
  onClose: () => void;
  onCreateUser: (input: {
    username: string;
    fullName: string;
    role: UserRole;
    credentialType: CredentialType;
    secret: string;
    confirmSecret: string;
  }) => Promise<{ ok: boolean; message: string }>;
  onResetCredential: (
    userId: string,
    nextSecret: string,
    confirmSecret: string
  ) => Promise<{ ok: boolean; message: string }>;
  onToggleActive: (userId: string) => { ok: boolean; message: string };
};

export default function UserManagementPanel({
  users,
  onClose,
  onCreateUser,
  onResetCredential,
  onToggleActive,
}: UserManagementPanelProps) {
  const [message, setMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [credentialType, setCredentialType] = useState<CredentialType>("pin");
  const [secret, setSecret] = useState("");
  const [confirmSecret, setConfirmSecret] = useState("");

  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetSecret, setResetSecret] = useState("");
  const [resetConfirmSecret, setResetConfirmSecret] = useState("");

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        if (a.role !== b.role) return a.role === "admin" ? -1 : 1;
        return a.username.localeCompare(b.username);
      }),
    [users]
  );

  async function handleCreate() {
    const result = await onCreateUser({
      username,
      fullName,
      role,
      credentialType: role === "admin" ? "password" : credentialType,
      secret,
      confirmSecret,
    });

    setMessage(result.message);

    if (result.ok) {
      setFullName("");
      setUsername("");
      setRole("user");
      setCredentialType("pin");
      setSecret("");
      setConfirmSecret("");
    }
  }

  async function handleReset() {
    if (!resetUserId) return;

    const result = await onResetCredential(
      resetUserId,
      resetSecret,
      resetConfirmSecret
    );

    setMessage(result.message);

    if (result.ok) {
      setResetUserId(null);
      setResetSecret("");
      setResetConfirmSecret("");
    }
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>User Management</h3>
            <p className={styles.subtitle}>
              Create users, reset PIN/password, and activate or deactivate accounts.
            </p>
          </div>

          <button type="button" className={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>

        {message ? <div className={styles.message}>{message}</div> : null}

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Add User</div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input
                className={styles.input}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <input
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Role</label>
              <select
                className={styles.select}
                value={role}
                onChange={(e) => {
                  const nextRole = e.target.value as UserRole;
                  setRole(nextRole);
                  if (nextRole === "admin") {
                    setCredentialType("password");
                  }
                }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Credential Type</label>
              <select
                className={styles.select}
                value={role === "admin" ? "password" : credentialType}
                onChange={(e) => setCredentialType(e.target.value as CredentialType)}
                disabled={role === "admin"}
              >
                <option value="pin">PIN</option>
                <option value="password">Password</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                {role === "admin" || credentialType === "password"
                  ? "Password"
                  : "PIN"}
              </label>
              <input
                className={styles.input}
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Confirm</label>
              <input
                className={styles.input}
                type="password"
                value={confirmSecret}
                onChange={(e) => setConfirmSecret(e.target.value)}
              />
            </div>
          </div>

          <button type="button" className={styles.primaryButton} onClick={() => void handleCreate()}>
            Create User
          </button>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Existing Users</div>

          <div className={styles.userList}>
            {sortedUsers.map((user) => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userTop}>
                  <div>
                    <div className={styles.userName}>{user.fullName}</div>
                    <div className={styles.userMeta}>
                      @{user.username} · {user.role} · {user.credentialType}
                    </div>
                  </div>

                  <div className={styles.badges}>
                    <span
                      className={`${styles.badge} ${
                        user.isActive ? styles.badgeActive : styles.badgeInactive
                      }`}
                    >
                      {user.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>

                    {user.mustChangeCredential ? (
                      <span className={`${styles.badge} ${styles.badgeWarn}`}>
                        MUST CHANGE
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      const result = onToggleActive(user.id);
                      setMessage(result.message);
                    }}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      setResetUserId((prev) => (prev === user.id ? null : user.id));
                      setResetSecret("");
                      setResetConfirmSecret("");
                    }}
                  >
                    Reset {user.credentialType === "pin" ? "PIN" : "Password"}
                  </button>
                </div>

                {resetUserId === user.id ? (
                  <div className={styles.resetBox}>
                    <div className={styles.resetTitle}>
                      Reset {user.credentialType === "pin" ? "PIN" : "Password"}
                    </div>

                    <div className={styles.grid}>
                      <div className={styles.field}>
                        <label className={styles.label}>
                          New {user.credentialType === "pin" ? "PIN" : "Password"}
                        </label>
                        <input
                          className={styles.input}
                          type="password"
                          value={resetSecret}
                          onChange={(e) => setResetSecret(e.target.value)}
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label}>Confirm</label>
                        <input
                          className={styles.input}
                          type="password"
                          value={resetConfirmSecret}
                          onChange={(e) => setResetConfirmSecret(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => void handleReset()}
                    >
                      Save Reset
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
