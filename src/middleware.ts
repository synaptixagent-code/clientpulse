import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-src https://js.stripe.com https://hooks.stripe.com; connect-src 'self' https://api.stripe.com; font-src 'self' data:;"
  );

  // CORS - restrict to same origin
  const origin = req.headers.get('origin');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  if (origin && origin !== appUrl) {
    response.headers.set('Access-Control-Allow-Origin', appUrl);
  }

  // Protect admin routes — verify JWT signature and expiry, not just cookie existence
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const sessionCookie = req.cookies.get('cpulse_session');
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      const key = new TextEncoder().encode(secret);
      await jwtVerify(sessionCookie.value, key);
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
