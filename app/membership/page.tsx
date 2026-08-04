'use client';

import { useEffect, useMemo, useState } from 'react';
import SiteLayout from '@/components/SiteLayout';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import { createClient } from '@/lib/supabase/client';

interface TierItem {
  tierid: number;
  name: string;
  category: string;
  description: string;
  priceDisplay: string;
  amount: number;
  currency: string;
  period: string;
  color: string;
  discountrate: number;
  features: string[];
  highlight: boolean;
  sortOrder: number;
}

const fallbackTiers: TierItem[] = [
  {
    tierid: 1,
    name: 'VIP Gold International',
    category: 'International',
    description: 'A prestigious international membership for professionals who want a strong foundation of access, learning and connection.',
    priceDisplay: 'USD 50,000',
    amount: 50000,
    currency: 'USD',
    period: '/ year',
    color: '#E5A52E',
    discountrate: 0.10,
    features: [
      'International member directory access',
      'Monthly executive webinars',
      'Priority invitations to MCU events',
      '10% discount on course enrolment',
      'Digital VIP Gold membership certificate',
    ],
    highlight: false,
    sortOrder: 1,
  },
  {
    tierid: 2,
    name: 'VIP Jade International',
    category: 'International',
    description: 'An elevated international membership for leaders seeking deeper access to MCU insight, networks and opportunities.',
    priceDisplay: 'USD 1,000,000',
    amount: 1000000,
    currency: 'USD',
    period: '/ year',
    color: '#2EC4B6',
    discountrate: 0.20,
    features: [
      'All VIP Gold benefits',
      'Private quarterly networking briefings',
      'Priority course registration',
      '20% discount on course enrolment',
      'Members-only research reports',
      'Dedicated relationship support',
    ],
    highlight: true,
    sortOrder: 2,
  },
  {
    tierid: 3,
    name: 'VIP Black Diamond',
    category: 'International',
    description: 'Our highest membership level for distinguished principals and institutions building a lasting global legacy.',
    priceDisplay: 'USD 2,000,000',
    amount: 2000000,
    currency: 'USD',
    period: '/ year',
    color: '#1A1A2A',
    discountrate: 0.30,
    features: [
      'All VIP Jade benefits',
      'Private advisory and strategy sessions',
      'VIP access to the annual conference',
      '30% discount on course enrolment',
      'Personal academic advisor',
      'Black Diamond member spotlight',
    ],
    highlight: false,
    sortOrder: 3,
  },
];

const clubBenefits = [
  'Monthly virtual study groups led by faculty',
  'Peer accountability partnerships',
  'Exclusive access to MCU case study library',
  'Job board for financial planning roles',
  'Alumni guest lecture series',
  'Annual gala dinner invitation',
];

type RawTier = Record<string, unknown>;

function parseFeatures(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const list = value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
    return list.length ? list : fallback;
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parseFeatures(parsed, fallback);
    } catch {
      const list = value.split('\n').map((item) => item.trim()).filter(Boolean);
      return list.length ? list : fallback;
    }
  }

  return fallback;
}

function safeColor(value: unknown, fallback: string) {
  return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}

