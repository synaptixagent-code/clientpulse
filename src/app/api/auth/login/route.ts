import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, createSession, setSessionCookie, checkAccountLock, recordFailedLogin, resetFailedLogins } from '@/lib/auth';
import { checkRateLimit, validateEmail, sanitizeString, getClientIp, auditLog, checkSuspiciousActivity, sendTelegramAlert, errorResponse } from '@/lib/security';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  const { allowed } = checkRateLimit(ip, 'login');
  if (!allowed) {
    auditLog({ action: 'login_rate_limited', ip, userAgent: req.headers.get('user-agent') || '' });
    return errorResponse(429);
  }

  try {
    const body = await req.json();
    const email = sanitizeString(body.email || '').toLowerCase();
    const password = body.password || '';

    if (!validateEmail(email) || !password) return errorResponse(400);

    // Check account lockout
    const lock = checkAccountLock(email);
    if (lock.locked) {
      auditLog({ action: 'login_locked', ip, details: `Account locked for ${lock.minutesRemaining}m`, userAgent: req.headers.get('user-agent') || '' });
      return NextResponse.json({ error: `Account locked. Try again in ${lock.minutesRemaining} minutes.` }, { status: 423 });
    }

    const db = getDb();
    const user = db.prepare('SELECT id, email, password_hash, role FROM users WHERE email = ?').get(email) as { id: string; email: string; password_hash: string; role: string } | undefined;

    if (!user || !verifyPassword(password, user.password_hash)) {
      recordFailedLogin(email);
      auditLog({ action: 'login_failed', ip, details: `email: ${email}`, userAgent: req.headers.get('user-agent') || '' });

      // Check for suspicious burst
      if (checkSuspiciousActivity(ip)) {
        await sendTelegramAlert(`🚨 *Security Alert*\n\nSuspicious login activity from IP \`${ip}\`\n10+ failed attempts in 5 minutes.`);
      }

      return errorResponse(401);
    }

    resetFailedLogins(email);
    const token = await createSession(user.id);
    const cookie = setSessionCookie(token);

    auditLog({ userId: user.id, action: 'login_success', ip, userAgent: req.headers.get('user-agent') || '' });

    const response = NextResponse.json({ success: true, role: user.role });
    response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2]);
    return response;
  } catch {
    return errorResponse(500);
  }
}
