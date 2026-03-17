import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getDb } from '@/lib/db';
import { auditLog } from '@/lib/security';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    if (webhookSecret && webhookSecret !== 'whsec_test_placeholder') {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // Dev mode: parse without verification
      event = JSON.parse(body);
    }

    const db = getDb();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId && userId !== 'anonymous') {
          db.prepare(`
            INSERT OR REPLACE INTO subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, plan, status)
            VALUES (?, ?, ?, ?, ?, 'active')
          `).run(uuid(), userId, session.customer, session.subscription, session.metadata?.plan || 'starter');
        }
        auditLog({ action: 'subscription_created', resource: 'subscriptions', details: `customer: ${session.customer}` });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        db.prepare('UPDATE subscriptions SET status = ? WHERE stripe_subscription_id = ?').run('cancelled', sub.id);
        auditLog({ action: 'subscription_cancelled', resource: 'subscriptions', details: `sub: ${sub.id}` });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        auditLog({ action: 'payment_failed', resource: 'subscriptions', details: `customer: ${invoice.customer}` });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
