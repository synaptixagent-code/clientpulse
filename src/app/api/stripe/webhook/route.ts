import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb, ensureSchema, str } from '@/lib/db';
import { auditLog } from '@/lib/security';
import { v4 as uuid } from 'uuid';

function verifyAndParse(body: string, signature: string, secret: string): Record<string, unknown> {
  const parts = signature.split(',').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=');
    acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts['t'];
  const sig = parts['v1'];
  if (!timestamp || !sig) throw new Error('Invalid signature header');

  if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > 300) {
    throw new Error('Webhook timestamp too old');
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) {
    throw new Error('Signature mismatch');
  }

  return JSON.parse(body);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Record<string, unknown>;

    if (webhookSecret) {
      event = verifyAndParse(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    try {
      await ensureSchema();
      const db = getDb();

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data as { object: { metadata?: { userId?: string; plan?: string }; customer?: string; subscription?: string } };
          const obj = session.object;
          const userId = obj.metadata?.userId;
          if (userId && userId !== 'anonymous') {
            await db.execute({
              sql: `INSERT OR REPLACE INTO subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, plan, status)
                    VALUES (?, ?, ?, ?, ?, 'active')`,
              args: [uuid(), userId, obj.customer ?? null, obj.subscription ?? null, obj.metadata?.plan || 'starter'],
            });
          }
          auditLog({ action: 'subscription_created', resource: 'subscriptions', details: `customer: ${obj.customer}` });
          break;
        }

        case 'customer.subscription.deleted': {
          const sub = (event.data as { object: { id: string } }).object;
          await db.execute({
            sql: 'UPDATE subscriptions SET status = ? WHERE stripe_subscription_id = ?',
            args: ['cancelled', sub.id],
          });
          auditLog({ action: 'subscription_cancelled', resource: 'subscriptions', details: `sub: ${sub.id}` });
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = (event.data as { object: { customer: string } }).object;
          auditLog({ action: 'payment_failed', resource: 'subscriptions', details: `customer: ${invoice.customer}` });
          break;
        }
      }
    } catch (dbErr) {
      console.error('[webhook-db]', String(dbErr));
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
