"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clearLocalAuthSession,
  createOfflineUser,
  ensureSeedUsers,
  findUserByUsername,
  hasAnotherActiveAdmin,
  loadLocalAuthSession,
  loadOfflineUsers,
  restoreCurrentUserFromSession,
  sanitizeUsernameInput,
  saveLocalAuthSession,
  saveOfflineUsers,
  toCurrentUser,
  validateSecret,
  verifyCredential,
  buildCredential,
} from "@/lib/localAuth";
import type {
  CreateLocalUserInput,
  CredentialType,
  CurrentUser,
  OfflineUser,
} from "@/types/work";

type ActionResult = {
  ok: boolean;
  message: string;
};

type UseLocalAuthReturn = {
  isReady: boolean;
  currentUser: CurrentUser | null;
  users: OfflineUser[];
  loginUsername: string;
  setLoginUsername: (value: string) => void;
  loginSecret: string;
  setLoginSecret: (value: string) => void;
  authMessage: string;
  handleLogin: () => Promise<void>;
  handleSignOut: () => void;
  canManageUsers: boolean;
  handleChangeOwnCredential: (
    currentSecret: string,
    nextSecret: string,
    confirmSecret: string
  ) => Promise<ActionResult>;
  handleCreateUser: (
    input: CreateLocalUserInput & { confirmSecret: string }
  ) => Promise<ActionResult>;
  handleAdminResetCredential: (
    userId: string,
    nextSecret: string,
    confirmSecret: string
  ) => Promise<ActionResult>;
  handleToggleUserActive: (userId: string) => ActionResult;
  securityLabel: string;
};

