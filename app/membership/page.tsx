'use client';

import { useState, useEffect } from 'react';
import SiteLayout from '@/components/SiteLayout';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import { createClient } from '@/lib/supabase/client';

interface TierItem {
  membid: number;
  name: string;
  price: string;
  period: string;
  color: string;
  discountrate: number;
  features: string[];
  highlight: boolean;
}

const fallbackTiers: TierItem[] = [
  {
    membid: 10001,
    name: 'Standard',
    price: 'HK$1,200',
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
    membid: 10002,
    name: 'Professional',
    price: 'HK$3,800',
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
    membid: 10003,
    name: 'Premium',
    price: 'HK$8,800',
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
  const [currentMembid, setCurrentMembid] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  useEffect(() => {
    async function loadTiersAndUser() {
      try {
        const supabase = createClient();
        
        // Load current logged-in user membership
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('membid')
            .eq('id', user.id)
            .single();
          if (profile?.membid) {
            setCurrentMembid(profile.membid);
          }
        }

        // Load membership tiers from Supabase
        const { data: dbTiers, error } = await supabase
          .from('membershiptiers')
          .select('*');

        if (!error && dbTiers && dbTiers.length > 0) {
          const mapped: TierItem[] = dbTiers.map((t: Record<string, unknown>, idx: number) => ({
            membid: t.membid as number,
            name: (t.membname as string) || (t.tiers as string) || 'Member Tier',
            price: t.discountrate ? `Discount ${(Number(t.discountrate) * 100).toFixed(0)}%` : 'Standard Price',
            period: '',
            color: idx === 1 ? '#7B1A2D' : idx === 2 ? '#E5A52E' : '#2EC4B6',
            discountrate: Number(t.discountrate) || 0,
            features: [
              `Member Tier: ${t.tiers || t.membname}`,
              `Discount Rate: ${((Number(t.discountrate) || 0) * 100).toFixed(0)}% off courses`,
              'Access to community webinars',
              'Digital membership certificate'
            ],
            highlight: idx === 1,
          }));
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

  const handleJoinTier = async (membid: number) => {
    try {
      setJoiningId(membid);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login?redirect=/membership';
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({ membid })
        .eq('id', user.id);

      if (error) {
        alert('Could not update membership: ' + error.message);
      } else {
        setCurrentMembid(membid);
        alert('Membership tier updated successfully!');
      }
    } catch {
      alert('An unexpected error occurred.');
    } finally {
      setJoiningId(null);
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
                const isCurrent = currentMembid === tier.membid;
                return (
                  <ScrollReveal key={tier.membid || i} delay={i * 0.1} threshold={0.1}>
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
                          <span style={{ fontSize: 36, fontWeight: 700, color: tier.highlight ? '#E5A52E' : tier.color }}>{tier.price}</span>
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
                          onClick={() => handleJoinTier(tier.membid)}
                          disabled={isCurrent || joiningId === tier.membid}
                          style={{
                            width: '100%', border: 'none', cursor: isCurrent ? 'default' : 'pointer',
                            textAlign: 'center', marginTop: 32, padding: '14px 24px', borderRadius: 30,
                            fontSize: 15, fontWeight: 600,
                            background: isCurrent ? '#2EC4B6' : tier.highlight ? '#E5A52E' : tier.color,
                            color: '#fff', opacity: joiningId === tier.membid ? 0.7 : 1, transition: 'all 0.3s',
                          }}
                        >
                          {isCurrent ? 'Current Plan' : joiningId === tier.membid ? 'Updating...' : 'Select Plan'}
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
