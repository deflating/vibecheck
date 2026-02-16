"use client";

import { useState } from "react";

const faqs = [
  {
    q: "How does Vibecheck work?",
    a: "Post a review request with your repo link. Senior devs bid on your review. Pick one, pay, and get a structured report within 24-48 hours.",
  },
  {
    q: "How much does a review cost?",
    a: "Reviews start at $50 for a quick sanity check. Standard reviews run $100-200. Deep dives into security or architecture are $200-500+. You set your budget and reviewers quote within it.",
  },
  {
    q: "Who reviews my code?",
    a: "Experienced developers with verified GitHub profiles. They set their own rates and specialties. You can see their ratings, past reviews, and areas of expertise before choosing.",
  },
  {
    q: "How long does a review take?",
    a: "Most reviews are completed within 24-48 hours. Quick sanity checks can be done same-day. You'll get notifications as your review progresses.",
  },
  {
    q: "Is my code kept private?",
    a: "Yes. Your repository is only visible to the reviewer you select. We never share your code with anyone else. Reviewers agree to confidentiality terms.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "You can rate your review and leave feedback. If a review doesn't meet our quality standards, we'll work with you to make it right. We're building a platform where quality matters.",
  },
  {
    q: "Can I become a reviewer?",
    a: "Absolutely! Sign up with GitHub, switch to reviewer mode, set up your profile with your expertise and rates, and start bidding on review requests.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-border">
      {faqs.map((faq, i) => (
        <button
          key={i}
          className="w-full text-left py-5 group"
          onClick={() => setOpen(open === i ? null : i)}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-base">{faq.q}</span>
            <span className="text-text-muted shrink-0 transition-transform duration-200" style={{ transform: open === i ? "rotate(45deg)" : "none" }}>
              +
            </span>
          </div>
          <div
            className="overflow-hidden transition-all duration-200"
            style={{ maxHeight: open === i ? "200px" : "0px", opacity: open === i ? 1 : 0 }}
          >
            <p className="text-text-secondary text-sm leading-relaxed pt-3">{faq.a}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
