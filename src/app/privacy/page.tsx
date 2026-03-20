export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-900 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-blue-400 text-sm hover:text-blue-300 transition">&larr; Back to home</a>
        <h1 className="text-3xl font-bold mt-6 mb-2 text-white">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: March 17, 2026</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">1. Data We Collect</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-3">We collect only what is necessary to provide the Service:</p>
        <ul className="text-slate-400 text-sm list-disc ml-6 space-y-1.5">
          <li><strong className="text-slate-200">Account data:</strong> Name, email address, hashed password</li>
          <li><strong className="text-slate-200">Client submission data:</strong> Names, emails, phone numbers, and messages submitted through intake forms</li>
          <li><strong className="text-slate-200">Usage data:</strong> Login events, page views (no third-party tracking)</li>
          <li><strong className="text-slate-200">Payment data:</strong> Handled entirely by Stripe — we never see or store card numbers</li>
        </ul>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">2. How We Protect Your Data</h2>
        <ul className="text-slate-400 text-sm list-disc ml-6 space-y-1.5">
          <li>Client PII (names, emails, phones) is encrypted at rest using AES-256-GCM</li>
          <li>All data in transit is encrypted via TLS 1.2+</li>
          <li>Passwords are hashed with bcrypt (12 rounds)</li>
          <li>Session tokens are cryptographically signed JWTs with expiration</li>
          <li>We follow OWASP Top 10 security guidelines</li>
        </ul>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">3. Data Sharing</h2>
        <p className="text-slate-400 text-sm leading-relaxed">We do <strong className="text-slate-200">not</strong> sell, rent, or share your personal data with any third parties. The only exception is Stripe, which processes payments on our behalf under their own privacy policy.</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">4. Data Retention</h2>
        <p className="text-slate-400 text-sm leading-relaxed">We retain your data for as long as your account is active. Upon account deletion, all associated data is permanently removed within 30 days. Audit logs are retained for 90 days for security purposes.</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">5. Your Rights (GDPR)</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-3">You have the right to:</p>
        <ul className="text-slate-400 text-sm list-disc ml-6 space-y-1.5">
          <li><strong className="text-slate-200">Access:</strong> Request a copy of your data</li>
          <li><strong className="text-slate-200">Rectification:</strong> Correct inaccurate data</li>
          <li><strong className="text-slate-200">Erasure:</strong> Request deletion of your data (right to be forgotten)</li>
          <li><strong className="text-slate-200">Portability:</strong> Receive your data in a machine-readable format</li>
          <li><strong className="text-slate-200">Objection:</strong> Object to processing of your data</li>
        </ul>
        <p className="text-slate-400 text-sm leading-relaxed mt-3">To exercise these rights, contact <a href="mailto:support@clientpulse.app" className="text-blue-400 hover:text-blue-300">support@clientpulse.app</a>.</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">6. Cookies</h2>
        <p className="text-slate-400 text-sm leading-relaxed">We use only essential cookies for authentication (HTTP-only, secure, same-site strict). We do not use advertising or third-party tracking cookies.</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">7. Children&apos;s Privacy</h2>
        <p className="text-slate-400 text-sm leading-relaxed">The Service is not intended for use by anyone under 16. We do not knowingly collect data from children.</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">8. Changes to This Policy</h2>
        <p className="text-slate-400 text-sm leading-relaxed">We will notify you of material changes via email at least 30 days before they take effect.</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">9. Contact</h2>
        <p className="text-slate-400 text-sm leading-relaxed">For privacy inquiries: <a href="mailto:support@clientpulse.app" className="text-blue-400 hover:text-blue-300">support@clientpulse.app</a></p>
      </div>
    </div>
  );
}
