import { getCurrentUser } from "@/lib/auth";
import { Nav } from "@/components/nav";
import Link from "next/link";

const steps = [
  {
    title: "Post Your Request",
    description: "Connect your GitHub repo, describe your project, and tell us what keeps you up at night. Security? Architecture? Spaghetti code? We've got you covered.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4" />
        <path d="M12 16h4" />
        <path d="M8 11h.01" />
        <path d="M8 16h.01" />
      </svg>
    ),
  },
  {
    title: "Get Matched",
    description: "Experienced reviewers see your request and submit quotes. Compare their expertise, ratings, and turnaround times to find your perfect match.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Pay Securely",
    description: "Pay only after you've chosen your reviewer. Funds are held until your review is delivered. Simple, transparent pricing.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    ),
  },
  {
    title: "Receive Your Report",
    description: "Get a structured review covering security, architecture, performance, and maintainability. Each area scored 1-10 with detailed notes and line-level feedback.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Ship With Confidence",
    description: "Apply the recommended fixes, knowing your code has been vetted by experienced eyes. Rate your reviewer and help build the community.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
  },
];

export default async function HowItWorksPage() {
  const user = await getCurrentUser();

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">How It Works</h1>
        <p className="text-text-secondary mb-16">From posting your request to shipping with confidence — five simple steps.</p>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-6 top-8 bottom-8 w-px bg-border hidden sm:block" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={i} className="relative flex gap-6 sm:gap-8">
                {/* Step number + icon */}
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-surface border border-border rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-text-muted">Step {i + 1}</span>
                  </div>
                  <h2 className="text-lg font-semibold mb-2">{step.title}</h2>
                  <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-text-secondary mb-4">Ready to get started?</p>
          <Link
            href="/login"
            className="inline-block bg-accent-pop hover:bg-accent-pop-hover text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
          >
            Get Your Code Reviewed
          </Link>
        </div>
      </main>
    </>
  );
}
