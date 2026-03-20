/**
 * Email sender via Resend REST API.
 * Uses fetch directly — the Resend SDK has the same connection issues
 * as the Stripe SDK in Vercel's serverless environment.
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

interface ResendResponse {
  id?: string;
  statusCode?: number;
  message?: string;
  name?: string;
}

const FROM = process.env.RESEND_FROM_EMAIL || 'ClientPulse <onboarding@resend.dev>';
const RESEND_API = 'https://api.resend.com/emails';

export async function sendEmail(opts: SendEmailOptions): Promise<{ ok: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: 'RESEND_API_KEY not set' };

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });

    const data = await res.json() as ResendResponse;

    if (!res.ok) {
      return { ok: false, error: data.message || `HTTP ${res.status}` };
    }

    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
