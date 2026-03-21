import { NextRequest, NextResponse } from 'next/server';
import { PLANS } from '@/lib/stripe';
import { getSessionFromCookies } from '@/lib/auth';
import { checkRateLimit, getClientIp, errorResponse } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    try {
      const { allowed } = await checkRateLimit(ip, 'api');
      if (!allowed) return errorResponse(429);
    } catch { /* non-fatal */ }

    let session = null;
    try { session = await getSessionFromCookies(); } catch { /* non-fatal */ }

    if (!session) {
      return NextResponse.json({ error: 'Please sign up or log in before subscribing.' }, { status: 401 });
    }

    const body = await req.json();
    const plan = body.plan as keyof typeof PLANS;
    if (!plan || !PLANS[plan]) return errorResponse(400);

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return errorResponse(500);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const planData = PLANS[plan];

    // Build form-encoded body for Stripe API
    const params = new URLSearchParams({
      'mode': 'subscription',
      'payment_method_types[0]': 'card',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': `ClientPulse ${planData.name}`,
      'line_items[0][price_data][product_data][description]': `ClientPulse ${planData.name} Plan - Monthly`,
      'line_items[0][price_data][unit_amount]': String(planData.price),
      'line_items[0][price_data][recurring][interval]': 'month',
      'line_items[0][quantity]': '1',
      'success_url': `${appUrl}/admin?checkout=success`,
      'cancel_url': `${appUrl}/#pricing`,
      'metadata[plan]': plan,
      'metadata[userId]': session?.userId || '',
    });

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await res.json() as { url?: string; error?: { message: string } };

    if (!res.ok || !data.url) {
      console.error('[stripe-checkout]', data.error?.message);
      return errorResponse(500);
    }

    return NextResponse.json({ url: data.url });
  } catch {
    return errorResponse(500);
  }
}
