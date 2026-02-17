import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";
import { safeParseJson } from "@/lib/utils";
import { Nav } from "@/components/nav";
import { QuoteList } from "./quote-list";
import { Chat } from "@/components/chat";
import { RatingWidget } from "./rating-widget";
import { ReviewReport } from "./review-report";
import { Breadcrumb } from "@/components/breadcrumb";
import { ProgressStepper } from "@/components/progress-stepper";
import { RequestActions } from "@/components/request-actions";
import type { ReviewWithReviewer, Attachment } from "@/lib/models";

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const db = getDb();
  const request = db.prepare(`
    SELECT r.*, u.name as user_name
    FROM review_requests r
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ?
      AND (
        r.user_id = ?
        OR EXISTS (
          SELECT 1
          FROM quotes q
          WHERE q.request_id = r.id
            AND q.reviewer_id = ?
            AND q.status = 'accepted'
        )
      )
  `).get(Number(id), user.id, user.id) as { id: number; user_id: number; title: string; repo_url: string; description: string; stack: string; concerns: string; status: string; budget_min: number | null; budget_max: number | null; category: string; user_name: string; concerns_freetext: string } | undefined;

  if (!request) notFound();

  const stack = safeParseJson(request.stack, []);
  const concerns = safeParseJson(request.concerns, []);

  // Check for completed review
  const review = db.prepare(`
    SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar, u.github_username as reviewer_username
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.id
    WHERE r.request_id = ?
  `).get(Number(id)) as (ReviewWithReviewer & { reviewer_username: string }) | undefined;

  // Quotes for stepper logic
  const quotes = db.prepare(`SELECT q.*, u.name as reviewer_name FROM quotes q JOIN users u ON q.reviewer_id = u.id WHERE q.request_id = ? ORDER BY q.created_at`).all(Number(id)) as { id: number; status: string; paid: number; price: number; turnaround_hours: number; note: string | null; reviewer_name: string; created_at: string }[];
  const hasQuotes = quotes.length > 0;
  const hasAcceptedQuote = quotes.some((q) => q.status === "accepted");
  const hasPaidQuote = quotes.some((q) => q.paid === 1);
  const hasCompletedReview = Boolean(review?.overall_score);
  const acceptedQuote = quotes.find((q) => q.status === "accepted");

  // Attachments (request-level: review_id is null)
  const attachments = db.prepare(`SELECT * FROM attachments WHERE request_id = ? AND review_id IS NULL`).all(Number(id)) as Attachment[];

  const statusColors: Record<string, string> = {
    open: "bg-accent/10 text-accent",
    in_progress: "bg-warning/10 text-warning",
    completed: "bg-success/10 text-success",
    cancelled: "bg-attention/10 text-attention",
  };

  const isOwner = request.user_id === user.id;
  const roleBanner = isOwner
    ? {
        tone: "bg-accent/10 border-accent/20 text-accent",
        title: "You are the builder for this request.",
        body: hasAcceptedQuote
          ? hasPaidQuote
            ? "Your reviewer is now working. Use the thread below to share context or answer questions."
            : "You have accepted a quote. Complete payment to start the review."
          : "Reviewers can now submit proposals. Compare quotes when they arrive.",
      }
    : {
        tone: "bg-warning/10 border-warning/25 text-warning",
        title: `You are the assigned reviewer${acceptedQuote?.reviewer_name ? ` (${acceptedQuote.reviewer_name})` : ""}.`,
        body: hasPaidQuote
          ? "Payment is confirmed. Deliver a clear report and communicate updates in chat."
          : "Builder has selected a reviewer. Review starts after payment confirmation.",
      };

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <Breadcrumb items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Requests", href: "/dashboard" },
          { label: request.title },
        ]} />

        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{request.title}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[request.status]}`}>
              {request.status.replace("_", " ")}
            </span>
            {request.category && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-surface border border-border text-text-secondary">
                {request.category}
              </span>
            )}
          </div>
          <p className="text-text-secondary leading-relaxed">{request.description}</p>

          <div className="flex flex-wrap gap-4 mt-4">
            <a href={request.repo_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:text-accent-hover font-mono">
              {request.repo_url}
            </a>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            {stack.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Stack:</span>
                <div className="flex gap-1.5">
                  {stack.map((s: string) => (
                    <span key={s} className="bg-surface border border-border rounded-full px-2.5 py-0.5 text-xs">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {concerns.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Focus:</span>
                <div className="flex gap-1.5">
                  {concerns.map((c: string) => (
                    <span key={c} className="bg-accent/10 text-accent rounded-full px-2.5 py-0.5 text-xs capitalize">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {request.budget_min && request.budget_max && (
              <span className="text-text-muted">${request.budget_min}–${request.budget_max}</span>
            )}
          </div>
        </div>

        <div className={`mb-6 border rounded-xl px-4 py-3 ${roleBanner.tone}`}>
          <p className="text-sm font-semibold">{roleBanner.title}</p>
          <p className="text-sm mt-1 text-text-secondary">{roleBanner.body}</p>
        </div>

        {/* Progress stepper */}
        <ProgressStepper
          status={request.status}
          hasQuotes={hasQuotes}
          hasPaidQuote={hasPaidQuote}
          hasCompletedReview={hasCompletedReview}
          role={isOwner ? "builder" : "reviewer"}
        />

        {/* Action buttons */}
        <RequestActions
          requestId={Number(id)}
          status={request.status}
          isOwner={isOwner}
          hasAcceptedQuote={hasAcceptedQuote}
          request={{ title: request.title, description: request.description, repo_url: request.repo_url, stack, concerns, budget_min: request.budget_min, budget_max: request.budget_max, category: request.category }}
        />

        {/* Attachments */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Attachments</h2>
          {attachments.length > 0 ? (
            <div className="space-y-2">
              {attachments.map((a) => (
                <a
                  key={a.id}
                  href={`/api/attachments/${a.id}`}
                  className="flex items-center gap-2 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0">
                    <path d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07l9.2-9.19a3 3 0 0 1 4.24 4.24l-9.2 9.2a1 1 0 1 1-1.42-1.42l8.49-8.48" />
                  </svg>
                  <span className="truncate">{a.original_name}</span>
                  <span className="text-xs text-text-muted ml-auto">{(a.size / 1024).toFixed(0)} KB</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-lg px-4 py-4 text-sm text-text-muted">
              {isOwner
                ? "No attachments yet. Add files from the request form or share context in chat."
                : "No files shared yet. Ask the builder in chat if you need additional context files."}
            </div>
          )}
        </div>

        {/* Review section */}
        {review && review.overall_score && (
          <ReviewReport
            review={review}
            reviewer={{ name: review.reviewer_name, avatar_url: review.reviewer_avatar, github_username: review.reviewer_username }}
          />
        )}

        {/* Rating widget for completed reviews */}
        {review && request.status === "completed" && (
          <RatingWidget reviewId={review.id} isOwner={isOwner} />
        )}

        {/* Quotes section */}
        {request.status === "open" && isOwner ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">Quotes from Reviewers</h2>
            <QuoteList requestId={Number(id)} isOwner={isOwner} />
          </div>
        ) : hasAcceptedQuote && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Accepted Quote</h2>
            {quotes.filter((q) => q.status === "accepted").map((q) => (
              <div key={q.id} className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{q.reviewer_name}</div>
                    {q.note && <p className="text-sm text-text-secondary mt-1">{q.note}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold">${q.price}</div>
                    <div className="text-xs text-text-muted">{q.turnaround_hours}h turnaround</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${q.paid ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                      {q.paid ? "Paid" : "Payment pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat */}
        <div className="mt-8 print-hide">
          <Chat
            requestId={Number(id)}
            currentUserId={user.id}
            lifecycle={{ status: request.status, hasQuotes, hasPaidQuote, hasCompletedReview }}
            role={isOwner ? "builder" : "reviewer"}
          />
        </div>
      </main>
    </>
  );
}
