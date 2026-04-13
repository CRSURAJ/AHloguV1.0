"use client";

import { useEffect, useState } from "react";
import {
  clearLocalAuthSession,
  ensureSeedUsers,
  loadLocalAuthSession,
  loadOfflineUsers,
  restoreCurrentUserFromSession,
  saveLocalAuthSession,
  toCurrentUser,
  verifyUserPin,
} from "@/lib/localAuth";
import type { CurrentUser, OfflineUser } from "@/types/work";

type UseLocalAuthReturn = {
  isReady: boolean;
  currentUser: CurrentUser | null;
  users: OfflineUser[];
  selectedUserId: string;
  setSelectedUserId: (value: string) => void;
  pin: string;
  setPin: (value: string) => void;
  authMessage: string;
  handleLogin: () => Promise<void>;
  handleSignOut: () => void;
};

export function useLocalAuth(): UseLocalAuthReturn {
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<OfflineUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [pin, setPin] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      await ensureSeedUsers();

      const loadedUsers = loadOfflineUsers().filter((user) => user.isActive);
      const session = loadLocalAuthSession();
      const restoredUser = restoreCurrentUserFromSession(loadedUsers, session);

      if (cancelled) return;

      setUsers(loadedUsers);
      setSelectedUserId(loadedUsers[0]?.id ?? "");
      setCurrentUser(restoredUser);
      setIsReady(true);
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin() {
    if (!selectedUserId) {
      setAuthMessage("Please select a user.");
      return;
    }

    if (pin.trim() === "") {
      setAuthMessage("Please enter your PIN.");
      return;
    }

    const selectedUser = users.find((user) => user.id === selectedUserId);

    if (!selectedUser) {
      setAuthMessage("Selected user was not found.");
      return;
    }

    const valid = await verifyUserPin(selectedUser, pin);

    if (!valid) {
      setAuthMessage("Incorrect PIN.");
      return;
    }

    saveLocalAuthSession({
      userId: selectedUser.id,
      signedInAt: new Date().toISOString(),
    });

    setCurrentUser(toCurrentUser(selectedUser));
    setPin("");
    setAuthMessage("");
  }

  function handleSignOut() {
    clearLocalAuthSession();
    setCurrentUser(null);
    setPin("");
    setAuthMessage("");
  }

  return {
    isReady,
    currentUser,
    users,
    selectedUserId,
    setSelectedUserId,
    pin,
    setPin,
    authMessage,
    handleLogin,
    handleSignOut,
  };
}
