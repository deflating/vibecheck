import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";
import { Nav } from "@/components/nav";
import { scoreColor, safeParseJson } from "@/lib/utils";

export default async function ReviewerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "reviewer") redirect("/dashboard");

  const db = getDb();
  const profile = db.prepare("SELECT * FROM reviewer_profiles WHERE user_id = ?").get(user.id) as { user_id: number; expertise: string; hourly_rate: number | null; rating: number; review_count: number; turnaround_hours: number; tagline: string | null } | undefined;
  if (!profile) redirect("/reviewer/onboarding");
  const expertise = safeParseJson(profile?.expertise, []);

  const pendingQuotes = db.prepare(`
    SELECT q.*, rr.title as request_title
    FROM quotes q
    JOIN review_requests rr ON q.request_id = rr.id
    WHERE q.reviewer_id = ? AND q.status = 'pending'
  `).all(user.id) as { id: number; request_id: number; reviewer_id: number; price: number; turnaround_hours: number; note: string | null; status: string; paid: number; created_at: string; request_title: string }[];

  const activeReviews = db.prepare(`
    SELECT rev.id, rev.overall_score, rr.title, rr.repo_url, rr.description,
           q.price, q.turnaround_hours
    FROM reviews rev
    JOIN review_requests rr ON rev.request_id = rr.id
    JOIN quotes q ON rev.quote_id = q.id
    WHERE rev.reviewer_id = ? AND rev.overall_score IS NULL
  `).all(user.id) as { id: number; overall_score: number | null; title: string; repo_url: string; description: string; price: number; turnaround_hours: number }[];

  const completedCount = (db.prepare("SELECT COUNT(*) as c FROM reviews WHERE reviewer_id = ? AND overall_score IS NOT NULL").get(user.id) as { c: number }).c;

  // Enhanced stats
  const totalEarned = (db.prepare(`
    SELECT COALESCE(SUM(q.price), 0) as total
    FROM quotes q
    WHERE q.reviewer_id = ? AND q.paid = 1
  `).get(user.id) as { total: number }).total;

  const avgRating = (db.prepare(`
    SELECT AVG(rr.rating) as avg
    FROM reviewer_ratings rr
    JOIN reviews rev ON rr.review_id = rev.id
    WHERE rev.reviewer_id = ?
  `).get(user.id) as { avg: number | null }).avg;

  const openRequestsCount = (db.prepare(`
    SELECT COUNT(*) as c FROM review_requests WHERE status = 'open'
  `).get() as { c: number }).c;

  // Recent activity - last 5 completed reviews
  const recentActivity = db.prepare(`
    SELECT rev.overall_score, rev.created_at, rr.title
    FROM reviews rev
    JOIN review_requests rr ON rev.request_id = rr.id
    WHERE rev.reviewer_id = ? AND rev.overall_score IS NOT NULL
    ORDER BY rev.created_at DESC
    LIMIT 5
  `).all(user.id) as { overall_score: number; created_at: string; title: string }[];

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        {/* Profile header */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {profile?.tagline && <p className="text-text-muted italic mt-1">&ldquo;{profile.tagline}&rdquo;</p>}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {expertise.map((e: string) => (
                  <span key={e} className="text-xs bg-accent/10 text-accent rounded-full px-2.5 py-0.5">{e}</span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-warning">
                <span>★</span>
                <span className="font-semibold">{profile?.rating?.toFixed(1) || "0.0"}</span>
              </div>
              <div className="text-xs text-text-muted mt-1">{profile?.review_count || 0} reviews</div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold">{completedCount}</div>
              <div className="text-xs text-text-muted">Reviews Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${totalEarned}</div>
              <div className="text-xs text-text-muted">Total Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{avgRating ? avgRating.toFixed(1) : "—"}</div>
              <div className="text-xs text-text-muted">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{openRequestsCount}</div>
              <div className="text-xs text-text-muted">Open Requests</div>
            </div>
          </div>
        </div>

        {completedCount === 0 && activeReviews.length === 0 && pendingQuotes.length === 0 && (
          <div className="bg-surface border border-border rounded-xl p-8 mb-8">
            <h2 className="text-lg font-semibold mb-1">Getting Started</h2>
            <p className="text-text-muted text-sm mb-6">Complete these steps to land your first review</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-success/20 text-success flex items-center justify-center text-sm flex-shrink-0">&#10003;</span>
                <span className="text-sm text-text-muted line-through">Set up your profile</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <Link href="/reviewer/browse" className="text-sm text-accent hover:text-accent-hover font-medium transition-colors">
                  Browse open requests &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Active Reviews</h2>
          <Link href="/reviewer/browse" className="text-sm text-accent hover:text-accent-hover transition-colors">
            Browse open requests &rarr;
          </Link>
        </div>

        {activeReviews.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center mb-8">
            <p className="text-text-muted text-sm mb-4">No active reviews. Browse open requests to find work.</p>
            <Link href="/reviewer/browse" className="inline-block bg-accent-pop hover:bg-accent-pop-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Browse Requests
            </Link>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {activeReviews.map((r) => (
              <Link key={r.id} href={`/reviewer/review/${r.id}`} className="block bg-surface border border-border rounded-xl p-5 card-hover">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{r.title}</h3>
                    <p className="text-sm text-text-muted mt-1 line-clamp-1">{r.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="font-semibold">${r.price}</div>
                    <div className="text-xs text-text-muted">{r.turnaround_hours}h</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {pendingQuotes.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Pending Quotes</h2>
            <div className="space-y-3 mb-8">
              {pendingQuotes.map((q) => (
                <div key={q.id} className="bg-surface border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{q.request_title}</h3>
                      <div className="text-xs text-text-muted mt-1">Submitted {new Date(q.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${q.price}</div>
                      <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">Pending</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="bg-surface border border-border rounded-xl divide-y divide-border">
              {recentActivity.map((a, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-text-muted">{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${scoreColor(a.overall_score)}`}>
                    {a.overall_score}/10
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
