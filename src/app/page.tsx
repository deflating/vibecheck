import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Nav } from "@/components/nav";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="py-16 sm:py-24 text-center">
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
            Code reviews for the AI era
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            You prompted it.<br />
            <span className="text-text-secondary">Now get it checked.</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            AI can write code fast. It can also write security holes, bad architecture, and ticking time bombs.
            Vibecheck pairs you with senior devs who catch what the AI missed — before your users do.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="bg-accent-pop hover:bg-accent-pop-hover text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
            >
              Get Your Code Reviewed
            </Link>
            <Link
              href="/login?intent=reviewer"
              className="border border-border hover:border-border-light text-text-secondary hover:text-text px-6 py-3 rounded-lg text-base font-medium transition-colors"
            >
              Review Code for $$$
            </Link>
          </div>
        </section>

        {/* Why it matters */}
        <section className="py-12 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold tracking-tight">70%</div>
              <div className="text-sm text-text-muted mt-2">of AI-generated code has issues*</div>
            </div>
            <div>
              <div className="text-4xl font-bold tracking-tight">&lt; 24hr</div>
              <div className="text-sm text-text-muted mt-2">Typical review turnaround</div>
            </div>
            <div>
              <div className="text-4xl font-bold tracking-tight">You set the price</div>
              <div className="text-sm text-text-muted mt-2">Reviewers bid on your project</div>
            </div>
          </div>
          <p className="text-xs text-text-muted text-center mt-4">*Based on industry research into LLM code quality</p>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 border-t border-border">
          <h2 className="text-3xl font-bold text-center mb-16">Three steps to peace of mind</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Drop your repo", desc: "Connect GitHub, pick a repo, and flag what keeps you up at night — security, scaling, spaghetti architecture, all of it." },
              { step: "02", title: "Get matched with a pro", desc: "Senior devs with real-world experience bid on your review. Pick based on expertise, rate, and turnaround." },
              { step: "03", title: "Ship with receipts", desc: "Get a structured report with severity scores, line-by-line issues, and concrete fixes you can actually act on." },
            ].map((item) => (
              <div key={item.step} className="bg-surface border border-border rounded-xl p-6 card-hover">
                <div className="text-accent font-mono text-sm mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 border-t border-border">
          <h2 className="text-3xl font-bold text-center mb-4">What people are saying</h2>
          <p className="text-text-muted text-center text-sm mb-12">Early user stories from our beta</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "I shipped a SaaS MVP built entirely with Claude and Cursor. Vibecheck found 3 critical security issues I never would have caught. Worth every penny.", name: "Sarah K.", role: "Indie Maker" },
              { quote: "I built my whole app with Cursor and had no idea if the code was actually solid. My reviewer broke it down in plain English and gave me a clear action plan.", name: "James T.", role: "Solo Founder" },
              { quote: "I've been reviewing code for 15 years. Vibecheck lets me help vibecoders ship better code and earn great money doing it. Win-win.", name: "Marcus R.", role: "Senior Engineer & Vibecheck Reviewer" },
            ].map((t) => (
              <div key={t.name} className="bg-surface border border-border rounded-xl p-6">
                <p className="text-sm leading-relaxed text-text-secondary mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-text-muted">{t.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Sample Review */}
        <section className="py-20 border-t border-border">
          <h2 className="text-3xl font-bold text-center mb-4">See what you get</h2>
          <p className="text-text-secondary text-center mb-12 max-w-lg mx-auto">Every review includes a structured report with scores across four categories, detailed notes, and actionable recommendations.</p>
          <div className="bg-surface border border-border rounded-xl p-6 max-w-3xl mx-auto relative">
            <div className="absolute top-4 right-4 text-xs text-text-muted bg-bg border border-border rounded-full px-2.5 py-0.5">Example Review</div>
            <div className="flex items-center gap-3 pb-4 border-b border-border mb-6">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">JR</div>
              <div>
                <div className="font-medium">Jane Rivera</div>
                <div className="text-sm text-text-muted">Senior Engineer &middot; 12 years experience</div>
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">Overall a solid MVP with good use of Next.js conventions. However, there are critical auth vulnerabilities and the database layer needs attention before this goes to production.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {[
                { label: "Security", score: 4, note: "JWT tokens stored in localStorage — use httpOnly cookies. No rate limiting on auth endpoints." },
                { label: "Architecture", score: 7, note: "Clean separation of concerns. API routes are well-organized. Consider extracting shared validation logic." },
                { label: "Performance", score: 6, note: "N+1 queries on the dashboard. Add database indexes on foreign keys. Bundle size is reasonable." },
                { label: "Maintainability", score: 8, note: "Good TypeScript usage, consistent naming. Tests are missing but the code is structured to be testable." },
              ].map((cat) => (
                <div key={cat.label} className="bg-bg border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div>
                      <div className="text-xs text-text-muted">{cat.label}</div>
                      <div className="text-xl font-bold">{cat.score}<span className="text-sm text-text-muted font-normal">/10</span></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${cat.score <= 3 ? "bg-danger" : cat.score <= 5 ? "bg-warning" : cat.score <= 7 ? "bg-accent" : "bg-success"}`}
                          style={{ width: `${cat.score * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{cat.note}</p>
                </div>
              ))}
            </div>
            <div className="text-center pb-4 border-b border-border mb-4">
              <div className="text-xs text-text-muted mb-1">Overall</div>
              <div className="text-3xl font-bold text-accent">6.3<span className="text-base text-text-muted font-normal">/10</span></div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-2">Top Recommendations</div>
              <ul className="text-sm text-text-secondary space-y-1.5">
                <li className="flex gap-2"><span className="text-danger">●</span> Move JWT storage to httpOnly cookies and add CSRF protection</li>
                <li className="flex gap-2"><span className="text-warning">●</span> Add rate limiting to all authentication endpoints</li>
                <li className="flex gap-2"><span className="text-accent">●</span> Fix N+1 queries on dashboard with eager loading</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 border-t border-border">
          <h2 className="text-3xl font-bold text-center mb-4">Reviewers compete. You choose.</h2>
          <p className="text-text-secondary text-center mb-12 max-w-lg mx-auto">Post your project, set your budget, and let experienced devs bid for the work. No subscriptions, no lock-in — just the right reviewer at the right price.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "You set the budget", icon: "💰", desc: "Tell reviewers what you're willing to spend. Quotes typically range from $50 for a quick check to $300+ for a deep dive." },
              { title: "Reviewers compete", icon: "🎯", desc: "Experienced devs bid on your project with their price, turnaround time, and approach. Pick the best fit." },
              { title: "Pay when you're ready", icon: "✓", desc: "Only pay after you've accepted a quote. No commitment until you find the right reviewer at the right price." },
            ].map((p) => (
              <div key={p.title} className="bg-surface border border-border rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-semibold mb-2">{p.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/login"
              className="inline-block bg-accent-pop hover:bg-accent-pop-hover text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
            >
              Post Your First Request
            </Link>
          </div>
        </section>

        {/* For Reviewers */}
        <section id="for-reviewers" className="py-20 border-t border-border text-center">
          <h2 className="text-3xl font-bold mb-4">Earn money reviewing code</h2>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto">
            Set your own rates, choose your projects, work on your schedule. Help the next generation of builders ship with confidence.
          </p>
          <Link
            href="/login?intent=reviewer"
            className="inline-block bg-accent-pop hover:bg-accent-pop-hover text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
          >
            Start Reviewing
          </Link>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-border text-center">
          <h2 className="text-3xl font-bold mb-4">Don&apos;t ship and pray</h2>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto">
            Your AI-generated code might be fine. It might also be a liability. Find out which before your users do.
          </p>
          <Link
            href="/login"
            className="inline-block bg-accent-pop hover:bg-accent-pop-hover text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
          >
            Get Started
          </Link>
        </section>

        <footer className="border-t border-border py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm mb-8">
            <div className="flex flex-col gap-2">
              <div className="font-medium mb-1">Product</div>
              <Link href="/how-it-works" className="text-text-muted hover:text-text transition-colors">How it Works</Link>
              <Link href="/reviewers" className="text-text-muted hover:text-text transition-colors">Browse Reviewers</Link>
              <Link href="/faq" className="text-text-muted hover:text-text transition-colors">FAQ</Link>
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-medium mb-1">Community</div>
              <a href="#for-reviewers" className="text-text-muted hover:text-text transition-colors">For Reviewers</a>
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-medium mb-1">Legal</div>
              <Link href="/terms" className="text-text-muted hover:text-text transition-colors">Terms</Link>
              <Link href="/privacy" className="text-text-muted hover:text-text transition-colors">Privacy</Link>
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-medium mb-1">Get Started</div>
              <Link href="/login" className="text-text-muted hover:text-text transition-colors">Sign Up</Link>
              <a href="mailto:support@vibecheck.dev" className="text-text-muted hover:text-text transition-colors">Contact Us</a>
            </div>
          </div>
          <div className="text-center text-sm text-text-muted">
            &copy; 2026 Vibecheck. Human eyes on AI code.
          </div>
        </footer>
      </main>
    </>
  );
}
