import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mcu-three.vercel.app';
  const routes = ['', '/about', '/departments', '/courses', '/membership', '/partnership', '/shop', '/contact', '/login', '/register'];
  return routes.map((route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: 'weekly', priority: route === '' ? 1 : 0.7 }));
}
