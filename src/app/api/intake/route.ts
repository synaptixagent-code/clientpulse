import { NextRequest, NextResponse } from 'next/server';
import { getDb, ensureSchema, str } from '@/lib/db';
import { encrypt } from '@/lib/crypto';
import { checkRateLimit, sanitizeString, validateEmail, validatePhone, getClientIp, auditLog, errorResponse } from '@/lib/security';
import { sendEmail } from '@/lib/email';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const { allowed } = await checkRateLimit(ip, 'intake');
    if (!allowed) return errorResponse(429);
  } catch { /* non-fatal */ }

  try {
    const body = await req.json();

    const businessId = sanitizeString(body.businessId || '');
    const clientName = sanitizeString(body.clientName || '');
    const clientEmail = sanitizeString(body.clientEmail || '').toLowerCase();
    const clientPhone = sanitizeString(body.clientPhone || '');
    const serviceRequested = sanitizeString(body.serviceRequested || '');
    const message = sanitizeString(body.message || '');

    if (!businessId) return errorResponse(400);
    if (!clientName || clientName.length < 2) return errorResponse(400);
    if (!validateEmail(clientEmail)) return errorResponse(400);
    if (clientPhone && !validatePhone(clientPhone)) return errorResponse(400);

    const encryptedEmail = encrypt(clientEmail);
    const encryptedPhone = clientPhone ? encrypt(clientPhone) : null;
    const encryptedName = encrypt(clientName);

    await ensureSchema();
    const db = getDb();

    // Resolve plan: look up business owner by businessId (user.id = businessId)
    let isPro = false;
    let planLimit = 50; // Starter default

    const ownerResult = await db.execute({
      sql: 'SELECT id, created_at FROM users WHERE id = ?',
      args: [businessId],
    });
    const owner = ownerResult.rows[0];

    if (owner) {
      const subResult = await db.execute({
        sql: "SELECT plan FROM subscriptions WHERE user_id = ? AND status = 'active'",
        args: [str(owner.id)],
      });
      const plan = str(subResult.rows[0]?.plan ?? '');
      const daysSinceSignup = (Date.now() - new Date(str(owner.created_at)).getTime()) / 86_400_000;
      const inTrial = !subResult.rows[0] && daysSinceSignup <= 7;

      isPro = plan === 'pro';
      // Trial users get Starter limits; unknown businessId falls through to 500 safety cap below
      planLimit = isPro ? 500 : 50;
      if (inTrial) planLimit = 50;
    } else {
      // Unknown businessId — apply a safety cap
      planLimit = 500;
    }

    const countResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM submissions WHERE business_id = ?',
      args: [businessId],
    });
    const submissionCount = Number(countResult.rows[0]?.count ?? 0);
    if (submissionCount >= planLimit) {
      return NextResponse.json({ error: 'Submission limit reached for this business.' }, { status: 403 });
    }

    const id = uuid();

    await db.execute({
      sql: `INSERT INTO submissions (id, business_id, client_name, client_email, client_phone, service_requested, message, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'form')`,
      args: [id, businessId, encryptedName, encryptedEmail, encryptedPhone, serviceRequested, message],
    });

    // Pro: 5-step sequence (Day 1, 3, 7, 14, 30). Starter: 3-step (Day 1, 3, 7).
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const starterFollowups = [
      { delay: 1 * DAY,  subject: 'Thanks for reaching out!',          body: "Hi {{name}}, thanks for contacting us about {{service}}. We'll be in touch soon." },
      { delay: 3 * DAY,  subject: 'Following up on your inquiry',       body: "Hi {{name}}, just checking in on your inquiry about {{service}}. Any questions?" },
      { delay: 7 * DAY,  subject: 'Still interested?',                  body: "Hi {{name}}, we noticed your inquiry about {{service}} is still open. Let us know if we can help." },
    ];
    const proFollowups = [
      ...starterFollowups,
      { delay: 14 * DAY, subject: "We'd still love to help",            body: "Hi {{name}}, two weeks since you reached out about {{service}}. Still here if you need us." },
      { delay: 30 * DAY, subject: 'One last check-in',                  body: "Hi {{name}}, one final follow-up on {{service}}. Reply anytime — we'll keep your inquiry on file." },
    ];
    const followups = isPro ? proFollowups : starterFollowups;

    for (const fu of followups) {
      await db.execute({
        sql: `INSERT INTO followups (id, submission_id, type, subject, body, scheduled_at, status)
              VALUES (?, ?, 'email', ?, ?, ?, 'pending')`,
        args: [uuid(), id, fu.subject, fu.body, new Date(now + fu.delay).toISOString()],
      });
    }

    // Pro users with a phone number also get SMS follow-ups (Day 1 + Day 7)
    if (isPro && encryptedPhone) {
      const smsFollowups = [
        {
          delay: 1 * DAY,
          subject: 'sms-day1',
          body: `Hi {{name}}! Thanks for reaching out about {{service}}. We received your inquiry and will be in touch shortly.`,
        },
        {
          delay: 7 * DAY,
          subject: 'sms-day7',
          body: `Hi {{name}}, just following up on your inquiry about {{service}}. Still interested? Reply to this message anytime!`,
        },
      ];

      for (const fu of smsFollowups) {
        await db.execute({
          sql: `INSERT INTO followups (id, submission_id, type, subject, body, scheduled_at, status)
                VALUES (?, ?, 'sms', ?, ?, ?, 'pending')`,
          args: [uuid(), id, fu.subject, fu.body, new Date(now + fu.delay).toISOString()],
        });
      }
    }

    auditLog({ action: 'intake_submission', resource: 'submissions', resourceId: id, ip, details: `business: ${businessId}` });

    // Notify business owner of new lead (fire and forget)
    if (owner) {
      const ownerEmailResult = await db.execute({
        sql: 'SELECT email FROM users WHERE id = ?',
        args: [str(owner.id)],
      });
      const ownerEmail = str(ownerEmailResult.rows[0]?.email ?? '');
      if (ownerEmail) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clientpulse.dev';
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#1e293b;border-radius:16px;overflow:hidden;">
  <tr><td style="background:#2563eb;padding:24px 32px;">
    <span style="color:#fff;font-size:16px;font-weight:700;">ClientPulse</span>
    <span style="color:#93c5fd;font-size:14px;margin-left:8px;">New Lead</span>
  </td></tr>
  <tr><td style="padding:32px;">
    <h2 style="margin:0 0 4px;color:#f1f5f9;font-size:20px;font-weight:700;">You have a new lead!</h2>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;">Someone just filled out your intake form.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;padding:20px;margin-bottom:24px;">
      <tr><td style="padding:4px 0;"><span style="color:#64748b;font-size:13px;">Name</span><br/><span style="color:#e2e8f0;font-size:14px;font-weight:600;">${clientName}</span></td></tr>
      <tr><td style="padding:8px 0 4px;border-top:1px solid #1e293b;margin-top:8px;"><span style="color:#64748b;font-size:13px;">Email</span><br/><span style="color:#e2e8f0;font-size:14px;">${clientEmail}</span></td></tr>
      ${clientPhone ? `<tr><td style="padding:8px 0 4px;border-top:1px solid #1e293b;"><span style="color:#64748b;font-size:13px;">Phone</span><br/><span style="color:#e2e8f0;font-size:14px;">${clientPhone}</span></td></tr>` : ''}
      ${serviceRequested ? `<tr><td style="padding:8px 0 4px;border-top:1px solid #1e293b;"><span style="color:#64748b;font-size:13px;">Service</span><br/><span style="color:#e2e8f0;font-size:14px;">${serviceRequested}</span></td></tr>` : ''}
      ${message ? `<tr><td style="padding:8px 0 4px;border-top:1px solid #1e293b;"><span style="color:#64748b;font-size:13px;">Message</span><br/><span style="color:#e2e8f0;font-size:14px;">${message}</span></td></tr>` : ''}
    </table>
    <table cellpadding="0" cellspacing="0"><tr><td style="background:#2563eb;border-radius:10px;">
      <a href="${appUrl}/admin" style="display:inline-block;padding:12px 24px;color:#fff;font-size:14px;font-weight:600;text-decoration:none;">View in Dashboard →</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:16px 32px;border-top:1px solid #334155;">
    <p style="margin:0;color:#475569;font-size:12px;">Automated follow-ups have been scheduled for this lead.</p>
  </td></tr>
</table></td></tr></table></body></html>`;

        sendEmail({
          to: ownerEmail,
          subject: `New lead: ${clientName}`,
          html,
        }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, id });
  } catch {
    return errorResponse(500);
  }
}
