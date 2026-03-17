export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-3xl mx-auto prose prose-gray">
        <a href="/" className="text-blue-600 text-sm hover:underline">&larr; Back to home</a>
        <h1 className="text-3xl font-bold mt-6 mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: March 17, 2026</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">1. Data We Collect</h2>
        <p className="text-gray-600 text-sm leading-relaxed">We collect only what is necessary to provide the Service:</p>
        <ul className="text-gray-600 text-sm list-disc ml-6 space-y-1">
          <li><strong>Account data:</strong> Name, email address, hashed password</li>
          <li><strong>Client submission data:</strong> Names, emails, phone numbers, and messages submitted through intake forms</li>
          <li><strong>Usage data:</strong> Login events, page views (no third-party tracking)</li>
          <li><strong>Payment data:</strong> Handled entirely by Stripe — we never see or store card numbers</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">2. How We Protect Your Data</h2>
        <ul className="text-gray-600 text-sm list-disc ml-6 space-y-1">
          <li>Client PII (names, emails, phones) is encrypted at rest using AES-256-GCM</li>
          <li>All data in transit is encrypted via TLS 1.2+</li>
          <li>Passwords are hashed with bcrypt (12 rounds)</li>
          <li>Session tokens are cryptographically signed JWTs with expiration</li>
          <li>We follow OWASP Top 10 security guidelines</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">3. Data Sharing</h2>
        <p className="text-gray-600 text-sm leading-relaxed">We do <strong>not</strong> sell, rent, or share your personal data with any third parties. The only exception is Stripe, which processes payments on our behalf under their own privacy policy.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">4. Data Retention</h2>
        <p className="text-gray-600 text-sm leading-relaxed">We retain your data for as long as your account is active. Upon account deletion, all associated data is permanently removed within 30 days. Audit logs are retained for 90 days for security purposes.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">5. Your Rights (GDPR)</h2>
        <p className="text-gray-600 text-sm leading-relaxed">You have the right to:</p>
        <ul className="text-gray-600 text-sm list-disc ml-6 space-y-1">
          <li><strong>Access:</strong> Request a copy of your data</li>
          <li><strong>Rectification:</strong> Correct inaccurate data</li>
          <li><strong>Erasure:</strong> Request deletion of your data (right to be forgotten)</li>
          <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
          <li><strong>Objection:</strong> Object to processing of your data</li>
        </ul>
        <p className="text-gray-600 text-sm leading-relaxed mt-2">To exercise these rights, contact support@clientpulse.app.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">6. Cookies</h2>
        <p className="text-gray-600 text-sm leading-relaxed">We use only essential cookies for authentication (HTTP-only, secure, same-site strict). We do not use advertising or third-party tracking cookies.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">7. Children&apos;s Privacy</h2>
        <p className="text-gray-600 text-sm leading-relaxed">The Service is not intended for use by anyone under 16. We do not knowingly collect data from children.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">8. Changes to This Policy</h2>
        <p className="text-gray-600 text-sm leading-relaxed">We will notify you of material changes via email at least 30 days before they take effect.</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">9. Contact</h2>
        <p className="text-gray-600 text-sm leading-relaxed">For privacy inquiries: support@clientpulse.app</p>
      </div>
    </div>
  );
}
