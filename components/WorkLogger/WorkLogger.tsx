"use client";

import { useWorkLogger } from "@/hooks/useWorkLogger";
import WorkLoggerView from "@/components/WorkLoggerView/WorkLoggerView";
import type { CurrentUser } from "@/types/work";

type WorkLoggerProps = {
  currentUser: CurrentUser;
  onSignOut: () => void;
  onOpenSecurity: () => void;
  onOpenUserManagement: () => void;
  canManageUsers: boolean;
  securityLabel: string;
};

export default function WorkLogger({
  currentUser,
  onSignOut,
  onOpenSecurity,
  onOpenUserManagement,
  canManageUsers,
  securityLabel,
}: WorkLoggerProps) {
  const workLogger = useWorkLogger(currentUser);

  return (
    <WorkLoggerView
      {...workLogger}
      onSignOut={onSignOut}
      onOpenSecurity={onOpenSecurity}
      onOpenUserManagement={onOpenUserManagement}
      canManageUsers={canManageUsers}
      securityLabel={securityLabel}
    />
  );
}
