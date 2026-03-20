import { createClient, type Client, type InValue } from '@libsql/client';

let _client: Client | null = null;

export function getDb(): Client {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error('TURSO_DATABASE_URL not set');
    _client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

// Helper to get a typed row value as string
export function str(val: InValue | null | undefined): string {
  return val == null ? '' : String(val);
}

// Helper to get a typed row value as number
export function num(val: InValue | null | undefined): number {
  return val == null ? 0 : Number(val);
}

let _schemaInitialized = false;

export async function ensureSchema(): Promise<void> {
  if (_schemaInitialized) return;
  const db = getDb();

  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until TEXT,
      linkedin_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT,
      service_requested TEXT,
      message TEXT,
      source TEXT DEFAULT 'form',
      status TEXT DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS followups (
      id TEXT PRIMARY KEY,
      submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'email',
      subject TEXT,
      body TEXT,
      scheduled_at TEXT NOT NULL,
      sent_at TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      plan TEXT DEFAULT 'starter',
      status TEXT DEFAULT 'active',
      current_period_end TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      action TEXT NOT NULL,
      resource TEXT,
      resource_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      count INTEGER DEFAULT 1,
      window_start TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS email_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      followup_id TEXT,
      submission_id TEXT,
      business_id TEXT,
      to_email TEXT,
      subject TEXT,
      status TEXT NOT NULL DEFAULT 'sent',
      resend_id TEXT,
      error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS idx_submissions_business ON submissions(business_id)`,
    `CREATE INDEX IF NOT EXISTS idx_followups_scheduled ON followups(scheduled_at, status)`,
    `CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_audit_ip ON audit_log(ip_address)`,
    `CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start)`,
    `CREATE INDEX IF NOT EXISTS idx_email_logs_submission ON email_logs(submission_id)`,
    `CREATE INDEX IF NOT EXISTS idx_email_logs_business ON email_logs(business_id)`,
    `CREATE INDEX IF NOT EXISTS idx_reset_tokens_hash ON password_reset_tokens(token_hash)`,
    `CREATE TABLE IF NOT EXISTS branding (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      company_name TEXT NOT NULL DEFAULT 'My Business',
      reply_email TEXT,
      brand_color TEXT NOT NULL DEFAULT '#3b82f6',
      footer_text TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sms_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      followup_id TEXT,
      submission_id TEXT,
      business_id TEXT,
      to_phone TEXT,
      body TEXT,
      status TEXT NOT NULL DEFAULT 'sent',
      twilio_sid TEXT,
      error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  ];

  for (const sql of statements) {
    await db.execute(sql);
  }

  _schemaInitialized = true;
}