export function useLocalAuth(): UseLocalAuthReturn {
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<OfflineUser[]>([]);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginSecret, setLoginSecret] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      await ensureSeedUsers();

      const loadedUsers = loadOfflineUsers();
      const restored = restoreCurrentUserFromSession(
        loadedUsers,
        loadLocalAuthSession()
      );

      if (cancelled) return;

      setUsers(loadedUsers);
      setCurrentUser(restored);
      setIsReady(true);
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, []);

  const canManageUsers = currentUser?.role === "admin";

  const securityLabel = useMemo(() => {
    if (!currentUser) return "Change Credential";
    return currentUser.credentialType === "pin" ? "Change PIN" : "Change Password";
  }, [currentUser]);

  async function handleLogin() {
    const username = sanitizeUsernameInput(loginUsername);
    const secret = loginSecret;

    if (!username || !secret) {
      setAuthMessage("Enter username and PIN/password.");
      return;
    }

    const matchedUser = findUserByUsername(users, username);

    if (!matchedUser) {
      setAuthMessage("Invalid username or credential.");
      return;
    }

    const valid = await verifyCredential(matchedUser, secret);

    if (!valid) {
      setAuthMessage("Invalid username or credential.");
      return;
    }

    saveLocalAuthSession({
      userId: matchedUser.id,
      signedInAt: new Date().toISOString(),
    });

    const nextCurrentUser = toCurrentUser(matchedUser);

    setCurrentUser(nextCurrentUser);
    setLoginUsername("");
    setLoginSecret("");
    setAuthMessage("");
  }

  function handleSignOut() {
    clearLocalAuthSession();
    setCurrentUser(null);
    setLoginUsername("");
    setLoginSecret("");
    setAuthMessage("");
  }

  async function handleChangeOwnCredential(
    currentSecret: string,
    nextSecret: string,
    confirmSecret: string
  ): Promise<ActionResult> {
    if (!currentUser) {
      return { ok: false, message: "No signed-in user." };
    }

    const targetUser = users.find((user) => user.id === currentUser.id);

    if (!targetUser) {
      return { ok: false, message: "Current user was not found." };
    }

    const currentValid = await verifyCredential(targetUser, currentSecret);

    if (!currentValid) {
      return { ok: false, message: "Current credential is incorrect." };
    }

    if (nextSecret !== confirmSecret) {
      return { ok: false, message: "New credential and confirm credential do not match." };
    }

    const validation = validateSecret(targetUser.credentialType, nextSecret);

    if (validation) {
      return { ok: false, message: validation };
    }

    const { credentialHash, credentialSalt } = await buildCredential(nextSecret);

    const updatedUsers = users.map((user) =>
      user.id === targetUser.id
        ? {
            ...user,
            credentialHash,
            credentialSalt,
            mustChangeCredential: false,
            updatedAt: new Date().toISOString(),
          }
        : user
    );

    saveOfflineUsers(updatedUsers);
    setUsers(updatedUsers);

    const refreshedUser = updatedUsers.find((user) => user.id === targetUser.id)!;
    setCurrentUser(toCurrentUser(refreshedUser));

    return {
      ok: true,
      message:
        targetUser.credentialType === "pin"
          ? "PIN changed successfully."
          : "Password changed successfully.",
    };
  }

  async function handleCreateUser(
    input: CreateLocalUserInput & { confirmSecret: string }
  ): Promise<ActionResult> {
    if (!currentUser || currentUser.role !== "admin") {
      return { ok: false, message: "Only admin can create users." };
    }

    const username = sanitizeUsernameInput(input.username);
    const fullName = input.fullName.trim();
    const role = input.role;
    const credentialType = role === "admin" ? "password" : input.credentialType;

    if (!username) {
      return { ok: false, message: "Username is required." };
    }

    if (!/^[a-z0-9._-]{3,32}$/i.test(username)) {
      return {
        ok: false,
        message:
          "Username must be 3 to 32 characters and use letters, numbers, dot, underscore, or dash.",
      };
    }

    if (!fullName) {
      return { ok: false, message: "Full name is required." };
    }

    if (findUserByUsername(users, username)) {
      return { ok: false, message: "That username already exists." };
    }

    if (input.secret !== input.confirmSecret) {
      return { ok: false, message: "Credential and confirm credential do not match." };
    }

    const validation = validateSecret(credentialType, input.secret);

    if (validation) {
      return { ok: false, message: validation };
    }

    const newUser = await createOfflineUser({
      username,
      fullName,
      role,
      credentialType,
      secret: input.secret,
    });

    const updatedUsers = [...users, newUser];
    saveOfflineUsers(updatedUsers);
    setUsers(updatedUsers);

    return { ok: true, message: "User created successfully." };
  }

  async function handleAdminResetCredential(
    userId: string,
    nextSecret: string,
    confirmSecret: string
  ): Promise<ActionResult> {
    if (!currentUser || currentUser.role !== "admin") {
      return { ok: false, message: "Only admin can reset user credentials." };
    }

    const targetUser = users.find((user) => user.id === userId);

    if (!targetUser) {
      return { ok: false, message: "User not found." };
    }

    if (nextSecret !== confirmSecret) {
      return { ok: false, message: "Credential and confirm credential do not match." };
    }

    const validation = validateSecret(targetUser.credentialType, nextSecret);

    if (validation) {
      return { ok: false, message: validation };
    }

    const { credentialHash, credentialSalt } = await buildCredential(nextSecret);

    const updatedUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            credentialHash,
            credentialSalt,
            mustChangeCredential: true,
            updatedAt: new Date().toISOString(),
          }
        : user
    );

    saveOfflineUsers(updatedUsers);
    setUsers(updatedUsers);

    if (currentUser.id === userId) {
      const refreshedUser = updatedUsers.find((user) => user.id === userId)!;
      setCurrentUser(toCurrentUser(refreshedUser));
    }

    return {
      ok: true,
      message: "Credential reset successfully. User must change it at next sign-in.",
    };
  }

  function handleToggleUserActive(userId: string): ActionResult {
    if (!currentUser || currentUser.role !== "admin") {
      return { ok: false, message: "Only admin can change active status." };
    }

    const targetUser = users.find((user) => user.id === userId);

    if (!targetUser) {
      return { ok: false, message: "User not found." };
    }

    if (
      targetUser.role === "admin" &&
      targetUser.isActive &&
      !hasAnotherActiveAdmin(users, targetUser.id)
    ) {
      return { ok: false, message: "You must keep at least one active admin." };
    }

    const updatedUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            isActive: !user.isActive,
            updatedAt: new Date().toISOString(),
          }
        : user
    );

    saveOfflineUsers(updatedUsers);
    setUsers(updatedUsers);

    if (currentUser.id === userId && targetUser.isActive) {
      clearLocalAuthSession();
      setCurrentUser(null);
      return { ok: true, message: "You were signed out because this account was deactivated." };
    }

    return {
      ok: true,
      message: targetUser.isActive ? "User deactivated." : "User activated.",
    };
  }

  return {
    isReady,
    currentUser,
    users,
    loginUsername,
    setLoginUsername,
    loginSecret,
    setLoginSecret,
    authMessage,
    handleLogin,
    handleSignOut,
    canManageUsers,
    handleChangeOwnCredential,
    handleCreateUser,
    handleAdminResetCredential,
    handleToggleUserActive,
    securityLabel,
  };
}
