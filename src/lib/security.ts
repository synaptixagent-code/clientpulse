import { NextRequest, NextResponse } from 'next/server';
import { getDb } from './db';
import https from 'https';

// ─── Rate Limiting ────────────────────────────────────────────────

const RATE_WINDOWS: Record<string, { max: number; windowMs: number }> = {
  login: { max: 5, windowMs: 15 * 60 * 1000 },
  signup: { max: 3, windowMs: 60 * 60 * 1000 },
  intake: { max: 20, windowMs: 60 * 60 * 1000 },
  api: { max: 100, windowMs: 60 * 1000 },
};

export function checkRateLimit(key: string, category: string = 'api'): { allowed: boolean; remaining: number } {
  const config = RATE_WINDOWS[category] || RATE_WINDOWS.api;
  const db = getDb();
  const windowStart = new Date(Date.now() - config.windowMs).toISOString();

  // Clean old entries
  db.prepare('DELETE FROM rate_limits WHERE window_start < ?').run(windowStart);

  const rateKey = `${category}:${key}`;
  const existing = db.prepare('SELECT count FROM rate_limits WHERE key = ? AND window_start > ?').get(rateKey, windowStart) as { count: number } | undefined;

  if (!existing) {
    db.prepare('INSERT OR REPLACE INTO rate_limits (key, count, window_start) VALUES (?, 1, datetime(\'now\'))').run(rateKey);
    return { allowed: true, remaining: config.max - 1 };
  }

  if (existing.count >= config.max) {
    return { allowed: false, remaining: 0 };
  }

  db.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?').run(rateKey);
  return { allowed: true, remaining: config.max - existing.count - 1 };
}

// ─── Input Validation ─────────────────────────────────────────────

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 10000); // Max length
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

// ─── CSRF Protection ──────────────────────────────────────────────

export function generateCsrfToken(): string {
  const { randomBytes } = require('crypto');
  return randomBytes(32).toString('hex');
}

// ─── IP Extraction ────────────────────────────────────────────────

export function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '0.0.0.0';
}

// ─── Audit Logging ────────────────────────────────────────────────

export function auditLog(params: {
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  details?: string;
}) {
  const db = getDb();
  db.prepare(`
    INSERT INTO audit_log (user_id, action, resource, resource_id, ip_address, user_agent, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    params.userId || null,
    params.action,
    params.resource || null,
    params.resourceId || null,
    params.ip || null,
    params.userAgent || null,
    params.details || null
  );
}

// ─── Suspicious Activity Detection ────────────────────────────────

export function checkSuspiciousActivity(ip: string): boolean {
  const db = getDb();
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const result = db.prepare(`
    SELECT COUNT(*) as count FROM audit_log
    WHERE ip_address = ? AND created_at > ? AND action LIKE '%failed%'
  `).get(ip, fiveMinAgo) as { count: number };

  return result.count >= 10;
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

// ─── Security Headers ─────────────────────────────────────────────

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

// ─── Error Response ───────────────────────────────────────────────

export function errorResponse(status: number, message: string = 'An error occurred'): NextResponse {
  // Never expose internal errors to frontend
  const safeMessages: Record<number, string> = {
    400: 'Invalid request',
    401: 'Authentication required',
    403: 'Access denied',
    404: 'Not found',
    429: 'Too many requests. Please try again later.',
    500: 'Internal server error',
  };

  return NextResponse.json(
    { error: safeMessages[status] || message },
    { status }
  );
}
