'use client';

import { useEffect, useState } from 'react';
import SiteLayout from '@/components/SiteLayout';
import PageHero from '@/components/PageHero';
import ScrollReveal from '@/components/ScrollReveal';
import { TruckIcon, LockIcon, ReturnIcon, ChatIcon } from '@/components/Icons';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { getCart, saveCart, type CartItem } from '@/lib/cart';

type Product = { productid: number; title: string; category: string | null; price: string; image_url: string | null; description: string | null; badge: string | null; badge_color: string | null };

const shopInfo = [
  { icon: TruckIcon, title: 'Free Delivery', desc: 'On all physical orders over HK$500' },
  { icon: LockIcon, title: 'Secure Checkout', desc: 'SSL encrypted payment processing' },
  { icon: ReturnIcon, title: '14-Day Returns', desc: 'For unopened physical products' },
  { icon: ChatIcon, title: 'Support', desc: 'Mon–Fri 9am–6pm HKT' },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  useEffect(() => setCart(getCart()), []);
  function addToCart(product: Product) {
    const next = [...cart]; const found = next.find((item) => item.productid === product.productid);
    if (found) found.quantity += 1; else next.push({ productid: product.productid, title: product.title, price: product.price, image_url: product.image_url, quantity: 1 });
    setCart(next); saveCart(next); setMessage(`${product.title} added to your cart.`);
  }

  useEffect(() => {
    async function loadProducts() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('productid, title, category, price, image_url, description, badge, badge_color')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      if (error) setMessage('Products are temporarily unavailable. Please try again later.');
      else setProducts((data || []) as Product[]);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter((x): x is string => Boolean(x))))];
  const visible = category === 'All' ? products : products.filter((p) => p.category === category);

  return <SiteLayout>
    <div style={{ paddingTop: 68 }}>
      <PageHero title="MCU Institute Shop" subtitle="Resources & Materials" description="Study materials, course access packages, and professional resources to support your learning journey." bgImage="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80" />
    </div>
    <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '20px 0' }}>
      <div className="container" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}><Link href="/checkout" style={{ marginLeft: 'auto', padding: '9px 16px', borderRadius: 22, background: '#7B1A2D', color: '#fff', fontWeight: 700, fontSize: 13 }}>Cart ({cart.reduce((n, item) => n + item.quantity, 0)}) →</Link>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#999' }}>Filter:</span>
        {categories.map((item) => <button key={item} onClick={() => setCategory(item)} style={{ padding: '6px 16px', borderRadius: 30, fontSize: 13, background: category === item ? '#7B1A2D' : '#fff', color: category === item ? '#fff' : '#666', border: `1.5px solid ${category === item ? '#7B1A2D' : 'rgba(0,0,0,0.1)'}` }}>{item}</button>)}
      </div>
    </div>
    <section style={{ padding: '80px 0', background: '#F8F8FA' }}><div className="container">
      {loading && <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading products…</div>}
      {!loading && message && <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>{message}</div>}
      {!loading && !message && visible.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>No products are available yet.</div>}
      {!loading && !message && visible.length > 0 && <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 28 }}>
        {visible.map((product, i) => <ScrollReveal key={product.productid} delay={i * 0.05} threshold={0.1}><article style={{ borderRadius: 16, background: '#fff', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', aspectRatio: '4/3', background: '#e8e8ec', overflow: 'hidden' }}>{product.image_url && <img src={product.image_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}{product.badge && <span style={{ position: 'absolute', top: 12, left: 12, background: product.badge_color || '#E5A52E', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase' }}>{product.badge}</span>}</div>
          <div style={{ padding: '20px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 11, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', marginBottom: 6 }}>{product.category || 'Product'}</span><h2 style={{ fontSize: 17, color: '#1A1A2A', marginBottom: 8 }}>{product.title}</h2><p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, flex: 1 }}>{product.description}</p><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: 16, marginTop: 16 }}><strong style={{ fontSize: 20 }}>{product.price}</strong><button onClick={() => addToCart(product)} style={{ padding: '8px 18px', borderRadius: 30, background: '#E5A52E', color: '#fff', fontWeight: 600 }}>Add to Cart</button></div></div>
        </article></ScrollReveal>)}
      </div>}
    </div></section>
    <section style={{ padding: '60px 0', background: '#fff' }}><div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32, textAlign: 'center' }}>{shopInfo.map(({ icon: Icon, title, desc }) => <div key={title}><Icon size={32} color="#7B1A2D" /><div style={{ fontWeight: 600, margin: '10px 0 6px' }}>{title}</div><div style={{ fontSize: 13, color: '#666' }}>{desc}</div></div>)}</div></section>
  </SiteLayout>;
}
