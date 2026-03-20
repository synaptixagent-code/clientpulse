import { NextRequest, NextResponse } from 'next/server';
import { getDb, ensureSchema } from './db';
import https from 'https';

const RATE_WINDOWS: Record<string, { max: number; windowMs: number }> = {
  login: { max: 5, windowMs: 15 * 60 * 1000 },
  signup: { max: 3, windowMs: 60 * 60 * 1000 },
  intake: { max: 20, windowMs: 60 * 60 * 1000 },
  api: { max: 100, windowMs: 60 * 1000 },
};

export async function checkRateLimit(key: string, category: string = 'api'): Promise<{ allowed: boolean; remaining: number }> {
  const config = RATE_WINDOWS[category] || RATE_WINDOWS.api;
  await ensureSchema();
  const db = getDb();
  const windowStart = new Date(Date.now() - config.windowMs).toISOString();
  const rateKey = `${category}:${key}`;

  await db.execute({ sql: 'DELETE FROM rate_limits WHERE window_start < ?', args: [windowStart] });

  const result = await db.execute({
    sql: 'SELECT count FROM rate_limits WHERE key = ? AND window_start > ?',
    args: [rateKey, windowStart],
  });
  const existing = result.rows[0];

  if (!existing) {
    await db.execute({
      sql: "INSERT OR REPLACE INTO rate_limits (key, count, window_start) VALUES (?, 1, datetime('now'))",
      args: [rateKey],
    });
    return { allowed: true, remaining: config.max - 1 };
  }

  const count = Number(existing.count);
  if (count >= config.max) {
    return { allowed: false, remaining: 0 };
  }

  await db.execute({ sql: 'UPDATE rate_limits SET count = count + 1 WHERE key = ?', args: [rateKey] });
  return { allowed: true, remaining: config.max - count - 1 };
}

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 10000);
}

export function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return re.test(email) && email.length <= 254;
}

export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().+]/g, '');
  return /^\d{7,15}$/.test(cleaned);
}

export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 10) return { valid: false, message: 'Password must be at least 10 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain an uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain a lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain a number' };
  return { valid: true, message: 'OK' };
}

export function generateCsrfToken(): string {
  const { randomBytes } = require('crypto');
  return randomBytes(32).toString('hex');
}

export function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '0.0.0.0';
}

export function auditLog(params: {
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  details?: string;
}): void {
  ensureSchema().then(() => {
    const db = getDb();
    return db.execute({
      sql: `INSERT INTO audit_log (user_id, action, resource, resource_id, ip_address, user_agent, details)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        params.userId ?? null,
        params.action,
        params.resource ?? null,
        params.resourceId ?? null,
        params.ip ?? null,
        params.userAgent ?? null,
        params.details ?? null,
      ],
    });
  }).catch(console.error);
}

export async function checkSuspiciousActivity(ip: string): Promise<boolean> {
  await ensureSchema();
  const db = getDb();
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const result = await db.execute({
    sql: `SELECT COUNT(*) as count FROM audit_log WHERE ip_address = ? AND created_at > ? AND action LIKE '%failed%'`,
    args: [ip, fiveMinAgo],
  });
  return Number(result.rows[0]?.count ?? 0) >= 10;
}

export async function sendTelegramAlert(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const userId = process.env.TELEGRAM_ALERT_USER_ID;
  if (!token || !userId) return;

  const data = JSON.stringify({ chat_id: userId, text: message, parse_mode: 'Markdown' });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
    }, () => resolve());
    req.on('error', () => resolve());
    req.write(data);
    req.end();
  });
}

export function securityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-src https://js.stripe.com https://hooks.stripe.com; connect-src 'self' https://api.stripe.com; font-src 'self' data:;",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  };
}

export function errorResponse(status: number, message: string = 'An error occurred'): NextResponse {
  const safeMessages: Record<number, string> = {
    400: 'Invalid request',
    401: 'Authentication required',
    403: 'Access denied',
    404: 'Not found',
    429: 'Too many requests. Please try again later.',
    500: 'Internal server error',
  };
  return NextResponse.json({ error: safeMessages[status] || message }, { status });
}
