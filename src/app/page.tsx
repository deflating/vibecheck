import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Nav } from "@/components/nav";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="py-24 text-center">
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
            For vibecoders who ship fast
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Your AI wrote the code.<br />
            <span className="text-text-secondary">A human should check it.</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Vibecheck connects you with senior developers who review your AI-generated code
            for security holes, architecture problems, and performance issues — before they become production incidents.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
            >
              Post a Review Request
            </Link>
            <Link
              href="/signup/reviewer"
              className="border border-border hover:border-border-light text-text-secondary hover:text-text px-6 py-3 rounded-lg text-base font-medium transition-colors"
            >
              Join as a Reviewer
            </Link>
          </div>
        </section>

        {/* Social proof */}
        <section className="py-12 border-t border-border">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">2,400+</div>
              <div className="text-sm text-text-muted mt-1">Reviews completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold">97%</div>
              <div className="text-sm text-text-muted mt-1">Found critical issues</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.9/5</div>
              <div className="text-sm text-text-muted mt-1">Average reviewer rating</div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 border-t border-border">
          <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Post your project", desc: "Link your GitHub repo, describe what it does, and tell us what you're worried about. Security? Scale? Architecture?" },
              { step: "02", title: "Get quotes from experts", desc: "Senior developers review your listing and send quotes with their rate, turnaround time, and what they'll focus on." },
              { step: "03", title: "Get a structured review", desc: "Your reviewer delivers a detailed report — scores, specific issues, and actionable fixes across security, architecture, performance, and maintainability." },
            ].map((item) => (
              <div key={item.step} className="bg-surface border border-border rounded-xl p-6">
                <div className="text-accent font-mono text-sm mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-border text-center">
          <h2 className="text-3xl font-bold mb-4">Ship with confidence</h2>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto">
            Stop wondering if your AI-generated code is secretly terrible. Get a real review from someone who's seen it all.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
          >
            Get Started — It&apos;s Free to Post
          </Link>
        </section>

        <footer className="border-t border-border py-8 text-center text-sm text-text-muted">
          &copy; 2026 Vibecheck. Built for the vibe economy.
        </footer>
      </main>
    </>
  );
}
