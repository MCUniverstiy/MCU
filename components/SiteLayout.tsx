import NavBar from './NavBar';
import Footer from './Footer';
import { ReactNode } from 'react';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NavBar />
      <main id="main-content" style={{ paddingTop: 0 }}>{children}</main>
      <Footer />
    </>
  );
}
