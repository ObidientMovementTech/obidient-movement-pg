import SEOHead from '../../components/public/SEOHead';

const TermsPage = () => (
  <>
    <SEOHead
      title="Terms of Service — Obidient Movement"
      description="Terms of service for the Obidient Movement platform. Read about your rights and obligations as a member."
    />

    {/* Hero */}
    <section className="py-20 lg:py-28 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
          <span className="w-8 h-px bg-accent-green" />
          Legal
          <span className="w-8 h-px bg-accent-green" />
        </span>
        <h1 className="mt-6 text-4xl sm:text-5xl font-medium text-white tracking-tight">Terms of Service</h1>
        <p className="mt-4 text-gray-400 text-sm">Last updated: January 2025</p>
      </div>
    </section>

    {/* Content */}
    <section className="py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose dark:prose-invert prose-headings:font-medium prose-headings:tracking-tight prose-a:text-accent-green">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using the Obidient Movement platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.</p>

        <h2>2. Eligibility</h2>
        <p>To use this platform, you must:</p>
        <ul>
          <li>Be at least 18 years of age</li>
          <li>Be a Nigerian citizen or resident</li>
          <li>Provide accurate and truthful information during registration</li>
          <li>Maintain the security of your account credentials</li>
        </ul>

        <h2>3. Account Responsibilities</h2>
        <p>You are responsible for:</p>
        <ul>
          <li>All activities that occur under your account</li>
          <li>Keeping your login credentials confidential</li>
          <li>Notifying us immediately if you suspect unauthorized access to your account</li>
          <li>Keeping your profile information accurate and up to date</li>
        </ul>

        <h2>4. Acceptable Use</h2>
        <p>When using the platform, you agree not to:</p>
        <ul>
          <li>Post or share false, misleading, or defamatory content</li>
          <li>Impersonate another person or organization</li>
          <li>Use the platform for illegal activities</li>
          <li>Attempt to gain unauthorized access to the platform's systems</li>
          <li>Harass, threaten, or abuse other members</li>
          <li>Use the platform for commercial purposes without authorization</li>
          <li>Distribute spam, malware, or any harmful content</li>
        </ul>

        <h2>5. Content</h2>
        <p>All content published on the platform (articles, images, videos) is owned by the Obidient Movement or its respective owners. You may not reproduce, distribute, or modify any content without permission.</p>

        <h2>6. Membership & Verification</h2>
        <p>Digital membership cards are issued upon successful verification. The movement reserves the right to revoke membership for violations of these terms or conduct detrimental to the movement's objectives.</p>

        <h2>7. Limitation of Liability</h2>
        <p>The Obidient Movement platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access to the platform. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>

        <h2>8. Modifications</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>

        <h2>9. Termination</h2>
        <p>We may suspend or terminate your account at our discretion if you violate these terms. You may also request account deletion at any time by contacting us.</p>

        <h2>10. Governing Law</h2>
        <p>These terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria.</p>

        <h2>11. Contact</h2>
        <p>For questions about these terms, contact us at <a href="mailto:info@obidients.com">info@obidients.com</a>.</p>
      </div>
    </section>
  </>
);

export default TermsPage;