function formatPrice(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function mapTier(raw: RawTier, index: number): TierItem {
  const fallback = fallbackTiers[index] || fallbackTiers[0];
  const rawPrice = Number(raw.price);
  const amount = Number.isFinite(rawPrice) ? rawPrice : fallback.amount;
  const currency = typeof raw.currency === 'string' && raw.currency.trim()
    ? raw.currency.toUpperCase()
    : fallback.currency;
  const rawName = typeof raw.membname === 'string' ? raw.membname.trim() : '';
  const fallbackName = typeof raw.tiers === 'string' ? raw.tiers.trim() : '';
  const rawCategory = typeof raw.category === 'string' ? raw.category.trim() : '';

  return {
    tierid: Number(raw.tierid) || fallback.tierid,
    name: rawName || fallbackName || fallback.name,
    category: rawCategory || 'International',
    description: typeof raw.description === 'string' && raw.description.trim()
      ? raw.description
      : fallback.description,
    priceDisplay: formatPrice(amount, currency),
    amount,
    currency,
    period: typeof raw.period === 'string' && raw.period.trim() ? raw.period : fallback.period,
    color: safeColor(raw.color, fallback.color),
    discountrate: Number(raw.discountrate) || 0,
    features: parseFeatures(raw.features, fallback.features),
    highlight: typeof raw.highlight === 'boolean' ? raw.highlight : fallback.highlight,
    sortOrder: Number(raw.sort_order) || index + 1,
  };
}

export default function MembershipPage() {
  const [tiersList, setTiersList] = useState<TierItem[]>(fallbackTiers);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentTierid, setCurrentTierid] = useState<number | null>(null);
  const [memberId, setMemberId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<TierItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutNotice, setCheckoutNotice] = useState<'success' | 'cancelled' | null>(null);

  useEffect(() => {
    async function loadTiersAndUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('tierid, memberid')
            .eq('id', user.id)
            .maybeSingle();

          if (profile) {
            if (profile.tierid !== null && profile.tierid !== undefined) setCurrentTierid(profile.tierid);
            if (profile.memberid !== null && profile.memberid !== undefined) setMemberId(profile.memberid);
          }
        }

        // The public RLS policy exposes active rows only. All card copy,
        // categories, features, prices and colours come from this catalogue.
        const { data: dbTiers, error } = await supabase
          .from('membershiptiers')
          .select('*');

        if (!error && dbTiers && dbTiers.length > 0) {
          const mapped = (dbTiers as RawTier[])
            .filter((tier) => tier.active !== false)
            .map(mapTier)
            .sort((a, b) => a.sortOrder - b.sortOrder || a.tierid - b.tierid);
          if (mapped.length > 0) setTiersList(mapped);
        }
      } catch (err) {
        console.warn('Using default membership tiers:', err);
      } finally {
        setLoading(false);
      }
    }

    void loadTiersAndUser();
  }, []);

  // Handle the redirect back from Stripe Checkout.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('checkout');
    if (result !== 'success' && result !== 'cancelled') return;

    window.history.replaceState({}, '', '/membership');
    const noticeTimer = setTimeout(() => setCheckoutNotice(result), 0);

    if (result !== 'success') return () => clearTimeout(noticeTimer);

    // The webhook activates the plan shortly after the redirect. Poll briefly
    // so the active-plan badge updates without a manual page refresh.
    const supabase = createClient();
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('tierid, memberid')
          .eq('id', user.id)
          .maybeSingle();
        if (profile) {
          if (profile.tierid !== null && profile.tierid !== undefined) setCurrentTierid(profile.tierid);
          if (profile.memberid !== null && profile.memberid !== undefined) setMemberId(profile.memberid);
        }
      }
      if (attempts >= 5) clearInterval(timer);
    }, 2000);

    return () => {
      clearTimeout(noticeTimer);
      clearInterval(timer);
    };
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(tiersList.map((tier) => tier.category).filter(Boolean)))],
    [tiersList],
  );

  const visibleTiers = selectedCategory === 'All'
    ? tiersList
    : tiersList.filter((tier) => tier.category === selectedCategory);

  const handleOpenPaymentModal = async (tier: TierItem) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.assign('/login?redirect=/membership');
      return;
    }

    setSelectedTier(tier);
    setCheckoutError('');
    setIsModalOpen(true);
  };

  const handleStartCheckout = async () => {
    if (!selectedTier) return;

    setIsProcessing(true);
    setCheckoutError('');

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'membership', tierid: selectedTier.tierid }),
      });
      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      setCheckoutError(
        data.error === 'already_on_tier'
          ? 'This plan is already active on your account.'
          : data.error || 'Unable to start checkout. Please try again.',
      );
    } catch {
      setCheckoutError('Network error — please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SiteLayout>
      <div style={{ paddingTop: 68 }}>
        <PageHero
          title="Join Our Membership"
          subtitle="Community"
          description="Be part of a thriving professional community of wealth managers, financial planners, and next-generation leaders."
          bgImage="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80"
        />
      </div>

      <section style={{ padding: '100px 0', background: '#fff' }}>
        <div className="container">
          {checkoutNotice && (
            <div style={{
              maxWidth: 640, margin: '0 auto 40px', padding: '16px 22px', borderRadius: 14,
              background: checkoutNotice === 'success' ? 'rgba(46,196,182,0.12)' : 'rgba(229,165,46,0.12)',
              border: `1px solid ${checkoutNotice === 'success' ? 'rgba(46,196,182,0.4)' : 'rgba(229,165,46,0.4)'}`,
              fontSize: 14, color: '#1A1A2A', lineHeight: 1.6,
            }}>
              {checkoutNotice === 'success'
                ? '✅ Payment received! Your membership is being activated — your new plan will show as active within a few seconds.'
                : 'Checkout was cancelled — no payment was taken. You can join anytime.'}
            </div>
          )}

          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
                <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Plans</span>
                <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
              </div>
              <h2 style={{ fontSize: 38, fontWeight: 700, color: '#1A1A2A', letterSpacing: '-0.02em' }}>Membership Tiers</h2>
              <p style={{ fontSize: 16, color: '#666', margin: '16px auto 0', maxWidth: 560 }}>
                Choose the plan that best fits your professional goals. Membership plans and benefits can be updated by an administrator.
              </p>
            </div>
          </ScrollReveal>

          {categories.length > 2 && (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
              <span style={{ alignSelf: 'center', fontSize: 13, fontWeight: 600, color: '#999' }}>Category:</span>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '7px 16px', borderRadius: 30, fontSize: 13, fontWeight: 600,
                    border: `1.5px solid ${selectedCategory === category ? '#7B1A2D' : 'rgba(0,0,0,0.12)'}`,
                    background: selectedCategory === category ? '#7B1A2D' : '#fff',
                    color: selectedCategory === category ? '#fff' : '#666',
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
              Loading membership tiers from Supabase…
            </div>
          ) : visibleTiers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666', background: '#F8F8FA', borderRadius: 18 }}>
              No active membership tiers are available right now. Please contact us for assistance.
            </div>
          ) : (
            <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, alignItems: 'start' }}>
              {visibleTiers.map((tier, i) => {
                const isCurrent = currentTierid === tier.tierid;
                const textColor = tier.highlight ? '#fff' : '#1A1A2A';
                return (
                  <ScrollReveal key={tier.tierid} delay={i * 0.1} threshold={0.1}>
                    <article style={{
                      borderRadius: 20, background: tier.highlight ? '#7B1A2D' : '#fff',
                      border: `2px solid ${isCurrent ? '#2EC4B6' : tier.highlight ? '#7B1A2D' : 'rgba(0,0,0,0.08)'}`,
                      overflow: 'hidden', boxShadow: tier.highlight ? '0 20px 60px rgba(123,26,45,0.25)' : '0 2px 20px rgba(0,0,0,0.06)',
                      position: 'relative', transition: 'all 0.3s',
                    }}>
                      {isCurrent && (
                        <div style={{ background: '#2EC4B6', textAlign: 'center', padding: '8px', fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          ✓ Your Active Plan{memberId ? ` · Member #${memberId}` : ''}
                        </div>
                      )}
                      {!isCurrent && tier.highlight && (
                        <div style={{ background: '#E5A52E', textAlign: 'center', padding: '8px', fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          Most Popular
                        </div>
                      )}
                      <div style={{ height: 5, background: tier.color }} />
                      <div style={{ padding: 32 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: tier.highlight ? 'rgba(255,255,255,0.65)' : tier.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                          {tier.category}
                        </div>
                        <h3 style={{ fontSize: 21, lineHeight: 1.35, fontWeight: 700, color: textColor }}>{tier.name}</h3>
                        <p style={{ fontSize: 13, color: tier.highlight ? 'rgba(255,255,255,0.68)' : '#777', lineHeight: 1.55, marginTop: 12, minHeight: 62 }}>
                          {tier.description}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap', marginTop: 20, marginBottom: 28 }}>
                          <span style={{ fontSize: 30, lineHeight: 1.1, fontWeight: 700, color: tier.highlight ? '#E5A52E' : tier.color }}>{tier.priceDisplay}</span>
                          <span style={{ fontSize: 13, color: tier.highlight ? 'rgba(255,255,255,0.6)' : '#999' }}>{tier.period}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {tier.features.map((feature, j) => (
                            <div key={`${tier.tierid}-${j}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                              <div style={{ width: 18, height: 18, borderRadius: '50%', background: tier.highlight ? tier.color : `${tier.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                <span style={{ fontSize: 10, color: tier.highlight ? '#fff' : tier.color, fontWeight: 700 }}>✓</span>
                              </div>
                              <span style={{ fontSize: 14, color: tier.highlight ? 'rgba(255,255,255,0.85)' : '#555', lineHeight: 1.5 }}>{feature}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenPaymentModal(tier)}
                          disabled={isCurrent}
                          style={{
                            width: '100%', border: 'none', cursor: isCurrent ? 'default' : 'pointer',
                            textAlign: 'center', marginTop: 32, padding: '14px 24px', borderRadius: 30,
                            fontSize: 15, fontWeight: 600,
                            background: isCurrent ? '#2EC4B6' : tier.highlight ? '#E5A52E' : tier.color,
                            color: '#fff', transition: 'all 0.3s',
                          }}
                        >
                          {isCurrent ? 'Active Plan' : 'Select & Join Plan'}
                        </button>
                      </div>
                    </article>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {isModalOpen && selectedTier && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480,
            padding: 36, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative', animation: 'fadeIn 0.2s ease-out',
          }}>
            <button
              type="button"
              aria-label="Close checkout dialog"
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', fontSize: 22, color: '#999', cursor: 'pointer' }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(123,26,45,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7B1A2D', fontWeight: 700, fontSize: 18 }}>
                🔒
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A2A' }}>Secure Checkout</h3>
                <p style={{ fontSize: 13, color: '#666' }}>Powered by Stripe · your plan activates once payment clears</p>
              </div>
            </div>

            <div style={{ background: '#F8F8FA', borderRadius: 16, padding: '16px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, border: '1px solid #EEE' }}>
              <div>
                <div style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>SELECTED TIER</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A2A', marginTop: 2 }}>{selectedTier.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#7B1A2D' }}>{selectedTier.priceDisplay}</div>
                <div style={{ fontSize: 11, color: '#2EC4B6', fontWeight: 600 }}>{(selectedTier.discountrate * 100).toFixed(0)}% Course Discount</div>
              </div>
            </div>

            {checkoutError && (
              <div style={{ fontSize: 13, color: '#8A1C1C', background: 'rgba(196,30,58,0.08)', padding: '12px 14px', borderRadius: 10, marginBottom: 16, border: '1px solid rgba(196,30,58,0.25)', lineHeight: 1.5 }}>
                {checkoutError}
              </div>
            )}

            <button
              type="button"
              onClick={handleStartCheckout}
              disabled={isProcessing}
              style={{ width: '100%', padding: '15px', borderRadius: 30, fontSize: 15, fontWeight: 600, background: isProcessing ? '#999' : '#7B1A2D', color: '#fff', border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
            >
              {isProcessing ? 'Redirecting to Stripe…' : `Pay ${selectedTier.priceDisplay} Securely →`}
            </button>

            <div style={{ fontSize: 12, color: '#888', background: 'rgba(46,196,182,0.08)', padding: '10px 14px', borderRadius: 8, marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span>🛡️</span>
              <span>You&apos;ll be handed over to <strong>Stripe Checkout</strong> — tax is calculated from your billing address, and your card details never touch our servers.</span>
            </div>
          </div>
        </div>
      )}

      <section id="join" style={{ padding: '100px 0', background: '#F8F8FA' }}>
        <div className="container">
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <ScrollReveal>
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Community</span>
                  </div>
                  <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1A1A2A', letterSpacing: '-0.02em' }}>Join the MCU Club</h2>
                  <p style={{ fontSize: 16, color: '#666', lineHeight: 1.7, marginTop: 16 }}>
                    Beyond courses, the MCU Club is a vibrant professional network of over 2,000 financial practitioners across Asia who support each other&apos;s growth.
                  </p>
                </div>
              </ScrollReveal>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {clubBenefits.map((benefit, i) => (
                  <ScrollReveal key={benefit} delay={i * 0.07} threshold={0.05}>
                    <div className="why-item">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E5A52E', flexShrink: 0 }} />
                      <span style={{ fontSize: 15, color: '#444', fontWeight: 500 }}>{benefit}</span>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
              <ScrollReveal>
                <a href="/register" className="btn-gold" style={{ display: 'inline-flex', marginTop: 32 }}>Apply for Club Membership</a>
              </ScrollReveal>
            </div>
            <div>
              <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 20, overflow: 'hidden', background: '#e8e8ec' }}>
                <img
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80"
                  alt="MCU Club"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(event) => { (event.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
