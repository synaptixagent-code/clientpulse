import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { validatePassword, sanitizeString, errorResponse } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token    = sanitizeString(body.token || '');
    const password = body.password || '';

    if (!token) return errorResponse(400);

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.message }, { status: 400 });
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');
    const db = getDb();

    const record = db.prepare(`
      SELECT id, user_id, expires_at, used
      FROM password_reset_tokens
      WHERE token_hash = ?
    `).get(tokenHash) as { id: string; user_id: string; expires_at: string; used: number } | undefined;

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
    }

    if (record.used) {
      return NextResponse.json({ error: 'This reset link has already been used.' }, { status: 400 });
    }

    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
    }

    // Update password and mark token as used
    const passwordHash = hashPassword(password);
    db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?")
      .run(passwordHash, record.user_id);
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?')
      .run(record.id);

    // Invalidate all active sessions for this user
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(record.user_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[reset-password]', err);
    return errorResponse(500);
  }
}
