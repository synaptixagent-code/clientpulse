import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getDb, ensureSchema, str, num } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { validatePassword, sanitizeString, errorResponse } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = sanitizeString(body.token || '');
    const password = body.password || '';

    if (!token) return errorResponse(400);

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.message }, { status: 400 });
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');
    await ensureSchema();
    const db = getDb();

    const result = await db.execute({
      sql: 'SELECT id, user_id, expires_at, used FROM password_reset_tokens WHERE token_hash = ?',
      args: [tokenHash],
    });
    const record = result.rows[0];

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
    }

    if (num(record.used)) {
      return NextResponse.json({ error: 'This reset link has already been used.' }, { status: 400 });
    }

    if (new Date(str(record.expires_at)) < new Date()) {
      return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);
    await db.execute({
      sql: "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
      args: [passwordHash, str(record.user_id)],
    });
    await db.execute({
      sql: 'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
      args: [str(record.id)],
    });
    await db.execute({
      sql: 'DELETE FROM sessions WHERE user_id = ?',
      args: [str(record.user_id)],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[reset-password]', err);
    return errorResponse(500);
  }
}
