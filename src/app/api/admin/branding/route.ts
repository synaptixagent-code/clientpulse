import { NextRequest, NextResponse } from 'next/server';
import { getDb, ensureSchema, str } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import { sanitizeString, validateEmail, errorResponse } from '@/lib/security';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return errorResponse(401);

  try {
    await ensureSchema();
    const db = getDb();

    const result = await db.execute({
      sql: 'SELECT company_name, reply_email, brand_color, footer_text FROM branding WHERE user_id = ?',
      args: [session.userId],
    });

    if (!result.rows[0]) {
      return NextResponse.json({
        company_name: '',
        reply_email: '',
        brand_color: '#3b82f6',
        footer_text: '',
      });
    }

    const row = result.rows[0];
    return NextResponse.json({
      company_name: str(row.company_name),
      reply_email:  str(row.reply_email),
      brand_color:  str(row.brand_color),
      footer_text:  str(row.footer_text),
    });
  } catch {
    return errorResponse(500);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) return errorResponse(401);

  try {
    const body = await req.json();

    const companyName = sanitizeString(body.company_name || '').slice(0, 100);
    const replyEmail  = sanitizeString(body.reply_email  || '').toLowerCase();
    const brandColor  = /^#[0-9a-fA-F]{6}$/.test(body.brand_color || '') ? body.brand_color : '#3b82f6';
    const footerText  = sanitizeString(body.footer_text || '').slice(0, 300);

    if (replyEmail && !validateEmail(replyEmail)) return errorResponse(400, 'Invalid reply email');

    await ensureSchema();
    const db = getDb();

    await db.execute({
      sql: `INSERT INTO branding (user_id, company_name, reply_email, brand_color, footer_text, updated_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(user_id) DO UPDATE SET
              company_name = excluded.company_name,
              reply_email  = excluded.reply_email,
              brand_color  = excluded.brand_color,
              footer_text  = excluded.footer_text,
              updated_at   = excluded.updated_at`,
      args: [session.userId, companyName, replyEmail || null, brandColor, footerText || null],
    });

    return NextResponse.json({ success: true });
  } catch {
    return errorResponse(500);
  }
}
