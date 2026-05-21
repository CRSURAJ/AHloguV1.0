type FeedbackTone = "auto" | "success" | "error" | "neutral";

type FeedbackMessageProps = {
  message?: string;
  tone?: FeedbackTone;
  compact?: boolean;
};

function getAutoTone(message: string): Exclude<FeedbackTone, "auto"> {
  const value = message.toLowerCase();

  const errorWords = [
    "failed",
    "error",
    "incorrect",
    "invalid",
    "cannot",
    "could not",
    "missing",
    "required",
    "must",
    "do not match",
    "does not match",
    "too many",
    "try again",
    "not allowed",
    "not found",
    "expired",
    "enter a valid",
    "valid email",
    "already exists",
    "duplicate",
    "use a unique",
    "unique job id",
  ];

  if (errorWords.some((word) => value.includes(word))) {
    return "error";
  }

  const successWords = [
    "success",
    "saved",
    "created",
    "updated",
    "deleted",
    "reset",
    "activated",
    "deactivated",
    "changed",
    "uploaded",
    "synced",
    "complete",
  ];

  if (successWords.some((word) => value.includes(word))) {
    return "success";
  }

  return "neutral";
}

export default function FeedbackMessage({
  message,
  tone = "auto",
  compact = false,
}: FeedbackMessageProps) {
  if (!message) {
    return null;
  }

  const resolvedTone = tone === "auto" ? getAutoTone(message) : tone;

  const stylesByTone = {
    success: {
      background: "rgba(83, 188, 123, 0.13)",
      border: "1px solid rgba(83, 188, 123, 0.38)",
      color: "#d8f7e4",
    },
    error: {
      background: "rgba(255, 92, 92, 0.13)",
      border: "1px solid rgba(255, 92, 92, 0.42)",
      color: "#ffd6d6",
    },
    neutral: {
      background: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.14)",
      color: "#eef7f3",
    },
  }[resolvedTone];

  return (
    <div
      style={{
        marginBottom: compact ? "12px" : "16px",
        padding: compact ? "10px 12px" : "12px 14px",
        borderRadius: "16px",
        lineHeight: 1.45,
        fontSize: compact ? "13px" : "14px",
        ...stylesByTone,
      }}
    >
      {message}
    </div>
  );
}
