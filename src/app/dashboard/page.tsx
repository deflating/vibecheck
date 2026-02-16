import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";
import { Nav } from "@/components/nav";
import { timeAgo } from "@/lib/time-ago";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "reviewer") redirect("/reviewer");

  const params = await searchParams;
  const query = params.q || "";
  const statusFilter = params.status || "all";

  const db = getDb();

  // Stats
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM review_requests WHERE user_id = ?
  `).get(user.id) as any;

  const avgScore = db.prepare(`
    SELECT AVG(rev.overall_score) as avg
    FROM reviews rev
    JOIN review_requests rr ON rev.request_id = rr.id
    WHERE rr.user_id = ? AND rev.overall_score IS NOT NULL
  `).get(user.id) as any;

  // Filtered requests
  let sql = `
    SELECT r.*,
      (SELECT COUNT(*) FROM quotes q WHERE q.request_id = r.id) as quote_count,
      (SELECT COUNT(*) FROM quotes q WHERE q.request_id = r.id AND q.status = 'accepted') as accepted_count,
      (SELECT rev.overall_score FROM reviews rev WHERE rev.request_id = r.id AND rev.overall_score IS NOT NULL LIMIT 1) as review_score
    FROM review_requests r
    WHERE r.user_id = ?
  `;
  const sqlParams: any[] = [user.id];

  if (statusFilter && statusFilter !== "all") {
    sql += ` AND r.status = ?`;
    sqlParams.push(statusFilter);
  }
  if (query) {
    sql += ` AND r.title LIKE ?`;
    sqlParams.push(`%${query}%`);
  }
  sql += ` ORDER BY r.created_at DESC`;

  const requests = db.prepare(sql).all(...sqlParams) as any[];

  const statusColors: Record<string, string> = {
    open: "bg-accent/10 text-accent",
    in_progress: "bg-warning/10 text-warning",
    completed: "bg-success/10 text-success",
    cancelled: "bg-text-muted/10 text-text-muted",
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "in_progress", label: "In Progress" },
    { key: "completed", label: "Completed" },
  ];

  function scoreColor(score: number) {
    if (score >= 7) return "bg-success/10 text-success";
    if (score >= 4) return "bg-warning/10 text-warning";
    return "bg-danger/10 text-danger";
  }

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Reviews</h1>
            <p className="text-text-muted text-sm mt-1">All your code reviews in one place</p>
          </div>
          <Link
            href="/requests/new"
            className="bg-accent-pop hover:bg-accent-pop-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            New Request
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <div className="text-xs text-text-muted">Total Requests</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats?.in_progress || 0}</div>
            <div className="text-xs text-text-muted">In Progress</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats?.completed || 0}</div>
            <div className="text-xs text-text-muted">Completed</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{avgScore?.avg ? avgScore.avg.toFixed(1) : "—"}</div>
            <div className="text-xs text-text-muted">Average Score</div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form className="flex-1">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search requests..."
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm placeholder:text-text-muted"
            />
            <input type="hidden" name="status" value={statusFilter} />
          </form>
          <div className="flex gap-1.5">
            {filters.map((f) => (
              <Link
                key={f.key}
                href={`/dashboard?status=${f.key}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === f.key
                    ? "bg-accent text-white"
                    : "bg-surface border border-border text-text-secondary hover:text-text"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>

        {requests.length === 0 ? (
          query || statusFilter !== "all" ? (
            <div className="bg-surface border border-border rounded-xl p-12 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-lg font-semibold mb-2">No matching requests</h2>
              <p className="text-text-muted text-sm mb-6">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-8">
              <h2 className="text-lg font-semibold mb-1">Getting Started</h2>
              <p className="text-text-muted text-sm mb-6">Complete these steps to get your first code review</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-success/20 text-success flex items-center justify-center text-sm flex-shrink-0">&#10003;</span>
                  <span className="text-sm text-text-muted line-through">Connect GitHub</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <Link href="/requests/new" className="text-sm text-accent hover:text-accent-hover font-medium transition-colors">
                    Post your first review request &rarr;
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-border text-text-muted flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <Link href="/reviewers" className="text-sm text-text-secondary hover:text-text transition-colors">
                    Browse reviewers
                  </Link>
                </div>
              </div>
            </div>
          )
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
                      {r.review_score && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${scoreColor(r.review_score)}`}>
                          {r.review_score}/10
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-1">{r.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                      <span>{r.quote_count} quote{r.quote_count !== 1 ? "s" : ""}</span>
                      {r.budget_min && r.budget_max && (
                        <span>${r.budget_min}–${r.budget_max}</span>
                      )}
                      <span>{timeAgo(r.created_at)}</span>
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
