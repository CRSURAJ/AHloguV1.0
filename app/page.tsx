"use client";

import WorkLogger from "@/components/WorkLogger/WorkLogger";
import LoginScreen from "@/components/LoginScreen/LoginScreen";
import { useLocalAuth } from "@/hooks/useLocalAuth";

export default function Page() {
  const auth = useLocalAuth();

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
        users={auth.users}
        selectedUserId={auth.selectedUserId}
        setSelectedUserId={auth.setSelectedUserId}
        pin={auth.pin}
        setPin={auth.setPin}
        authMessage={auth.authMessage}
        handleLogin={auth.handleLogin}
      />
    );
  }

  return (
    <WorkLogger
      currentUser={auth.currentUser}
      onSignOut={auth.handleSignOut}
    />
  );
}
