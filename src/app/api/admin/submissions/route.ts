import { NextRequest, NextResponse } from 'next/server';
import { getDb, ensureSchema, str, num } from '@/lib/db';
import { decrypt } from '@/lib/crypto';
import { getSessionFromCookies } from '@/lib/auth';
import { checkRateLimit, getClientIp, auditLog, errorResponse } from '@/lib/security';

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  try {
    const { allowed } = await checkRateLimit(ip, 'api');
    if (!allowed) return errorResponse(429);
  } catch { /* non-fatal */ }

  const session = await getSessionFromCookies();
  if (!session) return errorResponse(401);

  try {
    await ensureSchema();
    const db = getDb();

    const userResult = await db.execute({
      sql: 'SELECT role, created_at FROM users WHERE id = ?',
      args: [session.userId],
    });
    const user = userResult.rows[0];
    if (!user || str(user.role) !== 'admin') return errorResponse(403);

    const subResult = await db.execute({
      sql: "SELECT plan FROM subscriptions WHERE user_id = ? AND status = 'active'",
      args: [session.userId],
    });
    const activePlan = str(subResult.rows[0]?.plan ?? '');
    const daysSinceSignup = (Date.now() - new Date(str(user.created_at)).getTime()) / 86_400_000;

    if (!subResult.rows[0]) {
      if (daysSinceSignup > 7) {
        return NextResponse.json({ error: 'trial_expired' }, { status: 402 });
      }
    }

    const isPro = activePlan === 'pro';
    const planLimit = isPro ? 500 : 50;
    const planName = activePlan || (daysSinceSignup <= 7 ? 'trial' : 'none');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clientpulse.dev';
    const intakeUrl = `${appUrl}/intake?businessId=${session.userId}`;

    const submissionsResult = await db.execute({
      sql: `SELECT s.id, s.business_id, s.client_name, s.client_email, s.client_phone,
              s.service_requested, s.message, s.status, s.created_at,
              COUNT(f.id) as followup_count,
              SUM(CASE WHEN f.status = 'sent' THEN 1 ELSE 0 END) as followups_sent
            FROM submissions s
            LEFT JOIN followups f ON f.submission_id = s.id
            GROUP BY s.id
            ORDER BY s.created_at DESC
            LIMIT 100`,
      args: [],
    });

    const decrypted = submissionsResult.rows.map(s => {
      try {
        const name = str(s.client_name);
        const email = str(s.client_email);
        const phone = s.client_phone ? str(s.client_phone) : null;
        return {
          id: str(s.id),
          business_id: str(s.business_id),
          client_name: name.includes(':') ? decrypt(name) : name,
          client_email: email.includes(':') ? decrypt(email) : email,
          client_phone: phone && phone.includes(':') ? decrypt(phone) : phone,
          service_requested: str(s.service_requested),
          message: str(s.message),
          status: str(s.status),
          created_at: str(s.created_at),
          followup_count: num(s.followup_count),
          followups_sent: num(s.followups_sent),
        };
      } catch {
        return {
          id: str(s.id),
          business_id: str(s.business_id),
          client_name: '[encrypted]',
          client_email: '[encrypted]',
          client_phone: '[encrypted]',
          service_requested: str(s.service_requested),
          message: str(s.message),
          status: str(s.status),
          created_at: str(s.created_at),
          followup_count: num(s.followup_count),
          followups_sent: num(s.followups_sent),
        };
      }
    });

    auditLog({ userId: session.userId, action: 'view_submissions', ip });

    return NextResponse.json({
      submissions: decrypted,
      plan: {
        name: planName,
        limit: planLimit,
        used: decrypted.length,
        intakeUrl,
      },
    });
  } catch {
    return errorResponse(500);
  }
}
