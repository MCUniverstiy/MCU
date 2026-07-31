import Stripe from 'stripe';

// Lazy singleton so route modules don't throw at build time when env vars
// aren't present (e.g. during `next build` without keys configured).
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set — add it from the Stripe Dashboard (Developers → API keys).');
    }
    // API version intentionally left as the SDK default; the Managed Payments
    // preview version is attached per-request via MANAGED_PAYMENTS_API_VERSION.
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

// Stripe Managed Payments is a preview feature — these requests must carry a
// preview version header as the blueprint requires (2026-02-25.preview *or above*).
// If Stripe rejects the pinned preview version on your account (e.g. it has
// graduated to a newer dated API like 2026-06-24.dahlia), override via env:
// STRIPE_MANAGED_PAYMENTS_API_VERSION=2026-06-24.dahlia
export const MANAGED_PAYMENTS_API_VERSION =
  process.env.STRIPE_MANAGED_PAYMENTS_API_VERSION || '2026-02-25.preview';

export const managedPaymentsRequestOptions = {
  headers: { 'Stripe-Version': MANAGED_PAYMENTS_API_VERSION },
};

// Tax code from the blueprint (digital goods). Adjust per Stripe's tax-code
// docs if a course/tier should be taxed differently.
export const PRODUCT_TAX_CODE = 'txcd_10103100';

// MCU Institute charges in HKD (a two-decimal currency, so minor units = cents).
export const CHECKOUT_CURRENCY = 'hkd';

export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export function fromMinorUnits(amount: number | null | undefined): number {
  return Math.round((amount ?? 0)) / 100;
}
