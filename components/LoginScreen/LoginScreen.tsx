"use client";

import Image from "next/image";
import type { OfflineUser } from "@/types/work";
import styles from "./LoginScreen.module.css";

type LoginScreenProps = {
  users: OfflineUser[];
  selectedUserId: string;
  setSelectedUserId: (value: string) => void;
  pin: string;
  setPin: (value: string) => void;
  authMessage: string;
  handleLogin: () => Promise<void>;
};

export default function LoginScreen({
  users,
  selectedUserId,
  setSelectedUserId,
  pin,
  setPin,
  authMessage,
  handleLogin,
}: LoginScreenProps) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Image
            src="/AHlogu.png"
            alt="AH LOGU"
            width={180}
            height={54}
            className={styles.logo}
            priority
          />
          <p className={styles.subtitle}>
            Offline local login. No internet required.
          </p>
        </div>

        {authMessage ? <div className={styles.message}>{authMessage}</div> : null}

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void handleLogin();
          }}
        >
          <div className={styles.field}>
            <label htmlFor="worker" className={styles.label}>
              Worker
            </label>

            <select
              id="worker"
              className={styles.select}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} · {user.role}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="pin" className={styles.label}>
              PIN
            </label>

            <input
              id="pin"
              className={styles.input}
              type="password"
              inputMode="numeric"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.button}>
            Sign in
          </button>
        </form>

        <p className={styles.note}>
          Change the default users and PINs in <code>lib/localAuth.ts</code>
          before real use.
        </p>
      </div>
    </main>
  );
}
