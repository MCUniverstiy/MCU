'use client';
import Link from 'next/link';
import SiteLayout from '@/components/SiteLayout';
import AdminGuard from '@/components/AdminGuard';

const cards = [
  ['🛍️','Shop products','Create products, prices, descriptions, badges and photos','/admin/cms/products'],
  ['📚','Courses','Manage course titles, headings, descriptions, prices, metadata and photos','/admin/cms/courses'],
  ['👨‍🏫','Instructors','Add instructor names, bios and profile photos','/admin/cms/instructors'],
  ['📨','Enquiries','Read and manage contact form enquiries','/admin/enquiries'],
  ['👥','Students','View students, enrollments, grades and certificates','/admin/students'],
  ['✅','Grades','Manage student results and certificates','/admin/grades'],
];
export default function CMSPage() { return <AdminGuard><SiteLayout><main style={{ padding: '140px 24px 90px', background:'#F8F8FA', minHeight:'80vh' }}><div className="container"><p style={{color:'#7B1A2D',fontWeight:700}}>ADMINISTRATION</p><h1 style={{fontSize:38,color:'#1A1A2A'}}>Content Manager</h1><p style={{color:'#666',margin:'10px 0 35px'}}>Update website content without editing code.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>{cards.map(([icon,title,desc,href])=><Link key={href} href={href} style={{background:'#fff',padding:26,borderRadius:16,border:'1px solid #eee',textDecoration:'none'}}><div style={{fontSize:32}}>{icon}</div><h2 style={{fontSize:20,color:'#1A1A2A',margin:'14px 0 8px'}}>{title}</h2><p style={{fontSize:14,color:'#666',lineHeight:1.5}}>{desc}</p><strong style={{display:'block',marginTop:18,color:'#7B1A2D'}}>Manage →</strong></Link>)}</div></div></main></SiteLayout></AdminGuard>; }
