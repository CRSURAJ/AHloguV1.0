"use client";

import { useWorkLogger } from "@/hooks/useWorkLogger";
import { WorkLoggerView } from "@/components";
import type { CurrentUser } from "@/types/work";

type WorkLoggerProps = {
  currentUser: CurrentUser;
  onSignOut: () => void;
};

export default function WorkLogger({
  currentUser,
  onSignOut,
}: WorkLoggerProps) {
  const workLogger = useWorkLogger(currentUser);

  return <WorkLoggerView {...workLogger} onSignOut={onSignOut} />;
}
