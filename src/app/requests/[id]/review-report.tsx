"use client";

import { useState } from "react";


function renderMarkdown(text: string): string {
  if (!text) return "";
  // Strip HTML tags for safety
  let s = text.replace(/<[^>]*>/g, "");
  // Code blocks
  s = s.replace(/```([\s\S]*?)```/g, '<pre class="bg-surface border border-border rounded-lg p-3 my-2 overflow-x-auto font-mono text-sm"><code>$1</code></pre>');
  // Inline code
  s = s.replace(/`([^`]+)`/g, '<code class="bg-surface border border-border rounded px-1.5 py-0.5 text-sm font-mono">$1</code>');
  // Bold
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Bullet lists
  s = s.replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  s = s.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-2 space-y-1">$&</ul>');
  // Line breaks
  s = s.replace(/\n/g, "<br/>");
  return s;
}

function scoreColor(score: number): string {
  if (score <= 3) return "bg-danger";
  if (score <= 5) return "bg-warning";
  if (score <= 7) return "bg-accent";
  return "bg-success";
}

interface ReviewReportProps {
  review: {
    summary?: string;
    security_score: number;
    security_notes?: string;
    architecture_score: number;
    architecture_notes?: string;
    performance_score: number;
    performance_notes?: string;
    maintainability_score: number;
    maintainability_notes?: string;
    overall_score: number;
    recommendations?: string;
  };
  reviewer?: {
    name: string;
    avatar_url?: string;
    github_username: string;
    verified?: number;
  };
}

export function ReviewReport({ review, reviewer }: ReviewReportProps) {
  const categories = [
    { label: "Security", score: review.security_score, notes: review.security_notes },
    { label: "Architecture", score: review.architecture_score, notes: review.architecture_notes },
    { label: "Performance", score: review.performance_score, notes: review.performance_notes },
    { label: "Maintainability", score: review.maintainability_score, notes: review.maintainability_notes },
  ];

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="mb-8 print-report">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Review Report</h2>
        <button
          onClick={() => window.print()}
          className="print-hide text-sm px-3 py-1.5 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
        >
          Print Report
        </button>
      </div>
      <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
        {reviewer && (
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            {reviewer.avatar_url && (
              <img src={reviewer.avatar_url} alt={reviewer.name} className="w-10 h-10 rounded-full" />
            )}
            <div>
              <div className="font-medium flex items-center gap-1">{reviewer.name}</div>
              <div className="text-sm text-text-muted">@{reviewer.github_username}</div>
            </div>
          </div>
        )}

        {review.summary && <p className="text-text-secondary leading-relaxed">{review.summary}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((item) => (
            <div key={item.label} className="bg-bg border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggle(item.label)}
                className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div>
                    <div className="text-xs text-text-muted mb-1">{item.label}</div>
                    <div className="text-2xl font-bold">
                      {item.score}<span className="text-sm text-text-muted font-normal">/10</span>
                    </div>
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${scoreColor(item.score)} transition-all`}
                        style={{ width: `${item.score * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-text-muted transition-transform ${expanded[item.label] ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expanded[item.label] && item.notes && (
                <div
                  className="px-4 pb-4 text-sm text-text-secondary leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(item.notes) }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="text-xs text-text-muted mb-1">Overall</div>
          <div className="text-4xl font-bold text-accent">
            {review.overall_score}<span className="text-lg text-text-muted font-normal">/10</span>
          </div>
        </div>

        {review.recommendations && (
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold mb-2">Recommendations</h3>
            <div
              className="text-sm text-text-secondary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(review.recommendations) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
