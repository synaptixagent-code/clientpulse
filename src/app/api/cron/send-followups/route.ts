/**
 * Vercel Cron Job — runs every hour.
 * Finds pending follow-up emails that are due, sends them via Resend,
 * and logs results to the email_logs table.
 *
 * Schedule: "0 * * * *" (top of every hour) — configured in vercel.json
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import { sendEmail } from '@/lib/email';
import { getTemplate } from '@/lib/email-templates';

interface FollowupRow {
  id: string;
  submission_id: string;
  subject: string;
  body: string;
  scheduled_at: string;
  sequence_index: number;
}

interface SubmissionRow {
  id: string;
  business_id: string;
  client_name: string;
  client_email: string;
  service_requested: string | null;
}

export async function GET(req: NextRequest) {
  // Verify this is a legitimate Vercel cron request
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const results = { sent: 0, failed: 0, skipped: 0, errors: [] as string[] };

  try {
    const db = getDb();

    // Fetch all pending follow-ups that are due now
    const due = db.prepare(`
      SELECT
        f.id,
        f.submission_id,
        f.subject,
        f.body,
        f.scheduled_at,
        ROW_NUMBER() OVER (PARTITION BY f.submission_id ORDER BY f.scheduled_at) - 1 AS sequence_index
      FROM followups f
      WHERE f.status = 'pending'
        AND f.scheduled_at <= datetime('now')
      ORDER BY f.scheduled_at ASC
      LIMIT 50
    `).all() as FollowupRow[];

    for (const followup of due) {
      let submission: SubmissionRow | undefined;

      try {
        submission = db.prepare(`
          SELECT id, business_id, client_name, client_email, service_requested
          FROM submissions WHERE id = ?
        `).get(followup.submission_id) as SubmissionRow | undefined;
      } catch {
        results.skipped++;
        continue;
      }

      if (!submission) {
        // Submission deleted — mark followup as cancelled
        db.prepare(`UPDATE followups SET status = 'cancelled' WHERE id = ?`).run(followup.id);
        results.skipped++;
        continue;
      }

      // Decrypt sensitive fields
      let clientName: string;
      let clientEmail: string;

      try {
        clientName = decrypt(submission.client_name);
        clientEmail = decrypt(submission.client_email);
      } catch {
        results.skipped++;
        continue;
      }

      // Build HTML email from template
      const html = getTemplate(followup.sequence_index, {
        clientName,
        serviceRequested: submission.service_requested || undefined,
        businessName: submission.business_id,
      });

      // Send via Resend
      const result = await sendEmail({
        to: clientEmail,
        subject: followup.subject,
        html,
      });

      const now = new Date().toISOString();

      if (result.ok) {
        // Mark as sent
        db.prepare(`
          UPDATE followups SET status = 'sent', sent_at = ? WHERE id = ?
        `).run(now, followup.id);

        // Log success
        db.prepare(`
          INSERT INTO email_logs (followup_id, submission_id, business_id, to_email, subject, status, resend_id)
          VALUES (?, ?, ?, ?, ?, 'sent', ?)
        `).run(followup.id, submission.id, submission.business_id, clientEmail, followup.subject, result.id ?? null);

        results.sent++;
      } else {
        // Mark as failed
        db.prepare(`
          UPDATE followups SET status = 'failed' WHERE id = ?
        `).run(followup.id);

        // Log failure
        db.prepare(`
          INSERT INTO email_logs (followup_id, submission_id, business_id, to_email, subject, status, error)
          VALUES (?, ?, ?, ?, ?, 'failed', ?)
        `).run(followup.id, submission.id, submission.business_id, clientEmail, followup.subject, result.error ?? 'Unknown error');

        results.failed++;
        results.errors.push(`[${followup.id}] ${result.error}`);
      }
    }

    console.log(`[cron:send-followups] sent=${results.sent} failed=${results.failed} skipped=${results.skipped}`);
    return NextResponse.json({ ok: true, ...results });

  } catch (err) {
    console.error('[cron:send-followups] Fatal error:', String(err));
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
