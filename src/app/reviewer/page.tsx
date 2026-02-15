import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";
import { Nav } from "@/components/nav";

export default async function ReviewerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "reviewer") redirect("/dashboard");

  const db = getDb();
  const profile = db.prepare("SELECT * FROM reviewer_profiles WHERE user_id = ?").get(user.id) as any;
  const expertise = JSON.parse(profile?.expertise || "[]");

  const pendingQuotes = db.prepare(`
    SELECT q.*, rr.title as request_title
    FROM quotes q
    JOIN review_requests rr ON q.request_id = rr.id
    WHERE q.reviewer_id = ? AND q.status = 'pending'
  `).all(user.id) as any[];

  const activeReviews = db.prepare(`
    SELECT rev.id, rev.overall_score, rr.title, rr.repo_url, rr.description,
           q.price, q.turnaround_hours
    FROM reviews rev
    JOIN review_requests rr ON rev.request_id = rr.id
    JOIN quotes q ON rev.quote_id = q.id
    WHERE rev.reviewer_id = ? AND rev.overall_score IS NULL
  `).all(user.id) as any[];

  const completedCount = (db.prepare("SELECT COUNT(*) as c FROM reviews WHERE reviewer_id = ? AND overall_score IS NOT NULL").get(user.id) as any).c;

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-6xl px-6 py-10">
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
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold">{completedCount}</div>
              <div className="text-xs text-text-muted">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{activeReviews.length}</div>
              <div className="text-xs text-text-muted">In progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{pendingQuotes.length}</div>
              <div className="text-xs text-text-muted">Pending quotes</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Active Reviews</h2>
          <Link href="/reviewer/browse" className="text-sm text-accent hover:text-accent-hover transition-colors">
            Browse open requests &rarr;
          </Link>
        </div>

        {activeReviews.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center mb-8">
            <p className="text-text-muted text-sm mb-4">No active reviews. Browse open requests to find work.</p>
            <Link href="/reviewer/browse" className="inline-block bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Browse Requests
            </Link>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {activeReviews.map((r: any) => (
              <Link key={r.id} href={`/reviewer/review/${r.id}`} className="block bg-surface border border-border hover:border-border-light rounded-xl p-5 transition-colors">
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
            <div className="space-y-3">
              {pendingQuotes.map((q: any) => (
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
      </main>
    </>
  );
}
