import Stripe from 'stripe';
import {
  CHECKOUT_CURRENCY,
  PRODUCT_TAX_CODE,
  getStripe,
  managedPaymentsRequestOptions,
} from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/service';

type SellableTable = 'courses' | 'membershiptiers';

interface SellableItem {
  table: SellableTable;
  idColumn: string;
  id: number;
  name: string;
  description: string;
  unitAmount: number; // minor units (HKD cents)
}

/**
 * Blueprint step: create a Stripe Product carrying an eligible tax code and a
 * default price (POST /v1/products with default_price_data), then reuse the
 * returned default_price as the line item for Checkout.
 *
 * Products are created lazily — the first time someone checks out a course or
 * tier — and the resulting price ID is cached on the row (`stripe_price_id`)
 * so later checkouts reuse it instead of creating duplicates.
 */
export async function ensureStripePrice(item: SellableItem): Promise<string> {
  const stripe = getStripe();
  const supabase = createServiceClient();

  const { data: row, error: readError } = await supabase
    .from(item.table)
    .select('stripe_price_id')
    .eq(item.idColumn, item.id)
    .maybeSingle();

  if (readError) throw new Error(readError.message);

  const cached = (row as { stripe_price_id?: string } | null)?.stripe_price_id;
  if (cached) return cached;

  // Preview-only params (tax_code / default_price_data) — the cast keeps the
  // stable SDK types happy while sending exactly what the blueprint specifies.
  const product = await stripe.products.create(
    {
      name: item.name,
      description: item.description,
      tax_code: PRODUCT_TAX_CODE,
      default_price_data: {
        unit_amount: item.unitAmount,
        currency: CHECKOUT_CURRENCY,
      },
      metadata: { source_table: item.table, source_id: String(item.id) },
    } as Stripe.ProductCreateParams,
    managedPaymentsRequestOptions,
  );

  const defaultPrice =
    typeof product.default_price === 'string'
      ? product.default_price
      : product.default_price?.id;

  if (!defaultPrice) {
    throw new Error(`Stripe product ${product.id} was created without a default price.`);
  }

  const { error: cacheError } = await supabase
    .from(item.table)
    .update({ stripe_price_id: defaultPrice })
    .eq(item.idColumn, item.id);

  if (cacheError) throw new Error(cacheError.message);

  return defaultPrice;
}

/**
 * Member discounts are enforced server-side as a Stripe coupon so the price
 * shown on the site always matches what the customer is actually charged —
 * and so Managed Payments calculates tax on the discounted amount.
 * One coupon per membership tier, created on first use.
 */
export async function ensureDiscountCoupon(
  tierid: number | null,
  discountRate: number,
): Promise<string | null> {
  if (!tierid || !discountRate || discountRate <= 0) return null;

  const stripe = getStripe();
  const couponId = `member-tier-${tierid}`;
  const percentOff = Math.round(discountRate * 10000) / 100;

  try {
    const existing = await stripe.coupons.retrieve(couponId);
    if (existing.percent_off !== percentOff) {
      await stripe.coupons.del(couponId);
      await stripe.coupons.create({
        id: couponId,
        percent_off: percentOff,
        duration: 'once',
        name: `Member discount (tier ${tierid})`,
      });
    }
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === 'resource_missing') {
      await stripe.coupons.create({
        id: couponId,
        percent_off: percentOff,
        duration: 'once',
        name: `Member discount (tier ${tierid})`,
      });
    } else {
      throw err;
    }
  }

  return couponId;
}
