import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import { getSessionFromCookies } from '@/lib/auth';
import { checkRateLimit, getClientIp, auditLog, errorResponse } from '@/lib/security';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  try {
    const { allowed } = checkRateLimit(ip, 'api');
    if (!allowed) return errorResponse(429);
  } catch { /* non-fatal */ }

  const session = await getSessionFromCookies();
  if (!session) return errorResponse(401);

  try {
    const db = getDb();
    const user = db.prepare('SELECT role, created_at FROM users WHERE id = ?').get(session.userId) as { role: string; created_at: string } | undefined;
    if (!user || user.role !== 'admin') return errorResponse(403);

    // Trial enforcement: 7 days from signup, unless active subscription exists
    const subscription = db.prepare(
      "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active'"
    ).get(session.userId);
    if (!subscription) {
      const daysSinceSignup = (Date.now() - new Date(user.created_at).getTime()) / 86_400_000;
      if (daysSinceSignup > 7) {
        return NextResponse.json({ error: 'trial_expired' }, { status: 402 });
      }
    }

    const submissions = db.prepare(`
      SELECT s.*, COUNT(f.id) as followup_count,
        SUM(CASE WHEN f.status = 'sent' THEN 1 ELSE 0 END) as followups_sent
      FROM submissions s
      LEFT JOIN followups f ON f.submission_id = s.id
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT 100
    `).all() as Array<{
      id: string; business_id: string; client_name: string; client_email: string;
      client_phone: string | null; service_requested: string; message: string;
      status: string; created_at: string; followup_count: number; followups_sent: number;
    }>;

    // Decrypt sensitive fields for display
    const decrypted = submissions.map(s => {
      try {
        return {
          ...s,
          client_name: s.client_name.includes(':') ? decrypt(s.client_name) : s.client_name,
          client_email: s.client_email.includes(':') ? decrypt(s.client_email) : s.client_email,
          client_phone: s.client_phone && s.client_phone.includes(':') ? decrypt(s.client_phone) : s.client_phone,
        };
      } catch {
        return { ...s, client_name: '[encrypted]', client_email: '[encrypted]', client_phone: '[encrypted]' };
      }
    });

    auditLog({ userId: session.userId, action: 'view_submissions', ip });

    return NextResponse.json({ submissions: decrypted });
  } catch {
    return errorResponse(500);
  }
}
