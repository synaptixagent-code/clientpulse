import { NextRequest, NextResponse } from 'next/server';
import { getDb, ensureSchema, str } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import { getClientIp, auditLog, errorResponse } from '@/lib/security';

const VALID_STATUSES = ['new', 'contacted', 'closed'];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return errorResponse(401);

    const { id } = await params;
    const body = await req.json();
    const status = body.status as string;

    if (!id || !status || !VALID_STATUSES.includes(status)) return errorResponse(400);

    await ensureSchema();
    const db = getDb();

    const userResult = await db.execute({
      sql: 'SELECT role FROM users WHERE id = ?',
      args: [session.userId],
    });
    const user = userResult.rows[0];
    if (!user || str(user.role) !== 'admin') return errorResponse(403);

    const result = await db.execute({
      sql: "UPDATE submissions SET status = ?, updated_at = datetime('now') WHERE id = ? AND business_id = ?",
      args: [status, id, session.userId],
    });

    if (result.rowsAffected === 0) return errorResponse(404);

    auditLog({ userId: session.userId, action: 'update_submission_status', resource: 'submissions', resourceId: id, ip: getClientIp(req), details: `status: ${status}` });

    return NextResponse.json({ success: true });
  } catch {
    return errorResponse(500);
  }
}
