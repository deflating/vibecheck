import { getCurrentUser } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { FaqAccordion } from "@/components/faq-accordion";
import Link from "next/link";

export default async function FaqPage() {
  const user = await getCurrentUser();

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-text-secondary mb-10">Everything you need to know about Vibecheck.</p>
        <FaqAccordion />
        <div className="mt-12 text-center">
          <p className="text-text-secondary mb-4">Still have questions?</p>
          <Link
            href="/login"
            className="inline-block bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
          >
            Get Started
          </Link>
        </div>
      </main>
    </>
  );
}
