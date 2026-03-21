import { NextRequest, NextResponse } from 'next/server';
import { getDb, ensureSchema, str, num } from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import { sendEmail } from '@/lib/email';
import { getTemplate, type BrandingVars } from '@/lib/email-templates';
import { sendSms } from '@/lib/sms';
import { getUnsubscribeUrl } from '@/lib/unsubscribe';

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { sent: 0, failed: 0, skipped: 0, errors: [] as string[] };

  try {
    await ensureSchema();
    const db = getDb();

    const dueResult = await db.execute({
      sql: `SELECT
              f.id,
              f.submission_id,
              f.type,
              f.subject,
              f.body,
              f.scheduled_at,
              ROW_NUMBER() OVER (PARTITION BY f.submission_id ORDER BY f.scheduled_at) - 1 AS sequence_index
            FROM followups f
            WHERE f.status = 'pending'
              AND f.scheduled_at <= datetime('now')
            ORDER BY f.scheduled_at ASC
            LIMIT 50`,
      args: [],
    });

    for (const followup of dueResult.rows) {
      let submissionRow;

      try {
        const subResult = await db.execute({
          sql: 'SELECT id, business_id, client_name, client_email, client_phone, service_requested, unsubscribed FROM submissions WHERE id = ?',
          args: [str(followup.submission_id)],
        });
        submissionRow = subResult.rows[0];
      } catch {
        results.skipped++;
        continue;
      }

      if (!submissionRow) {
        await db.execute({
          sql: "UPDATE followups SET status = 'cancelled' WHERE id = ?",
          args: [str(followup.id)],
        });
        results.skipped++;
        continue;
      }

      if (Number(submissionRow.unsubscribed)) {
        await db.execute({
          sql: "UPDATE followups SET status = 'cancelled' WHERE id = ?",
          args: [str(followup.id)],
        });
        results.skipped++;
        continue;
      }

      let clientName: string;
      let clientEmail: string;

      try {
        clientName = decrypt(str(submissionRow.client_name));
        clientEmail = decrypt(str(submissionRow.client_email));
      } catch {
        results.skipped++;
        continue;
      }

      // Look up branding for this business
      let branding: BrandingVars | undefined;
      try {
        const brandResult = await db.execute({
          sql: 'SELECT company_name, reply_email, brand_color, footer_text FROM branding WHERE user_id = ?',
          args: [str(submissionRow.business_id)],
        });
        if (brandResult.rows[0]) {
          const b = brandResult.rows[0];
          branding = {
            companyName: str(b.company_name) || undefined,
            replyEmail:  str(b.reply_email)  || undefined,
            brandColor:  str(b.brand_color)  || undefined,
            footerText:  str(b.footer_text)  || undefined,
          };
        }
      } catch { /* non-fatal */ }

      const followupType = str(followup.type) || 'email';

      if (followupType === 'sms') {
        // Decrypt phone number
        let clientPhone: string;
        try {
          const rawPhone = str(submissionRow.client_phone);
          if (!rawPhone) { results.skipped++; continue; }
          clientPhone = decrypt(rawPhone);
        } catch {
          results.skipped++;
          continue;
        }

        // Replace template variables in SMS body
        const smsBody = str(followup.body)
          .replace(/\{\{name\}\}/g, clientName)
          .replace(/\{\{service\}\}/g, str(submissionRow.service_requested) || 'our services');

        const smsResult = await sendSms({ to: clientPhone, body: smsBody });
        const now = new Date().toISOString();

        if (smsResult.ok) {
          await db.execute({
            sql: "UPDATE followups SET status = 'sent', sent_at = ? WHERE id = ?",
            args: [now, str(followup.id)],
          });
          await db.execute({
            sql: `INSERT INTO sms_logs (followup_id, submission_id, business_id, to_phone, body, status, twilio_sid)
                  VALUES (?, ?, ?, ?, ?, 'sent', ?)`,
            args: [str(followup.id), str(submissionRow.id), str(submissionRow.business_id), clientPhone, smsBody, smsResult.sid ?? null],
          });
          results.sent++;
        } else {
          await db.execute({
            sql: "UPDATE followups SET status = 'failed' WHERE id = ?",
            args: [str(followup.id)],
          });
          await db.execute({
            sql: `INSERT INTO sms_logs (followup_id, submission_id, business_id, to_phone, body, status, error)
                  VALUES (?, ?, ?, ?, ?, 'failed', ?)`,
            args: [str(followup.id), str(submissionRow.id), str(submissionRow.business_id), clientPhone, smsBody, smsResult.error ?? 'Unknown error'],
          });
          results.failed++;
          results.errors.push(`[SMS ${str(followup.id)}] ${smsResult.error}`);
        }
        continue; // Skip email path for SMS followups
      }

      const unsubscribeUrl = getUnsubscribeUrl(str(submissionRow.id));

      const html = getTemplate(num(followup.sequence_index), {
        clientName,
        serviceRequested: submissionRow.service_requested ? str(submissionRow.service_requested) : undefined,
        businessName: str(submissionRow.business_id),
        unsubscribeUrl,
      }, branding);

      const result = await sendEmail({
        to: clientEmail,
        subject: str(followup.subject),
        html,
        unsubscribeUrl,
      });

      const now = new Date().toISOString();

      if (result.ok) {
        await db.execute({
          sql: "UPDATE followups SET status = 'sent', sent_at = ? WHERE id = ?",
          args: [now, str(followup.id)],
        });
        await db.execute({
          sql: `INSERT INTO email_logs (followup_id, submission_id, business_id, to_email, subject, status, resend_id)
                VALUES (?, ?, ?, ?, ?, 'sent', ?)`,
          args: [str(followup.id), str(submissionRow.id), str(submissionRow.business_id), clientEmail, str(followup.subject), result.id ?? null],
        });
        results.sent++;
      } else {
        await db.execute({
          sql: "UPDATE followups SET status = 'failed' WHERE id = ?",
          args: [str(followup.id)],
        });
        await db.execute({
          sql: `INSERT INTO email_logs (followup_id, submission_id, business_id, to_email, subject, status, error)
                VALUES (?, ?, ?, ?, ?, 'failed', ?)`,
          args: [str(followup.id), str(submissionRow.id), str(submissionRow.business_id), clientEmail, str(followup.subject), result.error ?? 'Unknown error'],
        });
        results.failed++;
        results.errors.push(`[${str(followup.id)}] ${result.error}`);
      }
    }

    console.log(`[cron:send-followups] sent=${results.sent} failed=${results.failed} skipped=${results.skipped}`);
    return NextResponse.json({ ok: true, ...results });

  } catch (err) {
    console.error('[cron:send-followups] Fatal error:', String(err));
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
