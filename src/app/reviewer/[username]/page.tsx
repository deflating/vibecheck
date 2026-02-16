import { getDb } from "@/lib/db/schema";
import { safeParseJson } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function PublicReviewerProfile({ params }: Props) {
  const { username } = await params;
  const db = getDb();

  const row = db.prepare(`
    SELECT u.id, u.github_username, u.name, u.avatar_url, u.bio, u.created_at, u.verified,
      rp.tagline, rp.expertise, rp.hourly_rate, rp.rating, rp.review_count,
      rp.turnaround_hours, rp.github_url, rp.portfolio_url, rp.linkedin_url,
      rp.twitter_url, rp.blog_url, rp.work_history, rp.featured_projects,
      rp.languages, rp.frameworks
    FROM users u
    JOIN reviewer_profiles rp ON rp.user_id = u.id
    WHERE u.github_username = ? AND u.role = 'reviewer'
  `).get(username) as { id: number; github_username: string; name: string; avatar_url: string | null; bio: string | null; created_at: string; verified: number; tagline: string | null; expertise: string; hourly_rate: number | null; rating: number; review_count: number; turnaround_hours: number; github_url: string | null; portfolio_url: string | null; linkedin_url: string | null; twitter_url: string | null; blog_url: string | null; work_history: string; featured_projects: string; languages: string; frameworks: string } | undefined;

  if (!row) notFound();

  const profile = {
    ...row,
    expertise: safeParseJson(row.expertise, []) as string[],
    work_history: safeParseJson(row.work_history, []) as { company: string; role: string; years: string }[],
    featured_projects: safeParseJson(row.featured_projects, []) as { name: string; url: string; description: string }[],
    languages: safeParseJson(row.languages, []) as string[],
    frameworks: safeParseJson(row.frameworks, []) as string[],
  };

  const hasLinks = profile.portfolio_url || profile.linkedin_url || profile.twitter_url || profile.blog_url;
  const hasSkills = profile.languages.length > 0 || profile.frameworks.length > 0;

  // Calculate response rate: quotes submitted / open requests matching expertise
  const quotesCount = (db.prepare(`SELECT COUNT(*) as c FROM quotes WHERE reviewer_id = ?`).get(row.id) as { c: number }).c;
  const matchingRequests = (db.prepare(`SELECT COUNT(*) as c FROM review_requests WHERE status = 'open'`).get() as { c: number }).c;
  const responseRate = matchingRequests > 0 ? Math.min(100, Math.round((quotesCount / matchingRequests) * 100)) : 0;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="text-text-muted hover:text-text transition-colors text-sm">&larr; Back</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Breadcrumb items={[
          { label: "Reviewers", href: "/reviewers" },
          { label: profile.name || `@${profile.github_username}` },
        ]} />
        {/* Header */}
        <div className="flex items-start gap-5 mb-8">
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt={profile.name} className="w-20 h-20 rounded-full border-2 border-border" />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">{profile.name}</h1>
            <p className="text-text-muted text-sm">@{profile.github_username}</p>
            {profile.tagline && (
              <p className="text-text-secondary mt-1">{profile.tagline}</p>
            )}
            {profile.bio && (
              <p className="text-text-secondary text-sm mt-2">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{profile.review_count || 0}</div>
            <div className="text-xs text-text-muted">Reviews Completed</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{profile.rating ? profile.rating.toFixed(1) : "—"}</div>
            <div className="text-xs text-text-muted">Rating</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{profile.turnaround_hours || 48}h</div>
            <div className="text-xs text-text-muted">Avg Turnaround</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{responseRate}%</div>
            <div className="text-xs text-text-muted">Response Rate</div>
          </div>
        </div>

        {/* Links */}
        {(hasLinks || profile.github_username) && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Links</h2>
            <div className="flex flex-wrap gap-3">
              <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </a>
              {profile.portfolio_url && (
                <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                  Portfolio
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              )}
              {profile.twitter_url && (
                <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Twitter
                </a>
              )}
              {profile.blog_url && (
                <a href={profile.blog_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  Blog
                </a>
              )}
            </div>
          </div>
        )}

        {/* Expertise Badges */}
        {profile.expertise.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {profile.expertise.map((tag: string) => (
                <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {hasSkills && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Skills</h2>
            <div className="bg-surface border border-border rounded-xl p-5">
              {profile.languages.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-medium text-text-muted mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((l: string) => (
                      <span key={l} className="text-xs px-2.5 py-1 rounded-md bg-bg border border-border text-text-secondary">{l}</span>
                    ))}
                  </div>
                </div>
              )}
              {profile.frameworks.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-text-muted mb-2">Frameworks & Tools</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.frameworks.map((f: string) => (
                      <span key={f} className="text-xs px-2.5 py-1 rounded-md bg-bg border border-border text-text-secondary">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Featured Projects */}
        {profile.featured_projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Featured Projects</h2>
            <div className="space-y-3">
              {profile.featured_projects.map((proj: { name: string; url: string; description: string }, i: number) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-4 card-hover">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-sm">{proj.name}</h3>
                      {proj.description && <p className="text-text-secondary text-sm mt-1">{proj.description}</p>}
                    </div>
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline shrink-0 ml-3">
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work History */}
        {profile.work_history.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Work History</h2>
            <div className="space-y-3">
              {profile.work_history.map((entry: { company: string; role: string; years: string }, i: number) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">{entry.role}</h3>
                      <p className="text-text-secondary text-sm">{entry.company}</p>
                    </div>
                    {entry.years && <span className="text-xs text-text-muted">{entry.years}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hourly rate */}
        {profile.hourly_rate && (
          <div className="text-center text-sm text-text-muted mt-10 pt-8 border-t border-border">
            Starting at <span className="font-semibold text-text">${profile.hourly_rate}/hr</span>
          </div>
        )}
      </main>
    </div>
  );
}
