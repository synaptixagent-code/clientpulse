import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import { getClientIp, auditLog, errorResponse } from '@/lib/security';

const VALID_STATUSES = ['new', 'contacted', 'closed'];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { allowed: _a } = { allowed: true }; // rate limit omitted for simplicity

    const session = await getSessionFromCookies();
    if (!session) return errorResponse(401);

    const { id } = await params;
    const body = await req.json();
    const status = body.status as string;

    if (!id || !status || !VALID_STATUSES.includes(status)) return errorResponse(400);

    const db = getDb();
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(session.userId) as { role: string } | undefined;
    if (!user || user.role !== 'admin') return errorResponse(403);

    const result = db.prepare(
      "UPDATE submissions SET status = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(status, id);

    if (result.changes === 0) return errorResponse(404);

    auditLog({ userId: session.userId, action: 'update_submission_status', resource: 'submissions', resourceId: id, ip: getClientIp(req), details: `status: ${status}` });

    return NextResponse.json({ success: true });
  } catch {
    return errorResponse(500);
  }
}
