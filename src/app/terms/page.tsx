export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-900 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-blue-400 text-sm hover:text-blue-300 transition">&larr; Back to home</a>
        <h1 className="text-3xl font-bold mt-6 mb-2 text-white">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: March 17, 2026</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">1. Acceptance of Terms</h2>
        <p className="text-slate-400 text-sm leading-relaxed">By accessing or using ClientPulse (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">2. Description of Service</h2>
        <p className="text-slate-400 text-sm leading-relaxed">ClientPulse provides client intake form management and automated follow-up tools for service businesses. The Service includes web-based forms, an admin dashboard, and automated email functionality.</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">3. Account Registration</h2>
        <p className="text-slate-400 text-sm leading-relaxed">You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorized access.</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">4. Payment Terms</h2>
        <p className="text-slate-400 text-sm leading-relaxed">Paid subscriptions are billed monthly through Stripe. You may cancel at any time from your dashboard. Refunds are available within 30 days of purchase. We do not store credit card information — all payment processing is handled by Stripe in compliance with PCI DSS.</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">5. Data Ownership</h2>
        <p className="text-slate-400 text-sm leading-relaxed">You retain ownership of all data you submit to the Service. We do not sell or share your data with third parties. You may request deletion of your data at any time.</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">6. Acceptable Use</h2>
        <p className="text-slate-400 text-sm leading-relaxed">You may not use the Service for spam, harassment, illegal activity, or any purpose that violates applicable law. We reserve the right to suspend accounts that violate these terms.</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">7. Service Availability</h2>
        <p className="text-slate-400 text-sm leading-relaxed">We strive for 99.9% uptime but do not guarantee uninterrupted service. We are not liable for losses resulting from service interruptions.</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">8. Limitation of Liability</h2>
        <p className="text-slate-400 text-sm leading-relaxed">ClientPulse is provided &quot;as is&quot; without warranty. Our total liability shall not exceed the amount you paid for the Service in the preceding 12 months.</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">9. Changes to Terms</h2>
        <p className="text-slate-400 text-sm leading-relaxed">We may update these terms with 30 days notice via email. Continued use after changes constitutes acceptance.</p>

        <h2 className="text-lg font-semibold mt-8 mb-3 text-white">10. Contact</h2>
        <p className="text-slate-400 text-sm leading-relaxed">For questions about these terms, contact us at <a href="mailto:support@clientpulse.app" className="text-blue-400 hover:text-blue-300">support@clientpulse.app</a>.</p>
      </div>
    </div>
  );
}
