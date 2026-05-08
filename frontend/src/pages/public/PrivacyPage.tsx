import SEOHead from '../../components/public/SEOHead';

const PrivacyPage = () => (
  <>
    <SEOHead
      title="Privacy Policy — Obidient Movement"
      description="Privacy policy for the Obidient Movement platform. Learn how we collect, use, and protect your personal information."
    />

    {/* Hero */}
    <section className="py-20 lg:py-28 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-accent-green">
          <span className="w-8 h-px bg-accent-green" />
          Legal
          <span className="w-8 h-px bg-accent-green" />
        </span>
        <h1 className="mt-6 text-4xl sm:text-5xl font-medium text-white tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-gray-400 text-sm">Last updated: January 2025</p>
      </div>
    </section>

    {/* Content */}
    <section className="py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose dark:prose-invert prose-headings:font-medium prose-headings:tracking-tight prose-a:text-accent-green">
        <h2>1. Information We Collect</h2>
        <p>When you register with the Obidient Movement platform, we collect the following information:</p>
        <ul>
          <li><strong>Personal Information:</strong> Full name, email address, phone number</li>
          <li><strong>Location Data:</strong> State, local government area, and ward (used for organizational structure)</li>
          <li><strong>Account Data:</strong> Login credentials (passwords are securely hashed and never stored in plain text)</li>
          <li><strong>Usage Data:</strong> Basic analytics about how you interact with the platform</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Create and manage your membership account</li>
          <li>Connect you with your local chapter and coordinators</li>
          <li>Send important movement updates and communications</li>
          <li>Improve the platform and user experience</li>
          <li>Verify membership and issue digital membership cards</li>
        </ul>

        <h2>3. Data Protection</h2>
        <p>We take the security of your personal data seriously. All data is:</p>
        <ul>
          <li>Encrypted in transit using TLS/SSL</li>
          <li>Stored on secure servers with restricted access</li>
          <li>Protected by industry-standard security measures</li>
          <li>Never sold to third parties</li>
        </ul>

        <h2>4. Data Sharing</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share limited information with:</p>
        <ul>
          <li><strong>Local Coordinators:</strong> Name and ward information for organizational purposes</li>
          <li><strong>Service Providers:</strong> Trusted third-party services that help us operate the platform (e.g., hosting, email delivery)</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect the rights and safety of our members</li>
        </ul>

        <h2>5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access and review your personal data</li>
          <li>Update or correct your information</li>
          <li>Request deletion of your account and associated data</li>
          <li>Opt out of non-essential communications</li>
        </ul>

        <h2>6. Cookies</h2>
        <p>We use essential cookies to maintain your login session and preferences. We do not use tracking cookies for advertising purposes.</p>

        <h2>7. Children's Privacy</h2>
        <p>Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children.</p>

        <h2>8. Changes to This Policy</h2>
        <p>We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.</p>

        <h2>9. Contact Us</h2>
        <p>If you have questions about this privacy policy or your personal data, please contact us at <a href="mailto:info@obidients.com">info@obidients.com</a>.</p>
      </div>
    </section>
  </>
);

export default PrivacyPage;
