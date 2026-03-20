export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-900 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-blue-400 text-sm hover:text-blue-300 transition">&larr; Back to home</a>

        <h1 className="text-3xl font-bold mt-6 mb-2 text-white">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-2">Effective date: March 17, 2026</p>
        <p className="text-slate-400 text-sm leading-relaxed mb-10">
          ClientPulse (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting the privacy of our users and their clients. This Privacy Policy describes how we collect, use, store, and protect information when you use our service at{" "}
          <a href="https://clientpulse.dev" className="text-blue-400 hover:text-blue-300">clientpulse.dev</a>.
          By using ClientPulse, you agree to the practices described in this policy.
        </p>

        <Section title="1. Information We Collect">
          <p>We collect only the minimum information necessary to provide our service:</p>
          <dl>
            <dt>Account information</dt>
            <dd>When you register, we collect your name, business name, and email address. Your password is hashed using bcrypt (12 rounds) and is never stored in plain text.</dd>
            <dt>Client submission data</dt>
            <dd>Information submitted through your intake forms — including client names, email addresses, phone numbers, and service requests — is collected on your behalf and encrypted at rest using AES-256-GCM before storage.</dd>
            <dt>Payment information</dt>
            <dd>All payment processing is handled exclusively by Stripe, Inc. We do not collect, store, or have access to your credit card number, billing address, or any other payment credentials. Please review{" "}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Stripe&apos;s Privacy Policy</a>{" "}for details on how they handle your payment data.</dd>
            <dt>Usage data</dt>
            <dd>We log authentication events (logins, logouts) and basic usage activity for security and audit purposes. We do not use third-party analytics tools or advertising trackers.</dd>
          </dl>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use the information we collect solely to:</p>
          <ul>
            <li>Provide, maintain, and improve the ClientPulse service</li>
            <li>Authenticate users and maintain secure sessions</li>
            <li>Send automated follow-up emails on your behalf to your clients</li>
            <li>Process subscription payments through Stripe</li>
            <li>Detect and prevent fraud, abuse, and security incidents</li>
            <li>Comply with applicable legal obligations</li>
          </ul>
          <p>We do not use your data or your clients&apos; data for advertising, profiling, or any purpose beyond delivering the service you have subscribed to.</p>
        </Section>

        <Section title="3. Data Security">
          <p>We apply industry-standard security measures to protect your data at every layer:</p>
          <ul>
            <li><strong>Encryption at rest:</strong> All personally identifiable client data (names, emails, phone numbers) is encrypted using AES-256-GCM with per-record keys derived via scrypt.</li>
            <li><strong>Encryption in transit:</strong> All data transmitted between your browser and our servers is encrypted via TLS 1.2 or higher.</li>
            <li><strong>Authentication security:</strong> Session tokens are cryptographically signed JWTs with a 2-hour expiration. Accounts are locked after 5 consecutive failed login attempts.</li>
            <li><strong>Application security:</strong> We follow OWASP Top 10 guidelines and apply input validation, rate limiting, and CSRF protections throughout the application.</li>
          </ul>
          <p>While we take every reasonable precaution, no system is completely immune to risk. We encourage you to use a strong, unique password and notify us immediately of any suspected unauthorised access.</p>
        </Section>

        <Section title="4. Data Sharing and Disclosure">
          <p>We do not sell, rent, lease, or trade your personal information or your clients&apos; data to any third party. We share information only in the following limited circumstances:</p>
          <ul>
            <li><strong>Stripe:</strong> Payment processing. Stripe receives only the information necessary to process your subscription.</li>
            <li><strong>Resend:</strong> Email delivery. When follow-up emails are sent on your behalf, your clients&apos; email addresses are transmitted to Resend solely for the purpose of delivering those emails.</li>
            <li><strong>Legal requirements:</strong> We may disclose information if required to do so by law, court order, or governmental authority, or if we believe disclosure is necessary to protect the rights, property, or safety of ClientPulse, our users, or others.</li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>We retain your account data and associated client submissions for as long as your account remains active. If you cancel your account:</p>
          <ul>
            <li>All personal data associated with your account is permanently deleted within 30 days of cancellation.</li>
            <li>Security audit logs are retained for 90 days for fraud prevention and legal compliance purposes, after which they are permanently purged.</li>
            <li>You may request immediate deletion at any time by contacting us at{" "}
              <a href="mailto:support@clientpulse.dev" className="text-blue-400 hover:text-blue-300">support@clientpulse.dev</a>.
            </li>
          </ul>
        </Section>

        <Section title="6. Your Rights">
          <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
          <dl>
            <dt>Right of Access</dt>
            <dd>You may request a copy of the personal data we hold about you.</dd>
            <dt>Right to Rectification</dt>
            <dd>You may request correction of any inaccurate or incomplete data.</dd>
            <dt>Right to Erasure</dt>
            <dd>You may request deletion of your personal data (&ldquo;right to be forgotten&rdquo;), subject to our legal obligations.</dd>
            <dt>Right to Data Portability</dt>
            <dd>You may request your data in a structured, machine-readable format.</dd>
            <dt>Right to Object</dt>
            <dd>You may object to certain types of processing, including direct marketing.</dd>
          </dl>
          <p>To exercise any of these rights, please contact us at{" "}
            <a href="mailto:support@clientpulse.dev" className="text-blue-400 hover:text-blue-300">support@clientpulse.dev</a>.
            We will respond to all verified requests within 30 days.
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>We use only strictly necessary cookies to operate the service. Specifically, we set a single authentication cookie (<code>cpulse_session</code>) that maintains your logged-in session. This cookie is:</p>
          <ul>
            <li>HTTP-only (not accessible to JavaScript)</li>
            <li>Secure (transmitted over HTTPS only)</li>
            <li>SameSite: Strict (not sent on cross-site requests)</li>
            <li>Automatically expired after 2 hours of inactivity</li>
          </ul>
          <p>We do not use advertising cookies, marketing pixels, or any third-party tracking technologies.</p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>ClientPulse is not directed at, and does not knowingly collect personal information from, individuals under the age of 16. If you believe a minor has provided us with personal information, please contact us and we will promptly delete it.</p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. When we make material changes, we will notify registered users by email at least 30 days before the changes take effect. The updated policy will always be available at this URL with a revised effective date. Your continued use of the service after the effective date constitutes your acceptance of the updated policy.</p>
        </Section>

        <Section title="10. Contact Us">
          <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
          <p>
            <strong className="text-slate-200">ClientPulse</strong><br />
            Email: <a href="mailto:support@clientpulse.dev" className="text-blue-400 hover:text-blue-300">support@clientpulse.dev</a><br />
            Website: <a href="https://clientpulse.dev" className="text-blue-400 hover:text-blue-300">clientpulse.dev</a>
          </p>
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold mb-4 text-white border-b border-slate-800 pb-2">{title}</h2>
      <div className="text-slate-400 text-sm leading-relaxed space-y-3 [&_p]:text-slate-400 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1.5 [&_li]:text-slate-400 [&_strong]:text-slate-200 [&_code]:text-blue-300 [&_code]:bg-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_dl]:space-y-3 [&_dt]:text-slate-200 [&_dt]:font-medium [&_dd]:ml-4 [&_dd]:text-slate-400">
        {children}
      </div>
    </div>
  );
}
