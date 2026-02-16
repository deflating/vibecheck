import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";
import { Nav } from "@/components/nav";
import { QuoteList } from "./quote-list";
import { Chat } from "@/components/chat";

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
    SELECT * FROM reviews WHERE request_id = ?
  `).get(Number(id)) as any;

  const statusColors: Record<string, string> = {
    open: "bg-accent/10 text-accent",
    in_progress: "bg-warning/10 text-warning",
    completed: "bg-success/10 text-success",
    cancelled: "bg-text-muted/10 text-text-muted",
  };

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/dashboard" className="text-text-muted hover:text-text text-sm transition-colors">&larr; Back to dashboard</Link>

        <div className="mt-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{request.title}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[request.status]}`}>
              {request.status.replace("_", " ")}
            </span>
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
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Review Report</h2>
            <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
              {review.summary && <p className="text-text-secondary leading-relaxed">{review.summary}</p>}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Security", score: review.security_score, notes: review.security_notes },
                  { label: "Architecture", score: review.architecture_score, notes: review.architecture_notes },
                  { label: "Performance", score: review.performance_score, notes: review.performance_notes },
                  { label: "Maintainability", score: review.maintainability_score, notes: review.maintainability_notes },
                ].map((item) => (
                  <div key={item.label} className="bg-bg border border-border rounded-lg p-4">
                    <div className="text-xs text-text-muted mb-1">{item.label}</div>
                    <div className="text-2xl font-bold">{item.score}<span className="text-sm text-text-muted font-normal">/10</span></div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <div className="text-xs text-text-muted mb-1">Overall</div>
                <div className="text-4xl font-bold text-accent">{review.overall_score}<span className="text-lg text-text-muted font-normal">/10</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Quotes section */}
        {request.status === "open" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Quotes from Reviewers</h2>
            <QuoteList requestId={Number(id)} isOwner={request.user_id === user.id} />
          </div>
        )}

        {/* Chat */}
        <div className="mt-8">
          <Chat requestId={Number(id)} currentUserId={user.id} />
        </div>
      </main>
    </>
  );
}
