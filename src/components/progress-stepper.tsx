"use client";

const STEPS = ["Posted", "Quoted", "Paid", "In Review", "Completed"];

function stepIndex(status: string, hasQuotes: boolean, hasPaidQuote: boolean, hasReview: boolean): number {
  if (status === "completed" || hasReview) return 4;
  if (status === "in_progress") return 3;
  if (hasPaidQuote) return 2;
  if (hasQuotes) return 1;
  return 0;
}

export function ProgressStepper({
  status,
  hasQuotes,
  hasPaidQuote,
  hasReview,
}: {
  status: string;
  hasQuotes: boolean;
  hasPaidQuote: boolean;
  hasReview: boolean;
}) {
  const current = stepIndex(status, hasQuotes, hasPaidQuote, hasReview);

  if (status === "cancelled") {
    return (
      <div className="bg-surface border border-border rounded-xl p-4 mb-8">
        <div className="text-center text-sm text-text-muted">This request was cancelled</div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5 mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < current
                    ? "bg-success text-white"
                    : i === current
                    ? "bg-accent text-white"
                    : "bg-border text-text-muted"
                }`}
              >
                {i < current ? "✓" : i + 1}
              </div>
              <span className={`text-xs mt-1.5 ${i <= current ? "text-text font-medium" : "text-text-muted"}`}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mt-[-1rem] ${i < current ? "bg-success" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
