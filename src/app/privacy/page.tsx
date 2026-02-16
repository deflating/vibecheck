import { getCurrentUser } from "@/lib/auth";
import { Nav } from "@/components/nav";

export default async function PrivacyPage() {
  const user = await getCurrentUser();

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-text-muted text-sm mb-10">Last updated: February 2026</p>

        <div className="space-y-8 text-sm text-text-secondary leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-text mb-3">Information We Collect</h2>
            <p>We collect information you provide when creating an account through GitHub OAuth, including your name, email address, and public profile information. We also collect usage data such as pages visited, features used, and review requests created. We do not collect or store your GitHub password.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">How We Use Your Information</h2>
            <p>We use your information to operate and improve the platform, facilitate code reviews, process payments, send relevant notifications, and provide customer support. We may use aggregated, anonymized data for analytics and to improve our services. We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">Code Privacy</h2>
            <p>Your code is treated with the highest level of confidentiality. Code submitted for review is only accessible to the reviewer you select. We do not use your code for training models, analytics, or any purpose beyond facilitating the review you requested. Reviewers are bound by confidentiality agreements regarding all code they review.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">Data Security</h2>
            <p>We implement industry-standard security measures to protect your data, including encryption in transit and at rest. Access to user data is restricted to authorized personnel only. While we strive to protect your information, no method of transmission over the internet is completely secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">Third-Party Services (GitHub)</h2>
            <p>We integrate with GitHub for authentication and repository access. When you connect your GitHub account, we request only the permissions necessary to facilitate code reviews. You can revoke Vibecheck&apos;s access to your GitHub account at any time through your GitHub settings. Please review GitHub&apos;s own privacy policy for information about how they handle your data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information at any time. You can export your data or request account deletion by contacting us. Upon account deletion, we will remove your personal data within 30 days, except where retention is required by law or for legitimate business purposes such as resolving disputes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-3">Contact</h2>
            <p>If you have questions about this privacy policy or how we handle your data, please reach out to us at privacy@vibecheck.dev. We aim to respond to all inquiries within 48 hours.</p>
          </section>
        </div>
      </main>
    </>
  );
}
