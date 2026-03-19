import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return NextResponse.json({ error: 'no key' });
    const stripe = new Stripe(key);
    const balance = await stripe.balance.retrieve();
    return NextResponse.json({ ok: true, mode: balance.livemode ? 'live' : 'test' });
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
