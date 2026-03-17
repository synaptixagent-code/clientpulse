import { NextResponse } from 'next/server';
import { getSessionFromCookies, destroySession, clearSessionCookie } from '@/lib/auth';

export async function POST() {
  const session = await getSessionFromCookies();
  if (session) {
    destroySession(session.sessionId);
  }
  const cookie = clearSessionCookie();
  const response = NextResponse.json({ success: true });
  response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2]);
  return response;
}
