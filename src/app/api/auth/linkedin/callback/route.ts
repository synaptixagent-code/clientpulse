import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createSession, setSessionCookie } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

interface LinkedInTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface LinkedInUserInfo {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function errorRedirect(msg: string) {
  return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(msg)}`);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get('code');
  const state = searchParams.get('state');
  const oauthError = searchParams.get('error');

  // User denied access
  if (oauthError) {
    return errorRedirect('LinkedIn sign-in was cancelled.');
  }

  if (!code || !state) {
    return errorRedirect('Invalid OAuth response from LinkedIn.');
  }

  // Validate state to prevent CSRF
  const savedState = req.cookies.get('linkedin_oauth_state')?.value;
  if (!savedState || savedState !== state) {
    return errorRedirect('Invalid OAuth state. Please try again.');
  }

  const clientId     = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return errorRedirect('LinkedIn OAuth not configured.');
  }

  const redirectUri = `${appUrl}/api/auth/linkedin/callback`;

  // ── 1. Exchange code for access token ──────────────────────────
  let accessToken: string;
  try {
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        redirect_uri:  redirectUri,
        client_id:     clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    const tokenData = await tokenRes.json() as LinkedInTokenResponse;

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[linkedin-callback] token error:', tokenData.error_description);
      return errorRedirect('Failed to authenticate with LinkedIn. Please try again.');
    }

    accessToken = tokenData.access_token;
  } catch (err) {
    console.error('[linkedin-callback] token fetch error:', err);
    return errorRedirect('Network error during LinkedIn authentication.');
  }

  // ── 2. Fetch user profile ───────────────────────────────────────
  let profile: LinkedInUserInfo;
  try {
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      return errorRedirect('Failed to fetch LinkedIn profile.');
    }

    profile = await profileRes.json() as LinkedInUserInfo;
  } catch (err) {
    console.error('[linkedin-callback] profile fetch error:', err);
    return errorRedirect('Network error fetching LinkedIn profile.');
  }

  const { sub: linkedinId, email, name, given_name, family_name } = profile;
  const displayName = name || [given_name, family_name].filter(Boolean).join(' ') || 'LinkedIn User';

  if (!email) {
    return errorRedirect('LinkedIn account does not have a verified email address.');
  }

  // ── 3. Find or create user in DB ───────────────────────────────
  let userId: string;
  try {
    const db = getDb();

    const existing = db.prepare(
      'SELECT id FROM users WHERE email = ? OR linkedin_id = ?'
    ).get(email, linkedinId) as { id: string } | undefined;

    if (existing) {
      userId = existing.id;
      // Update linkedin_id if not already set
      db.prepare('UPDATE users SET linkedin_id = ?, updated_at = datetime(\'now\') WHERE id = ?')
        .run(linkedinId, userId);
    } else {
      userId = uuid();
      db.prepare(`
        INSERT INTO users (id, email, password_hash, name, role, linkedin_id)
        VALUES (?, ?, 'oauth::linkedin', ?, 'user', ?)
      `).run(userId, email, displayName, linkedinId);
    }
  } catch (err) {
    console.error('[linkedin-callback] db error:', err);
    return errorRedirect('Account error. Please try again.');
  }

  // ── 4. Create session and redirect ─────────────────────────────
  try {
    const token = await createSession(userId);
    const { name: cookieName, value, options } = setSessionCookie(token);

    const res = NextResponse.redirect(`${appUrl}/admin`);
    res.cookies.set(cookieName, value, options as Parameters<typeof res.cookies.set>[2]);

    // Clear the state cookie
    res.cookies.set('linkedin_oauth_state', '', { maxAge: 0, path: '/' });

    return res;
  } catch (err) {
    console.error('[linkedin-callback] session error:', err);
    return errorRedirect('Failed to create session. Please try again.');
  }
}
