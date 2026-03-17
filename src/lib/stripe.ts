import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY not set');
    stripeInstance = new Stripe(key, { apiVersion: '2025-12-18.acacia' as Stripe.LatestApiVersion });
  }
  return stripeInstance;
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 2900, // $29/mo in cents
    features: [
      'Unlimited client intake forms',
      'Automated follow-up emails (3-step)',
      'Client dashboard',
      'Email notifications',
      'Basic analytics',
    ],
  },
  pro: {
    name: 'Pro',
    price: 7900, // $79/mo
    features: [
      'Everything in Starter',
      'Unlimited follow-up sequences',
      'SMS follow-ups',
      'Custom branding',
      'Priority support',
      'API access',
    ],
  },
} as const;
