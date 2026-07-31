import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, fromMinorUnits } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/service';

// Blueprint step: listen for checkout.session.completed and fulfill the order.
// This webhook — never the browser — is what marks enrollments Paid and
// activates membership tiers.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET is not set — see STRIPE-SETUP.md.' },
      { status: 500 },
    );
  }
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true, ignored: 'payment_not_paid' });
  }

  try {
    const db = createServiceClient();
    const meta = session.metadata ?? {};
    const kind = meta.kind;
    const userId = meta.user_id;

    if (!userId || (kind !== 'course' && kind !== 'membership')) {
      throw new Error(`Session ${session.id} is missing fulfillment metadata.`);
    }

    // Idempotency: Stripe retries webhooks — never fulfill the same session twice.
    const { data: alreadyRecorded } = await db
      .from('stripe_payments')
      .select('paymentid')
      .eq('stripe_session_id', session.id)
      .maybeSingle();

    if (!alreadyRecorded) {
      const { error: recordError } = await db.from('stripe_payments').insert({
        user_id: userId,
        kind,
        courseid: kind === 'course' ? Number(meta.courseid) : null,
        tierid: kind === 'membership' ? Number(meta.tierid) : null,
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
        amount: fromMinorUnits(session.amount_total),
        currency: session.currency ?? 'hkd',
      });
      if (recordError) throw new Error(recordError.message);
    }

    if (typeof session.customer === 'string' && session.customer) {
      await db
        .from('users')
        .update({ stripe_customer_id: session.customer })
        .eq('id', userId)
        .is('stripe_customer_id', null);
    }

    if (kind === 'course') {
      const courseid = Number(meta.courseid);
      const { error: enrollError } = await db.from('enrollments').insert({
        user_id: userId,
        courseid,
        paymentstatus: 'Paid',
        stripe_checkout_session_id: session.id,
      });
      // Unique violation = enrollment already exists (duplicate webhook) — safe to ignore.
      if (enrollError && !/duplicate key/i.test(enrollError.message)) {
        throw new Error(enrollError.message);
      }
    }

    if (kind === 'membership') {
      const tierid = Number(meta.tierid);
      const { error: membershipError } = await db
        .from('users')
        .update({ tierid })
        .eq('id', userId);
      if (membershipError) throw new Error(membershipError.message);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('stripe-webhook fulfillment failed:', err);
    const message = err instanceof Error ? err.message : 'Fulfillment failed';
    // 5xx tells Stripe to retry the event.
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
