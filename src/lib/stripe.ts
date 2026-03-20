import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY not set');
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 3900, // $39/mo in cents
    features: [
      'Up to 50 clients',
      'Unlimited client intake forms',
      'Automated follow-up emails (3-step)',
      'Client dashboard',
      'Email notifications',
      'Lead tracking dashboard',
    ],
  },
  pro: {
    name: 'Pro',
    price: 7900, // $79/mo
    features: [
      'Up to 500 clients',
      'Everything in Starter',
      'Unlimited follow-up sequences',
      'SMS follow-ups',
      'Custom branding',
      'Priority support',
    ],
  },
} as const;
