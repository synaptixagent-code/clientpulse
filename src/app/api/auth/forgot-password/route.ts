import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { getDb } from '@/lib/db';
import { validateEmail, sanitizeString, getClientIp, errorResponse } from '@/lib/security';
import { sendEmail } from '@/lib/email';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = sanitizeString(body.email || '').toLowerCase();

    if (!validateEmail(email)) return errorResponse(400);

    const db = getDb();
    const user = db.prepare('SELECT id, name FROM users WHERE email = ?')
      .get(email) as { id: string; name: string } | undefined;

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Delete any existing unused tokens for this user
    db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ? AND used = 0').run(user.id);

    // Generate token
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    db.prepare(`
      INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(uuid(), user.id, tokenHash, expiresAt);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    const ip = getClientIp(req);

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="500" cellpadding="0" cellspacing="0" style="max-width:500px;width:100%;background:#1e293b;border-radius:16px;overflow:hidden;">
  <tr><td style="background:linear-gradient(135deg,#1e40af,#1d4ed8);padding:28px 36px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="background:#3b82f6;border-radius:8px;width:36px;height:36px;text-align:center;vertical-align:middle;">
        <span style="color:#fff;font-weight:700;font-size:14px;line-height:36px;">CP</span>
      </td>
      <td style="padding-left:10px;color:#fff;font-size:18px;font-weight:700;">ClientPulse</td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:36px;">
    <h1 style="margin:0 0 8px;color:#f1f5f9;font-size:22px;font-weight:700;">Reset your password</h1>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;">Hi ${user.name || 'there'},</p>
    <p style="margin:0 0 24px;color:#cbd5e1;font-size:15px;line-height:1.7;">
      We received a request to reset the password for your ClientPulse account. Click the button below to set a new password.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:#3b82f6;border-radius:10px;">
        <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;color:#fff;font-size:15px;font-weight:600;text-decoration:none;">
          Reset Password
        </a>
      </td></tr>
    </table>
    <p style="margin:0 0 8px;color:#64748b;font-size:13px;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password will not change.</p>
    <p style="margin:0;color:#475569;font-size:12px;word-break:break-all;">Or copy this link: ${resetUrl}</p>
  </td></tr>
  <tr><td style="padding:20px 36px;border-top:1px solid #334155;">
    <p style="margin:0;color:#64748b;font-size:12px;">&copy; ${new Date().getFullYear()} ClientPulse. All rights reserved.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

    await sendEmail({ to: email, subject: 'Reset your ClientPulse password', html });

    console.log(`[forgot-password] Reset link sent to ${email} from IP ${ip}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[forgot-password]', err);
    return errorResponse(500);
  }
}
