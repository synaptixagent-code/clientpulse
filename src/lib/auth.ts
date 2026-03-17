import { SignJWT, jwtVerify } from 'jose';
import { hashSync, compareSync } from 'bcryptjs';
import { cookies } from 'next/headers';
import { getDb } from './db';
import { v4 as uuid } from 'uuid';

const BCRYPT_ROUNDS = 12;
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const COOKIE_NAME = 'cpulse_session';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return new TextEncoder().encode(secret);
}

export function hashPassword(password: string): string {
  return hashSync(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): boolean {
  return compareSync(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const db = getDb();
  const sessionId = uuid();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(sessionId, userId, expiresAt);

  const token = await new SignJWT({ sub: userId, sid: sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(getJwtSecret());

  return token;
}

export async function verifySession(token: string): Promise<{ userId: string; sessionId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const userId = payload.sub as string;
    const sessionId = payload.sid as string;

    const db = getDb();
    const session = db.prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ? AND expires_at > datetime(\'now\')').get(sessionId, userId) as { id: string } | undefined;

    if (!session) return null;
    return { userId, sessionId };
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<{ userId: string; sessionId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function setSessionCookie(token: string): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: SESSION_DURATION_MS / 1000,
    },
  };
}

export function clearSessionCookie(): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: '',
    options: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/', maxAge: 0 },
  };
}

export function checkAccountLock(email: string): { locked: boolean; minutesRemaining?: number } {
  const db = getDb();
  const user = db.prepare('SELECT failed_login_attempts, locked_until FROM users WHERE email = ?').get(email) as { failed_login_attempts: number; locked_until: string | null } | undefined;

  if (!user) return { locked: false };

  if (user.locked_until) {
    const lockExpiry = new Date(user.locked_until).getTime();
    if (Date.now() < lockExpiry) {
      return { locked: true, minutesRemaining: Math.ceil((lockExpiry - Date.now()) / 60000) };
    }
    // Lock expired, reset
    db.prepare('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = ?').run(email);
  }

  return { locked: false };
}

export function recordFailedLogin(email: string): void {
  const db = getDb();
  const user = db.prepare('SELECT failed_login_attempts FROM users WHERE email = ?').get(email) as { failed_login_attempts: number } | undefined;
  if (!user) return;

  const newCount = user.failed_login_attempts + 1;
  if (newCount >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
    db.prepare('UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE email = ?').run(newCount, lockedUntil, email);
  } else {
    db.prepare('UPDATE users SET failed_login_attempts = ? WHERE email = ?').run(newCount, email);
  }
}

export function resetFailedLogins(email: string): void {
  const db = getDb();
  db.prepare('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = ?').run(email);
}

export function destroySession(sessionId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}
