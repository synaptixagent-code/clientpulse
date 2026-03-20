import { NextRequest, NextResponse } from 'next/server';
import { getDb, ensureSchema, str } from '@/lib/db';
import { verifyPassword, createSession, setSessionCookie, checkAccountLock, recordFailedLogin, resetFailedLogins } from '@/lib/auth';
import { checkRateLimit, validateEmail, sanitizeString, getClientIp, auditLog, checkSuspiciousActivity, sendTelegramAlert, errorResponse } from '@/lib/security';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const { allowed } = await checkRateLimit(ip, 'login');
    if (!allowed) return errorResponse(429);
  } catch { /* non-fatal */ }

  try {
    const body = await req.json();
    const email = sanitizeString(body.email || '').toLowerCase();
    const password = body.password || '';

    if (!validateEmail(email) || !password) return errorResponse(400);

    const lock = await checkAccountLock(email);
    if (lock.locked) {
      auditLog({ action: 'login_locked', ip, details: `Account locked for ${lock.minutesRemaining}m`, userAgent: req.headers.get('user-agent') || '' });
      return NextResponse.json({ error: `Account locked. Try again in ${lock.minutesRemaining} minutes.` }, { status: 423 });
    }

    await ensureSchema();
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT id, email, password_hash, role FROM users WHERE email = ?',
      args: [email],
    });
    const user = result.rows[0];

    if (!user || !verifyPassword(password, str(user.password_hash))) {
      await recordFailedLogin(email);
      auditLog({ action: 'login_failed', ip, details: `email: ${email}`, userAgent: req.headers.get('user-agent') || '' });

      if (await checkSuspiciousActivity(ip)) {
        await sendTelegramAlert(`🚨 *Security Alert*\n\nSuspicious login activity from IP \`${ip}\`\n10+ failed attempts in 5 minutes.`);
      }

      return errorResponse(401);
    }

    await resetFailedLogins(email);
    const token = await createSession(str(user.id));
    const cookie = setSessionCookie(token);

    auditLog({ userId: str(user.id), action: 'login_success', ip, userAgent: req.headers.get('user-agent') || '' });

    const response = NextResponse.json({ success: true, role: str(user.role) });
    response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2]);
    return response;
  } catch {
    return errorResponse(500);
  }
}
