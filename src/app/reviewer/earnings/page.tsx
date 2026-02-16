import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db/schema";
import { Nav } from "@/components/nav";

export default async function EarningsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "reviewer") redirect("/dashboard");

  const db = getDb();

  const totalEarned = (db.prepare(`
    SELECT COALESCE(SUM(q.price), 0) as total
    FROM quotes q
    WHERE q.reviewer_id = ? AND q.paid = 1
  `).get(user.id) as any).total;

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const thisMonthEarned = (db.prepare(`
    SELECT COALESCE(SUM(q.price), 0) as total
    FROM quotes q
    WHERE q.reviewer_id = ? AND q.paid = 1 AND q.created_at >= ?
  `).get(user.id, monthStart) as any).total;

  const pendingPayments = (db.prepare(`
    SELECT COALESCE(SUM(q.price), 0) as total
    FROM quotes q
    WHERE q.reviewer_id = ? AND q.status = 'accepted' AND q.paid = 0
  `).get(user.id) as any).total;

  const paidQuotes = db.prepare(`
    SELECT q.price, q.created_at, rr.title
    FROM quotes q
    JOIN review_requests rr ON q.request_id = rr.id
    WHERE q.reviewer_id = ? AND q.paid = 1
    ORDER BY q.created_at DESC
  `).all(user.id) as any[];

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-text-muted text-sm mt-1">Track your review income</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-surface border border-border rounded-xl p-5 text-center">
            <div className="text-2xl font-bold">${totalEarned}</div>
            <div className="text-xs text-text-muted">Total Earned</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5 text-center">
            <div className="text-2xl font-bold">${thisMonthEarned}</div>
            <div className="text-xs text-text-muted">This Month</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-5 text-center">
            <div className="text-2xl font-bold text-warning">${pendingPayments}</div>
            <div className="text-xs text-text-muted">Pending</div>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">Payment History</h2>
        {paidQuotes.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <p className="text-text-muted text-sm">No payments yet. Complete reviews to start earning.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Request</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paidQuotes.map((q: any, i: number) => (
                  <tr key={i}>
                    <td className="px-5 py-3 text-text-muted">{new Date(q.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">{q.title}</td>
                    <td className="px-5 py-3 text-right font-semibold">${q.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
