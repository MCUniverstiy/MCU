'use client';

import SiteLayout from '@/components/SiteLayout';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import { MapPinIcon, PhoneIcon, MailIcon, ClockIcon, CheckCircleIcon } from '@/components/Icons';
import { useState } from 'react';

const offices = [
  { icon: MapPinIcon, label: 'Address', value: '25/F, 88 Lockhart Road, Wanchai, Hong Kong' },
  { icon: PhoneIcon, label: 'Phone', value: '+(852) 2383 3232' },
  { icon: MailIcon, label: 'Email', value: 'info@mcuinstitute.com' },
  { icon: ClockIcon, label: 'Office Hours', value: 'Mon\u2013Fri: 9:00 am \u2013 6:00 pm' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 18px', fontSize: 15, borderRadius: 10,
    border: '1.5px solid rgba(0,0,0,0.12)', outline: 'none', background: '#fff',
    fontFamily: 'DM Sans, sans-serif', color: '#1A1A2A', transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 8, display: 'block', letterSpacing: '0.02em',
  };

  return (
    <SiteLayout>
      <div style={{ paddingTop: 68 }}>
        <PageHero
          title="Get In Touch"
          subtitle="Contact Us"
          description="We'd love to hear from you. Reach out for course enquiries, partnership discussions, or general questions."
          bgImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
        />
      </div>

      <section style={{ padding: '100px 0', background: '#fff' }}>
        <div className="container">
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>

            <div>
              <ScrollReveal>
                <div style={{ marginBottom: 40 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Send a Message</span>
                  </div>
                  <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1A1A2A', letterSpacing: '-0.02em' }}>We&apos;ll Get Back to You</h2>
                </div>
              </ScrollReveal>

              {submitted ? (
                <ScrollReveal>
                  <div style={{ padding: 40, borderRadius: 16, background: '#F8F8FA', border: '1px solid rgba(46,196,182,0.3)', textAlign: 'center' }}>
                    <div style={{ marginBottom: 16 }}><CheckCircleIcon size={48} color="#2EC4B6" /></div>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2A', marginBottom: 8 }}>Message Sent!</h3>
                    <p style={{ fontSize: 15, color: '#666' }}>Thank you for reaching out. Our team will respond within one business day.</p>
                  </div>
                </ScrollReveal>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input required type="text" placeholder="John Chan" style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onFocus={(e) => { e.target.style.borderColor = '#7B1A2D'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address *</label>
                      <input required type="email" placeholder="john@example.com" style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} onFocus={(e) => { e.target.style.borderColor = '#7B1A2D'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; }} />
                    </div>
                  </div>
                  <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <label style={labelStyle}>Phone Number</label>
                      <input type="tel" placeholder="+(852) 0000 0000" style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} onFocus={(e) => { e.target.style.borderColor = '#7B1A2D'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Subject *</label>
                      <select required style={{ ...inputStyle, cursor: 'pointer' }} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} onFocus={(e) => { e.target.style.borderColor = '#7B1A2D'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; }}>
                        <option value="">Select a subject...</option>
                        <option>Course Enquiry</option>
                        <option>Partnership</option>
                        <option>Membership</option>
                        <option>Corporate Training</option>
                        <option>General Question</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Message *</label>
                    <textarea required rows={6} placeholder="Tell us how we can help..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} onFocus={(e) => { e.target.style.borderColor = '#7B1A2D'; }} onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; }} />
                  </div>
                  <button type="submit" className="btn-gold" style={{ justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                    Send Message →
                  </button>
                </form>
              )}
            </div>

            <div>
              <ScrollReveal>
                <div style={{ marginBottom: 40 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Find Us</span>
                  </div>
                  <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1A1A2A', letterSpacing: '-0.02em' }}>Our Office</h2>
                </div>
              </ScrollReveal>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
                {offices.map((o, i) => (
                  <ScrollReveal key={i} delay={i * 0.08} threshold={0.05}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12, background: 'rgba(123,26,45,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <o.icon size={20} color="#7B1A2D" />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{o.label}</div>
                        <div style={{ fontSize: 15, color: '#444', lineHeight: 1.6 }}>{o.value}</div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal>
                <div style={{
                  width: '100%', aspectRatio: '4/3', borderRadius: 16, overflow: 'hidden',
                  background: '#e8e8ec', position: 'relative',
                }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.8!2d114.173!3d22.277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3404007b7a3d3a45%3A0x3db891e2b4a96e70!2s88%20Lockhart%20Rd%2C%20Wan%20Chai%2C%20Hong%20Kong!5e0!3m2!1sen!2shk!4v1"
                    width="100%"
                    height="100%"
                    style={{ border: 0, position: 'absolute', inset: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="MCU Institute Location"
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}