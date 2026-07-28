'use client';

import { useState, useEffect } from 'react';
import SiteLayout from '@/components/SiteLayout';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import { createClient } from '@/lib/supabase/client';

interface TierItem {
  tierid: number;
  name: string;
  priceDisplay: string;
  amount: number;
  period: string;
  color: string;
  discountrate: number;
  features: string[];
  highlight: boolean;
}

const fallbackTiers: TierItem[] = [
  {
    tierid: 1,
    name: 'Standard',
    priceDisplay: 'HK$1,200',
    amount: 1200,
    period: '/ year',
    color: '#2EC4B6',
    discountrate: 0.10,
    features: [
      'Access to monthly webinars',
      'MCU Institute newsletter',
      'Member directory access',
      'Discounted course enrollment (10%)',
      'Digital membership certificate',
    ],
    highlight: false,
  },
  {
    tierid: 2,
    name: 'Professional',
    priceDisplay: 'HK$3,800',
    amount: 3800,
    period: '/ year',
    color: '#7B1A2D',
    discountrate: 0.20,
    features: [
      'All Standard benefits',
      'Quarterly in-person networking events',
      'Priority course registration',
      'Discounted course enrollment (20%)',
      'CPD point tracking portal',
      'Members-only research reports',
      'Mentor matching program',
    ],
    highlight: true,
  },
  {
    tierid: 3,
    name: 'Premium',
    priceDisplay: 'HK$8,800',
    amount: 8800,
    period: '/ year',
    color: '#E5A52E',
    discountrate: 0.30,
    features: [
      'All Professional benefits',
      'One complimentary short course per year',
      'VIP access to annual conference',
      'Discounted course enrollment (30%)',
      'Personal academic advisor',
      'Board member voting rights',
      'Featured in member spotlight',
    ],
    highlight: false,
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

export default function MembershipPage() {
  const [tiersList, setTiersList] = useState<TierItem[]>(fallbackTiers);
  const [currentTierid, setCurrentTierid] = useState<number | null>(null);
  const [memberId, setMemberId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<TierItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardName, setCardName] = useState('Member Account');

  useEffect(() => {
    async function loadTiersAndUser() {
      try {
        const supabase = createClient();
        
        // Fetch current user and active membership tier
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('tierid, memberid, first_name, last_name')
            .eq('id', user.id)
            .single();

          if (profile) {
            if (profile.tierid) setCurrentTierid(profile.tierid);
            if (profile.memberid) setMemberId(profile.memberid);
            if (profile.first_name || profile.last_name) {
              setCardName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
            }
          }
        }

        // Fetch database membership tiers
        const { data: dbTiers, error } = await supabase
          .from('membershiptiers')
          .select('*');

        if (!error && dbTiers && dbTiers.length > 0) {
          const mapped: TierItem[] = dbTiers.map((t: Record<string, unknown>, idx: number) => {
            const discount = Number(t.discountrate) || 0;
            const priceVal = idx === 0 ? 1200 : idx === 1 ? 3800 : 8800;
            return {
              tierid: t.tierid as number,
              name: (t.membname as string) || (t.tiers as string) || `Tier ${t.tierid}`,
              priceDisplay: `HK$${priceVal.toLocaleString()}`,
              amount: priceVal,
              period: '/ year',
              color: idx === 1 ? '#7B1A2D' : idx === 2 ? '#E5A52E' : '#2EC4B6',
              discountrate: discount,
              features: [
                `Official ${t.tiers || t.membname} Membership`,
                `Automatic ${(discount * 100).toFixed(0)}% discount on course enrollments`,
                'Access to members-only portal',
                'CPD certificate eligibility',
                'Priority event invitations'
              ],
              highlight: idx === 1,
            };
          });
          setTiersList(mapped);
        }
      } catch (err) {
        console.warn('Using default fallback tiers:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTiersAndUser();
  }, []);

  const handleOpenPaymentModal = async (tier: TierItem) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/login?redirect=/membership';
      return;
    }

    setSelectedTier(tier);
    setPaymentSuccess(false);
    setIsModalOpen(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    setIsProcessing(true);

    try {
      // Simulate real bank processing delay
      await new Promise((res) => setTimeout(res, 1500));

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Update users table in Supabase.
      // The DB trigger assigns a memberid automatically on first join,
      // so we select it back to display the new membership number.
      const { data: updated, error } = await supabase
        .from('users')
        .update({ tierid: selectedTier.tierid })
        .eq('id', user.id)
        .select('memberid')
        .single();

      if (error) {
        throw error;
      }

      if (updated?.memberid) setMemberId(updated.memberid);
      setCurrentTierid(selectedTier.tierid);
      setPaymentSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      alert('Payment execution failed: ' + msg);
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
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
                <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Plans</span>
                <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
              </div>
              <h2 style={{ fontSize: 38, fontWeight: 700, color: '#1A1A2A', letterSpacing: '-0.02em' }}>Membership Tiers</h2>
              <p style={{ fontSize: 16, color: '#666', marginTop: 16, maxWidth: 500, margin: '16px auto 0' }}>
                Choose the plan that best fits your career stage and professional goals.
              </p>
            </div>
          </ScrollReveal>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
              Loading membership tiers from Supabase...
            </div>
          ) : (
            <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, alignItems: 'start' }}>
              {tiersList.map((tier, i) => {
                const isCurrent = currentTierid === tier.tierid;
                return (
                  <ScrollReveal key={tier.tierid || i} delay={i * 0.1} threshold={0.1}>
                    <div style={{
                      borderRadius: 20, background: tier.highlight ? '#7B1A2D' : '#fff',
                      border: `2px solid ${isCurrent ? '#2EC4B6' : tier.highlight ? '#7B1A2D' : 'rgba(0,0,0,0.08)'}`,
                      overflow: 'hidden', boxShadow: tier.highlight ? '0 20px 60px rgba(123,26,45,0.25)' : '0 2px 20px rgba(0,0,0,0.06)',
                      position: 'relative', transition: 'all 0.3s',
                    }}>
                      {isCurrent && (
                        <div style={{ background: '#2EC4B6', textAlign: 'center', padding: '8px', fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          ✓ Your Active Plan
                        </div>
                      )}
                      {!isCurrent && tier.highlight && (
                        <div style={{ background: '#E5A52E', textAlign: 'center', padding: '8px', fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          Most Popular
                        </div>
                      )}
                      <div style={{ height: 4, background: tier.color }} />
                      <div style={{ padding: 36 }}>
                        <h3 style={{ fontSize: 22, fontWeight: 700, color: tier.highlight ? '#fff' : '#1A1A2A' }}>{tier.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 16, marginBottom: 32 }}>
                          <span style={{ fontSize: 36, fontWeight: 700, color: tier.highlight ? '#E5A52E' : tier.color }}>{tier.priceDisplay}</span>
                          <span style={{ fontSize: 14, color: tier.highlight ? 'rgba(255,255,255,0.6)' : '#999' }}>{tier.period}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {tier.features.map((f, j) => (
                            <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                              <div style={{ width: 18, height: 18, borderRadius: '50%', background: tier.color + (tier.highlight ? 'ff' : '20'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                <span style={{ fontSize: 10, color: tier.highlight ? '#fff' : tier.color, fontWeight: 700 }}>✓</span>
                              </div>
                              <span style={{ fontSize: 14, color: tier.highlight ? 'rgba(255,255,255,0.85)' : '#555', lineHeight: 1.5 }}>{f}</span>
                            </div>
                          ))}
                        </div>
                        <button
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
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* MOCK PAYMENT MODAL */}
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
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute', top: 20, right: 20, background: 'none', border: 'none',
                fontSize: 22, color: '#999', cursor: 'pointer',
              }}
            >
              ✕
            </button>

            {paymentSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', background: 'rgba(46,196,182,0.15)',
                  color: '#2EC4B6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 36, margin: '0 auto 20px',
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A2A', marginBottom: 10 }}>
                  Payment Successful!
                </h3>
                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>
                  Congratulations! You are now officially upgraded to the <strong>{selectedTier.name} Membership Tier</strong>.
                </p>

                <div style={{
                  background: '#F8F8FA', borderRadius: 12, padding: '16px 20px', textAlign: 'left',
                  fontSize: 13, color: '#444', marginBottom: 28, border: '1px solid #EEE'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>Member ID:</span>
                    <strong>#{memberId ?? '—'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>Tier:</span>
                    <strong>{selectedTier.name} (Tier {selectedTier.tierid})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>Status:</span>
                    <strong style={{ color: '#2EC4B6' }}>Saved to Supabase `users.tierid`</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Course Discount:</span>
                    <strong>{(selectedTier.discountrate * 100).toFixed(0)}% Off</strong>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 30, background: '#7B1A2D',
                    color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer',
                  }}
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: 'rgba(123,26,45,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7B1A2D',
                    fontWeight: 700, fontSize: 18,
                  }}>
                    💳
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A2A' }}>Mock Checkout</h3>
                    <p style={{ fontSize: 13, color: '#666' }}>Testing Supabase `membershiptiers` Integration</p>
                  </div>
                </div>

                <div style={{
                  background: '#F8F8FA', borderRadius: 16, padding: '16px 20px', marginBottom: 24,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #EEE',
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>SELECTED TIER</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A2A', marginTop: 2 }}>
                      {selectedTier.name} Plan
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#7B1A2D' }}>
                      {selectedTier.priceDisplay}
                    </div>
                    <div style={{ fontSize: 11, color: '#2EC4B6', fontWeight: 600 }}>
                      {(selectedTier.discountrate * 100).toFixed(0)}% Course Discount
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Cardholder Name</label>
                    <input
                      type="text" required value={cardName} onChange={(e) => setCardName(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 14px', fontSize: 14, borderRadius: 10,
                        border: '1.5px solid #DDD', outline: 'none', background: '#fff',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Card Number (Mock Test Card)</label>
                    <input
                      type="text" required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 14px', fontSize: 14, borderRadius: 10,
                        border: '1.5px solid #DDD', outline: 'none', background: '#fff',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Expiry Date</label>
                      <input
                        type="text" required value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)}
                        style={{
                          width: '100%', padding: '12px 14px', fontSize: 14, borderRadius: 10,
                          border: '1.5px solid #DDD', outline: 'none', background: '#fff',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>CVC</label>
                      <input
                        type="text" required value={cardCvc} onChange={(e) => setCardCvc(e.target.value)}
                        style={{
                          width: '100%', padding: '12px 14px', fontSize: 14, borderRadius: 10,
                          border: '1.5px solid #DDD', outline: 'none', background: '#fff',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{
                    fontSize: 12, color: '#888', background: 'rgba(229,165,46,0.1)', padding: '10px 14px',
                    borderRadius: 8, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span>💡</span>
                    <span>This is a <strong>mock payment sandbox</strong>. No real credit card will be charged.</span>
                  </div>

                  <button
                    type="submit" disabled={isProcessing}
                    style={{
                      width: '100%', padding: '15px', borderRadius: 30, fontSize: 15, fontWeight: 600,
                      background: isProcessing ? '#999' : '#7B1A2D', color: '#fff', border: 'none',
                      cursor: isProcessing ? 'not-allowed' : 'pointer', marginTop: 12, transition: 'all 0.2s',
                    }}
                  >
                    {isProcessing ? 'Processing Payment & Saving to Table...' : `Pay ${selectedTier.priceDisplay} & Activate Plan`}
                  </button>
                </form>
              </>
            )}
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
                {clubBenefits.map((b, i) => (
                  <ScrollReveal key={i} delay={i * 0.07} threshold={0.05}>
                    <div className="why-item">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E5A52E', flexShrink: 0 }} />
                      <span style={{ fontSize: 15, color: '#444', fontWeight: 500 }}>{b}</span>
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
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}