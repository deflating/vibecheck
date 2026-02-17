"use client";

import { getLifecycleState, type ViewerRole } from "@/lib/lifecycle";

const STEPS = ["Posted", "Quoted", "Paid", "In Review", "Completed"] as const;

export function ProgressStepper({
  status,
  hasQuotes,
  hasPaidQuote,
  hasCompletedReview,
  role,
  compact = false,
}: {
  status: string;
  hasQuotes: boolean;
  hasPaidQuote: boolean;
  hasCompletedReview: boolean;
  role: ViewerRole;
  compact?: boolean;
}) {
  const lifecycle = getLifecycleState({ status, hasQuotes, hasPaidQuote, hasCompletedReview, role });

  const toneStyles =
    lifecycle.statusTone === "complete"
      ? "bg-success/10 border-success/35"
      : lifecycle.statusTone === "attention"
      ? "bg-attention/10 border-attention/35"
      : lifecycle.statusTone === "active"
      ? "bg-accent/10 border-accent/30"
      : "bg-warning/10 border-warning/35";

  const activeDotColor =
    lifecycle.statusTone === "complete" ? "bg-success text-white" : lifecycle.statusTone === "attention" ? "bg-attention text-white" : "bg-accent-pop text-white";

  if (status === "cancelled") {
    return (
      <div className={`border rounded-xl ${toneStyles} ${compact ? "p-3 mb-0" : "p-4 mb-8"}`}>
        <p className={`${compact ? "text-xs" : "text-sm"} text-attention`}>{lifecycle.nextAction}</p>
      </div>
    );
  }

  return (
    <div className={`border-2 border-dashed rounded-xl ${toneStyles} ${compact ? "p-3 mb-0" : "p-5 mb-8"}`}>
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  compact ? "w-6 h-6" : "w-8 h-8"
                } ${
                  i < lifecycle.current ? "bg-success text-white ring-2 ring-success/25" : i === lifecycle.current ? `${activeDotColor} ring-2 ring-accent/20` : "bg-surface border border-border text-text-muted"
                }`}
              >
                {i < lifecycle.current ? "✓" : i + 1}
              </div>
              <span className={`${compact ? "text-[10px]" : "text-xs"} mt-1.5 uppercase tracking-wide ${i <= lifecycle.current ? "text-text font-semibold" : "text-text-muted"}`}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 border-t border-dashed mx-2 mt-[-1rem] ${i < lifecycle.current ? "border-success" : "border-border"}`} />
            )}
          </div>
        ))}
      </div>
      <div className={`${compact ? "mt-2" : "mt-3"} flex items-center justify-between gap-3`}>
        <p className={`${compact ? "text-xs" : "text-sm"} text-text-secondary`}>
          <span className="font-medium text-text">Next:</span>{" "}
          {lifecycle.nextActor === "none" ? "No pending handoff." : `${lifecycle.nextActor === "builder" ? "Builder" : "Reviewer"} action required.`}
        </p>
        <p className={`${compact ? "text-xs" : "text-sm"} text-text-muted text-right`}>{lifecycle.nextAction}</p>
      </div>
    </div>
  );
}
