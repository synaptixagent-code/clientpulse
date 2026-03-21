import { NextRequest, NextResponse } from 'next/server';
import { getDb, ensureSchema, str } from '@/lib/db';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe';
import { auditLog } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const submissionId = String(body.id || '').trim();
    const token = String(body.token || '').trim();

    if (!submissionId || !token) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (!verifyUnsubscribeToken(submissionId, token)) {
      return NextResponse.json({ error: 'Invalid unsubscribe link' }, { status: 403 });
    }

    await ensureSchema();
    const db = getDb();

    const result = await db.execute({
      sql: 'SELECT id, business_id FROM submissions WHERE id = ?',
      args: [submissionId],
    });

    if (!result.rows[0]) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    await db.execute({
      sql: 'UPDATE submissions SET unsubscribed = 1 WHERE id = ?',
      args: [submissionId],
    });

    await db.execute({
      sql: "UPDATE followups SET status = 'cancelled' WHERE submission_id = ? AND status = 'pending'",
      args: [submissionId],
    });

    auditLog({
      action: 'unsubscribe',
      resource: 'submissions',
      resourceId: submissionId,
      details: `business: ${str(result.rows[0].business_id)}`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
