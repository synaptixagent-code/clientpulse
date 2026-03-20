import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { getDb, ensureSchema, str } from '@/lib/db';
import { errorResponse } from '@/lib/security';

export async function POST() {
  const session = await getSessionFromCookies();
  if (!session) return errorResponse(401);

  try {
    await ensureSchema();
    const db = getDb();

    const subResult = await db.execute({
      sql: "SELECT stripe_customer_id FROM subscriptions WHERE user_id = ? AND status = 'active'",
      args: [session.userId],
    });

    const customerId = str(subResult.rows[0]?.stripe_customer_id ?? '');
    if (!customerId) {
      return NextResponse.json({ error: 'No active subscription found.' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clientpulse.dev';
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return errorResponse(500);

    const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(key + ':').toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ customer: customerId, return_url: `${appUrl}/admin` }).toString(),
    });

    const data = await res.json() as { url?: string; error?: { message?: string } };
    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message || 'Failed to open billing portal' }, { status: 500 });
    }

    return NextResponse.json({ url: data.url });
  } catch {
    return errorResponse(500);
  }
}
