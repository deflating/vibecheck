export type ViewerRole = "builder" | "reviewer";

export type LifecycleState = {
  current: number;
  statusTone: "waiting" | "active" | "complete" | "attention";
  nextActor: "builder" | "reviewer" | "none";
  nextAction: string;
};

export function lifecycleIndex(status: string, hasQuotes: boolean, hasPaidQuote: boolean, hasCompletedReview: boolean): number {
  if (status === "completed" || hasCompletedReview) return 4;
  if (status === "in_progress") return 3;
  if (hasPaidQuote) return 2;
  if (hasQuotes) return 1;
  return 0;
}

export function getLifecycleState({
  status,
  hasQuotes,
  hasPaidQuote,
  hasCompletedReview,
  role,
}: {
  status: string;
  hasQuotes: boolean;
  hasPaidQuote: boolean;
  hasCompletedReview: boolean;
  role: ViewerRole;
}): LifecycleState {
  if (status === "cancelled") {
    return {
      current: 0,
      statusTone: "attention",
      nextActor: "none",
      nextAction: "This request is cancelled. Repost when you are ready to continue.",
    };
  }

  const current = lifecycleIndex(status, hasQuotes, hasPaidQuote, hasCompletedReview);

  if (current === 0) {
    return {
      current,
      statusTone: "waiting",
      nextActor: "reviewer",
      nextAction: role === "builder" ? "Waiting for a reviewer to submit a quote." : "Request is open. Submit a quote if you want this review.",
    };
  }
  if (current === 1) {
    return {
      current,
      statusTone: "waiting",
      nextActor: "builder",
      nextAction: role === "builder" ? "Choose a quote and approve payment to begin review." : "Builder is choosing a quote and payment timing.",
    };
  }
  if (current === 2) {
    return {
      current,
      statusTone: "active",
      nextActor: "reviewer",
      nextAction: role === "builder" ? "Payment confirmed. Reviewer can now begin the report." : "Payment is confirmed. Start the review report.",
    };
  }
  if (current === 3) {
    return {
      current,
      statusTone: "active",
      nextActor: "reviewer",
      nextAction: role === "builder" ? "Review is in progress. You can message the reviewer for updates." : "Complete and submit the final review report.",
    };
  }
  return {
    current,
    statusTone: "complete",
    nextActor: "none",
    nextAction: role === "builder" ? "Review is delivered. Leave a rating when you are ready." : "Review delivered successfully.",
  };
}
