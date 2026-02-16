import { getCurrentUser } from "@/lib/auth";
import { Nav } from "@/components/nav";

export default async function TermsPage() {
  const user = await getCurrentUser();

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-text-muted text-sm mb-10">Last updated: February 2026</p>

        <div className="space-y-8 text-sm text-text-secondary leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text mb-3">Acceptance of Terms</h2>
            <p>By accessing or using Vibecheck, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform. We may update these terms from time to time, and continued use of the service constitutes acceptance of any changes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">Description of Service</h2>
            <p>Vibecheck is a marketplace that connects software developers with experienced code reviewers. We facilitate the discovery, communication, and payment process between parties. Vibecheck does not itself perform code reviews and is not responsible for the quality or accuracy of reviews provided by independent reviewers on the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">User Accounts</h2>
            <p>You must authenticate via GitHub to use Vibecheck. You are responsible for maintaining the security of your account and for all activity that occurs under your account. You agree to provide accurate information and to update it as necessary. We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">Code Privacy</h2>
            <p>Code submitted for review is only shared with the reviewer you select. We do not access, analyze, or share your code with any third parties beyond the selected reviewer. Repository access is limited to what is necessary to complete the review, and reviewers agree to confidentiality obligations regarding your code.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">Payment Terms</h2>
            <p>Payments are processed securely through our payment provider. Funds are held in escrow until the review is delivered. Reviewers receive payment after the review is completed and accepted. Refund requests are handled on a case-by-case basis. Vibecheck charges a platform fee on each transaction, which is disclosed before payment.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">Limitation of Liability</h2>
            <p>Vibecheck is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from your use of the platform, including but not limited to issues with code reviews, payment disputes, or service interruptions. Our total liability is limited to the amount you have paid to use the service in the preceding 12 months.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the platform. Your continued use of Vibecheck after changes are posted constitutes your acceptance of the revised terms. We encourage you to review these terms periodically.</p>
          </section>
        </div>
      </main>
    </>
  );
}
