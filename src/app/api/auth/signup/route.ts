import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, createSession, setSessionCookie } from '@/lib/auth';
import { checkRateLimit, validateEmail, validatePassword, sanitizeString, getClientIp, auditLog, errorResponse } from '@/lib/security';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const { allowed } = checkRateLimit(ip, 'signup');
    if (!allowed) return errorResponse(429);
  } catch { /* non-fatal if SQLite unavailable */ }

  try {
    const body = await req.json();
    const email = sanitizeString(body.email || '').toLowerCase();
    const name = sanitizeString(body.name || '');
    const password = body.password || '';

    if (!validateEmail(email)) return errorResponse(400, 'Invalid email');
    if (!name || name.length < 2) return errorResponse(400, 'Name required');

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) return NextResponse.json({ error: pwCheck.message }, { status: 400 });

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return errorResponse(400, 'Email already registered');

    const userId = uuid();
    const passwordHash = hashPassword(password);

    db.prepare('INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)').run(userId, email, passwordHash, name, 'admin');

    const token = await createSession(userId);
    const cookie = setSessionCookie(token);

    auditLog({ userId, action: 'signup', ip, userAgent: req.headers.get('user-agent') || '' });

    const response = NextResponse.json({ success: true, userId });
    response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2]);
    return response;
  } catch {
    return errorResponse(500);
  }
}
