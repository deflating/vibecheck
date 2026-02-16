import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";
import { Nav } from "@/components/nav";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "reviewer") redirect("/reviewer");

  const db = getDb();
  const requests = db.prepare(`
    SELECT r.*,
      (SELECT COUNT(*) FROM quotes q WHERE q.request_id = r.id) as quote_count,
      (SELECT COUNT(*) FROM quotes q WHERE q.request_id = r.id AND q.status = 'accepted') as accepted_count
    FROM review_requests r
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `).all(user.id) as any[];

  const statusColors: Record<string, string> = {
    open: "bg-accent/10 text-accent",
    in_progress: "bg-warning/10 text-warning",
    completed: "bg-success/10 text-success",
    cancelled: "bg-text-muted/10 text-text-muted",
  };

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Reviews</h1>
            <p className="text-text-muted text-sm mt-1">All your code reviews in one place</p>
          </div>
          <Link
            href="/requests/new"
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            New Request
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-lg font-semibold mb-2">Your first review is waiting</h2>
            <p className="text-text-muted text-sm mb-6">Drop a repo link and a senior dev will tell you what&apos;s actually going on in there</p>
            <Link
              href="/requests/new"
              className="inline-block bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Post a Review Request
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r: any) => (
              <Link
                key={r.id}
                href={`/requests/${r.id}`}
                className="block bg-surface border border-border rounded-xl p-5 card-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold truncate">{r.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>
                        {r.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-1">{r.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                      <span>{r.quote_count} quote{r.quote_count !== 1 ? "s" : ""}</span>
                      {r.budget_min && r.budget_max && (
                        <span>${r.budget_min}–${r.budget_max}</span>
                      )}
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
