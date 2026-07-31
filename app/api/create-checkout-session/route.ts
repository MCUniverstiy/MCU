import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getStripe, managedPaymentsRequestOptions, toMinorUnits } from '@/lib/stripe';
import { ensureDiscountCoupon, ensureStripePrice } from '@/lib/stripe-catalog';

// Blueprint step: create a Checkout Session with managed_payments[enabled]=true.
// Names and prices are resolved server-side — the browser only sends an ID.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const kind = body?.kind as 'course' | 'membership' | undefined;

    if (kind !== 'course' && kind !== 'membership') {
      return NextResponse.json({ error: 'kind must be "course" or "membership".' }, { status: 400 });
    }

    // 1. Authenticate the buyer (checkout requires an account — enrollment and
    //    membership are both tied to a user).
    const supabaseAuth = await createClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to check out.' }, { status: 401 });
    }

    const db = createServiceClient();

    const { data: profile, error: profileError } = await db
      .from('users')
      .select('id, first_name, last_name, email, tierid, stripe_customer_id, membershiptiers(discountrate)')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    const tier = (profile as Record<string, unknown>).membershiptiers as
      | { discountrate?: number }
      | null;
    const discountRate = Number(tier?.discountrate) || 0;

    // 2. Resolve what is being bought, entirely from our own tables.
    let priceId: string;
    let metadata: Record<string, string>;
    let successPage: string;

    if (kind === 'course') {
      const courseid = Number(body?.courseid);
      if (!Number.isFinite(courseid)) {
        return NextResponse.json({ error: 'courseid is required.' }, { status: 400 });
      }

      const { data: course, error: courseError } = await db
        .from('courses')
        .select('courseid, coursename, description, price')
        .eq('courseid', courseid)
        .maybeSingle();

      if (courseError || !course) {
        return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
      }

      const { data: existing } = await db
        .from('enrollments')
        .select('enrollmentid')
        .eq('user_id', user.id)
        .eq('courseid', courseid)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: 'already_enrolled' }, { status: 409 });
      }

      const price = Number(course.price);
      if (!(price > 0)) {
        // Free course: enroll directly, no Stripe involved.
        const { error: enrollError } = await db
          .from('enrollments')
          .insert({ user_id: user.id, courseid, paymentstatus: 'Paid' });
        if (enrollError) throw new Error(enrollError.message);
        return NextResponse.json({ free: true });
      }

      priceId = await ensureStripePrice({
        table: 'courses',
        idColumn: 'courseid',
        id: courseid,
        name: course.coursename,
        description: course.description || `Enrollment — ${course.coursename}`,
        unitAmount: toMinorUnits(price),
      });

      metadata = { kind: 'course', user_id: user.id, courseid: String(courseid) };
      successPage = '/courses';
    } else {
      const tierid = Number(body?.tierid);
      if (!Number.isFinite(tierid)) {
        return NextResponse.json({ error: 'tierid is required.' }, { status: 400 });
      }

      if (profile.tierid === tierid) {
        return NextResponse.json({ error: 'already_on_tier' }, { status: 409 });
      }

      const { data: tierRow, error: tierError } = await db
        .from('membershiptiers')
        .select('tierid, membname, price')
        .eq('tierid', tierid)
        .maybeSingle();

      if (tierError) {
        // Pre-migration schema has no `price` column.
        if (/column.*price.*does not exist/i.test(tierError.message)) {
          return NextResponse.json(
            { error: 'Membership pricing is not configured — run supabase/stripe.sql in the Supabase SQL editor first.' },
            { status: 500 },
          );
        }
        throw new Error(tierError.message);
      }

      if (!tierRow) {
        return NextResponse.json({ error: 'Membership tier not found.' }, { status: 404 });
      }

      const price = Number(tierRow.price);
      if (!(price > 0)) {
        return NextResponse.json(
          { error: 'This tier has no price set — set membershiptiers.price in Supabase (see supabase/stripe.sql).' },
          { status: 500 },
        );
      }

      priceId = await ensureStripePrice({
        table: 'membershiptiers',
        idColumn: 'tierid',
        id: tierid,
        name: `${tierRow.membname} Membership`,
        description: `MCU Institute ${tierRow.membname} membership — annual`,
        unitAmount: toMinorUnits(price),
      });

      metadata = { kind: 'membership', user_id: user.id, tierid: String(tierid) };
      successPage = '/membership';
    }

    // 3. Reuse (or create and persist) the Stripe customer for this user.
    let customerId = (profile as Record<string, unknown>).stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: profile.email || user.email || undefined,
        name: `${profile.first_name} ${profile.last_name}`.trim() || undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      await db.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    // 4. Course checkouts apply the member discount via a coupon (applied
    //    server-side so it can't be forged by the browser).
    const couponId =
      kind === 'course' ? await ensureDiscountCoupon(profile.tierid, discountRate) : null;

    const origin = new URL(request.url).origin;

    const session = await getStripe().checkout.sessions.create(
      {
        mode: 'payment',
        customer: customerId,
        client_reference_id: user.id,
        line_items: [{ price: priceId, quantity: 1 }],
        ...(couponId ? { discounts: [{ coupon: couponId }] } : {}),
        managed_payments: { enabled: true },
        success_url: `${origin}${successPage}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}${successPage}?checkout=cancelled`,
        metadata,
        payment_intent_data: { metadata },
      } as Stripe.Checkout.SessionCreateParams,
      managedPaymentsRequestOptions,
    );

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL.');
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('create-checkout-session failed:', err);
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
