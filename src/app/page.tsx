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
              href="/login"
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
              <div className="text-4xl font-bold tracking-tight">$50+</div>
              <div className="text-sm text-text-muted mt-2">Reviews starting from</div>
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
          <h2 className="text-3xl font-bold text-center mb-12">What people are saying</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: "I shipped a SaaS MVP built entirely with Claude and Cursor. Vibecheck found 3 critical security issues I never would have caught. Worth every penny.", name: "Sarah K.", role: "Indie Maker" },
              { quote: "As a non-technical founder, I had no idea if my AI-generated code was any good. My reviewer broke it down in plain English and gave me a clear action plan.", name: "James T.", role: "Startup Founder" },
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

        {/* Pricing */}
        <section className="py-20 border-t border-border">
          <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
          <p className="text-text-secondary text-center mb-12 max-w-lg mx-auto">Pick the level of review that fits your project. No subscriptions, no hidden fees.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { tier: "Quick Check", price: "$50", desc: "Perfect for a sanity check on a small project. One reviewer, focused feedback on your top concerns." },
              { tier: "Standard Review", price: "$150", desc: "Full review covering security, architecture, performance, and maintainability. Detailed report with actionable fixes." },
              { tier: "Deep Dive", price: "$300+", desc: "Comprehensive audit for production-ready apps. Multiple focus areas, line-by-line analysis, and a prioritized remediation plan." },
            ].map((p) => (
              <div key={p.tier} className="bg-surface border border-border rounded-xl p-6 flex flex-col">
                <div className="text-sm text-text-muted mb-1">{p.tier}</div>
                <div className="text-3xl font-bold mb-3">{p.price}</div>
                <p className="text-sm text-text-secondary leading-relaxed mb-6 flex-1">{p.desc}</p>
                <Link
                  href="/login"
                  className="block text-center bg-accent-pop hover:bg-accent-pop-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* For Reviewers */}
        <section id="for-reviewers" className="py-20 border-t border-border text-center">
          <h2 className="text-3xl font-bold mb-4">Earn money reviewing code</h2>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto">
            Set your own rates, choose your projects, work on your schedule. Help the next generation of builders ship with confidence.
          </p>
          <Link
            href="/login"
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
              <a href="#how-it-works" className="text-text-muted hover:text-text transition-colors">How it Works</a>
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
