"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface QuoteInfo {
  id: number;
  price: number;
  turnaround_hours: number;
  reviewer_name: string;
  request_title: string;
  paid: number;
}

export default function PayPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [quote, setQuote] = useState<QuoteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/requests/${id}/quotes`)
      .then((r) => r.json())
      .then((quotes) => {
        const accepted = quotes.find((q: { id: number; status: string; price: number; turnaround_hours: number; reviewer_name: string; paid: number }) => q.status === "accepted");
        if (!accepted) {
          setError("No accepted quote found");
          setLoading(false);
          return;
        }
        // Get request title
        fetch(`/api/requests/${id}`)
          .then((r) => r.json())
          .then((req) => {
            setQuote({
              id: accepted.id,
              price: accepted.price,
              turnaround_hours: accepted.turnaround_hours,
              reviewer_name: accepted.reviewer_name,
              request_title: req.title,
              paid: accepted.paid || 0,
            });
            setLoading(false);
          });
      });
  }, [id]);

  async function handlePay() {
    setPaying(true);
    const res = await fetch(`/api/requests/${id}/pay`, { method: "POST" });
    if (res.ok) {
      router.push(`/requests/${id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Payment failed");
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-text-muted">Loading payment details...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href={`/requests/${id}`} className="text-accent hover:text-accent-hover text-sm">
          &larr; Back to request
        </Link>
      </main>
    );
  }

  if (!quote) return null;

  if (quote.paid) {
    return (
      <main className="mx-auto max-w-lg px-6 py-20 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h1 className="text-xl font-bold mb-2">Already Paid</h1>
        <p className="text-text-muted mb-6">This review has already been paid for.</p>
        <Link href={`/requests/${id}`} className="text-accent hover:text-accent-hover text-sm">
          &larr; Back to request
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-20">
      <Link href={`/requests/${id}`} className="text-text-muted hover:text-text text-sm transition-colors">
        &larr; Back to request
      </Link>

      <div className="mt-8 bg-surface border border-border rounded-xl p-8">
        <h1 className="text-xl font-bold mb-1">Complete Payment</h1>
        <p className="text-text-muted text-sm mb-8">Pay to start your code review</p>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Review</span>
            <span className="font-medium">{quote.request_title}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Reviewer</span>
            <span className="font-medium">{quote.reviewer_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Turnaround</span>
            <span className="font-medium">{quote.turnaround_hours} hours</span>
          </div>
          <div className="border-t border-border pt-4 flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold">${quote.price}</span>
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full bg-accent-pop hover:bg-accent-pop-hover disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {paying ? "Processing..." : `Pay $${quote.price}`}
        </button>

        <p className="text-xs text-text-muted text-center mt-4">
          Stripe integration coming soon. This is a demo payment.
        </p>
      </div>
    </main>
  );
}
