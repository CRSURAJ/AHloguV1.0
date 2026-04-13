"use client";

import { useEffect, useState } from "react";
import LoginScreen from "@/components/LoginScreen/LoginScreen";
import SecurityPanel from "@/components/SecurityPanel/SecurityPanel";
import UserManagementPanel from "@/components/UserManagementPanel/UserManagementPanel";
import WorkLogger from "@/components/WorkLogger/WorkLogger";
import { useLocalAuth } from "@/hooks/useLocalAuth";

export default function Page() {
  const auth = useLocalAuth();
  const [securityOpen, setSecurityOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(false);

  useEffect(() => {
    if (auth.currentUser?.mustChangeCredential) {
      setSecurityOpen(true);
    }
  }, [auth.currentUser?.mustChangeCredential]);

  if (!auth.isReady) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#085153",
          color: "#eef7f3",
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        Loading...
      </main>
    );
  }

  if (!auth.currentUser) {
    return (
      <LoginScreen
        loginUsername={auth.loginUsername}
        setLoginUsername={auth.setLoginUsername}
        loginSecret={auth.loginSecret}
        setLoginSecret={auth.setLoginSecret}
        authMessage={auth.authMessage}
        handleLogin={auth.handleLogin}
      />
    );
  }

  return (
    <>
      <WorkLogger
        currentUser={auth.currentUser}
        onSignOut={auth.handleSignOut}
        onOpenSecurity={() => setSecurityOpen(true)}
        onOpenUserManagement={() => setUserManagementOpen(true)}
        canManageUsers={auth.canManageUsers}
        securityLabel={auth.securityLabel}
      />

      {securityOpen ? (
        <SecurityPanel
          credentialType={auth.currentUser.credentialType}
          forced={auth.currentUser.mustChangeCredential}
          onClose={() => setSecurityOpen(false)}
          onSubmit={auth.handleChangeOwnCredential}
        />
      ) : null}

      {userManagementOpen && auth.canManageUsers ? (
        <UserManagementPanel
          users={auth.users}
          onClose={() => setUserManagementOpen(false)}
          onCreateUser={auth.handleCreateUser}
          onResetCredential={auth.handleAdminResetCredential}
          onToggleActive={auth.handleToggleUserActive}
        />
      ) : null}
    </>
  );
}
