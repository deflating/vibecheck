import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";
import { Nav } from "@/components/nav";
import { QuoteList } from "./quote-list";
import { Chat } from "@/components/chat";
import { RatingWidget } from "./rating-widget";
import { ReviewReport } from "./review-report";
import { ActivityTimeline } from "./activity-timeline";

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
  `).get(Number(id)) as any;

  if (!request) notFound();

  const stack = JSON.parse(request.stack);
  const concerns = JSON.parse(request.concerns);

  // Check for completed review
  const review = db.prepare(`
    SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar, u.github_username as reviewer_username
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.id
    WHERE r.request_id = ?
  `).get(Number(id)) as any;

  // Build activity timeline events
  const timelineEvents: { label: string; detail?: string; date: string }[] = [];
  timelineEvents.push({ label: "Request created", detail: request.title, date: request.created_at });
  const quotes = db.prepare(`SELECT q.*, u.name as reviewer_name FROM quotes q JOIN users u ON q.reviewer_id = u.id WHERE q.request_id = ? ORDER BY q.created_at`).all(Number(id)) as any[];
  for (const q of quotes) {
    timelineEvents.push({ label: `Quote received`, detail: `$${q.price} from ${q.reviewer_name}`, date: q.created_at });
    if (q.status === "accepted") {
      timelineEvents.push({ label: "Quote accepted", detail: q.reviewer_name, date: q.created_at });
    }
  }
  if (review) {
    timelineEvents.push({ label: "Review submitted", detail: `Overall score: ${review.overall_score}/10`, date: review.created_at });
  }

  const statusColors: Record<string, string> = {
    open: "bg-accent/10 text-accent",
    in_progress: "bg-warning/10 text-warning",
    completed: "bg-success/10 text-success",
    cancelled: "bg-text-muted/10 text-text-muted",
  };

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <Link href="/dashboard" className="text-text-muted hover:text-text text-sm transition-colors">&larr; Back to dashboard</Link>

        <div className="mt-6 mb-8">
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

        {/* Review section */}
        {review && review.overall_score && (
          <ReviewReport
            review={review}
            reviewer={{ name: review.reviewer_name, avatar_url: review.reviewer_avatar, github_username: review.reviewer_username }}
          />
        )}

        {/* Rating widget for completed reviews */}
        {review && request.status === "completed" && (
          <RatingWidget reviewId={review.id} isOwner={request.user_id === user.id} />
        )}

        {/* Quotes section */}
        {request.status === "open" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Quotes from Reviewers</h2>
            <QuoteList requestId={Number(id)} isOwner={request.user_id === user.id} />
          </div>
        )}

        {/* Activity Timeline */}
        <ActivityTimeline events={timelineEvents} />

        {/* Chat */}
        <div className="mt-8 print-hide">
          <Chat requestId={Number(id)} currentUserId={user.id} />
        </div>
      </main>
    </>
  );
}
