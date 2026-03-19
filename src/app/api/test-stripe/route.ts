import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return NextResponse.json({ error: 'no key', keySet: false });

    // Test outbound connectivity first
    const connectTest = await fetch('https://api.stripe.com/v1/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const data = await connectTest.json();
    return NextResponse.json({ status: connectTest.status, data });
  } catch (err) {
    return NextResponse.json({ error: String(err), type: 'fetch-error' });
  }
}
