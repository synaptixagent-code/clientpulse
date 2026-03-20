export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-900 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-blue-400 text-sm hover:text-blue-300 transition">&larr; Back to home</a>

        <h1 className="text-3xl font-bold mt-6 mb-2 text-white">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-2">Effective date: March 17, 2026</p>
        <p className="text-slate-400 text-sm leading-relaxed mb-10">
          Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using ClientPulse, operated by ClientPulse (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) at{" "}
          <a href="https://clientpulse.dev" className="text-blue-400 hover:text-blue-300">clientpulse.dev</a>.
          By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, you must not use the Service.
        </p>

        <Section title="1. Description of Service">
          <p>ClientPulse is a web-based platform that enables service businesses to create client intake forms, capture lead information, and send automated follow-up emails. The Service includes a client-facing intake form, an admin dashboard, automated email delivery, and subscription billing management.</p>
        </Section>

        <Section title="2. Eligibility and Account Registration">
          <p>You must be at least 18 years of age and capable of forming a legally binding contract to use the Service. By registering, you represent that all information you provide is accurate, current, and complete.</p>
          <p>You are solely responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately at <a href="mailto:support@clientpulse.dev" className="text-blue-400 hover:text-blue-300">support@clientpulse.dev</a> if you suspect any unauthorised access to your account.</p>
          <p>We reserve the right to suspend or terminate accounts that provide false or misleading information, or that violate these Terms.</p>
        </Section>

        <Section title="3. Free Trial and Subscription">
          <p>We offer a 7-day free trial upon registration. No charge is made during the trial period, but a valid payment method is required to begin.</p>
          <p>After the trial period ends, continued access to the Service requires an active paid subscription. Subscriptions are billed on a monthly basis through our payment processor, Stripe. By subscribing, you authorise us to charge your payment method at the applicable rate at the start of each billing cycle.</p>
          <p>You may cancel your subscription at any time from your account dashboard. Cancellation takes effect at the end of the current billing period; you will retain access to the Service until that date. We do not provide pro-rated refunds for partial billing periods unless required by applicable law.</p>
        </Section>

        <Section title="4. Refund Policy">
          <p>We offer a 30-day money-back guarantee from the date of your first paid charge. If you are not satisfied with the Service for any reason, contact us at <a href="mailto:support@clientpulse.dev" className="text-blue-400 hover:text-blue-300">support@clientpulse.dev</a> within 30 days and we will issue a full refund. After 30 days, subscription charges are non-refundable.</p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You must not use the Service to:</p>
          <ul>
            <li>Send unsolicited commercial communications (spam) or conduct phishing activities;</li>
            <li>Collect or process data in violation of applicable privacy laws, including GDPR and CAN-SPAM;</li>
            <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity;</li>
            <li>Upload or transmit malicious code, viruses, or any content that is harmful, offensive, or illegal;</li>
            <li>Attempt to gain unauthorised access to any part of the Service or its underlying systems;</li>
            <li>Resell, sublicense, or otherwise commercially exploit the Service without our express written consent.</li>
          </ul>
          <p>We reserve the right to suspend or terminate your account without notice if you engage in any prohibited conduct.</p>
        </Section>

        <Section title="6. Your Data and Content">
          <p>You retain full ownership of all data you submit to the Service, including client information collected through intake forms (&ldquo;Your Content&rdquo;). By using the Service, you grant us a limited, non-exclusive licence to process, store, and transmit Your Content solely as necessary to provide the Service.</p>
          <p>We do not sell, rent, or share Your Content with third parties, except as described in our <a href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a> (e.g., payment processing through Stripe, email delivery through Resend).</p>
          <p>You are solely responsible for ensuring that Your Content complies with all applicable laws and that you have obtained any necessary consents from individuals whose data you collect through the Service.</p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>The Service, including its software, design, trademarks, and content, is owned by or licensed to ClientPulse and is protected by applicable intellectual property laws. Nothing in these Terms grants you any right to use our trademarks, logos, or brand features without our prior written consent.</p>
          <p>We grant you a limited, non-exclusive, non-transferable licence to access and use the Service for your internal business purposes in accordance with these Terms.</p>
        </Section>

        <Section title="8. Service Availability and Modifications">
          <p>We strive to maintain high availability of the Service but do not guarantee uninterrupted or error-free operation. We may perform scheduled or emergency maintenance that temporarily affects availability. We will endeavour to provide advance notice of planned maintenance where practicable.</p>
          <p>We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time. Where we make material changes that negatively affect your use of the Service, we will provide at least 30 days&apos; notice by email.</p>
        </Section>

        <Section title="9. Disclaimer of Warranties">
          <p>The Service is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without warranty of any kind, whether express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the Service will meet your specific requirements or that it will be free from defects, errors, or security vulnerabilities.</p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>To the maximum extent permitted by applicable law, ClientPulse shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, arising from your use of or inability to use the Service.</p>
          <p>Our total aggregate liability to you for any claims arising under or related to these Terms shall not exceed the total amount you paid to us for the Service in the twelve (12) months immediately preceding the event giving rise to the claim.</p>
        </Section>

        <Section title="11. Indemnification">
          <p>You agree to indemnify, defend, and hold harmless ClientPulse and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or related to your use of the Service, Your Content, your violation of these Terms, or your violation of any third-party rights.</p>
        </Section>

        <Section title="12. Governing Law">
          <p>These Terms are governed by and construed in accordance with applicable law. Any disputes arising under these Terms shall be resolved through good-faith negotiation in the first instance. If a dispute cannot be resolved informally, it shall be submitted to binding arbitration in accordance with applicable rules, except that either party may seek injunctive or equitable relief in a court of competent jurisdiction.</p>
        </Section>

        <Section title="13. Changes to These Terms">
          <p>We may update these Terms from time to time. When we make material changes, we will notify registered users by email at least 30 days before the changes take effect and update the effective date above. Your continued use of the Service after the effective date constitutes your acceptance of the revised Terms. If you do not agree to the revised Terms, you must stop using the Service before they take effect.</p>
        </Section>

        <Section title="14. Contact Us">
          <p>If you have any questions or concerns about these Terms, please contact us:</p>
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
      <div className="text-slate-400 text-sm leading-relaxed space-y-3 [&_p]:text-slate-400 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1.5 [&_li]:text-slate-400 [&_strong]:text-slate-200">
        {children}
      </div>
    </div>
  );
}
