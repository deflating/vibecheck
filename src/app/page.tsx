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
              className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
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

        {/* CTA */}
        <section className="py-20 border-t border-border text-center">
          <h2 className="text-3xl font-bold mb-4">Don&apos;t ship and pray</h2>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto">
            Your AI-generated code might be fine. It might also be a liability. Find out which before your users do.
          </p>
          <Link
            href="/login"
            className="inline-block bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
          >
            Get Started
          </Link>
        </section>

        <footer className="border-t border-border py-8 text-center text-sm text-text-muted">
          &copy; 2026 Vibecheck. Human eyes on AI code.
        </footer>
      </main>
    </>
  );
}
