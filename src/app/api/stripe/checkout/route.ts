import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PLANS } from '@/lib/stripe';
import { getSessionFromCookies } from '@/lib/auth';
import { checkRateLimit, getClientIp, auditLog, errorResponse } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // Rate limiting — non-fatal if SQLite unavailable
    try {
      const { allowed } = checkRateLimit(ip, 'api');
      if (!allowed) return errorResponse(429);
    } catch (e) { console.error('[rl-fail]', String(e)); }

    let session = null;
    try { session = await getSessionFromCookies(); } catch (e) { console.error('[sess-fail]', String(e)); }

    const body = await req.json();
    const plan = body.plan as keyof typeof PLANS;

    if (!plan || !PLANS[plan]) return errorResponse(400);

    console.log('[checkout] plan:', plan, 'appUrl:', process.env.NEXT_PUBLIC_APP_URL);
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `ClientPulse ${PLANS[plan].name}`,
              description: `ClientPulse ${PLANS[plan].name} Plan - Monthly`,
            },
            unit_amount: PLANS[plan].price,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/admin?checkout=success`,
      cancel_url: `${appUrl}/#pricing`,
      metadata: {
        userId: session?.userId || 'anonymous',
        plan,
      },
    });

    // Audit log — non-fatal if SQLite unavailable
    try {
      auditLog({
        userId: session?.userId,
        action: 'stripe_checkout_created',
        resource: 'checkout',
        resourceId: checkoutSession.id,
        ip,
      });
    } catch { /* continue if audit logging fails */ }

    return NextResponse.json({ url: checkoutSession.url });
  } catch {
    return errorResponse(500);
  }
}
