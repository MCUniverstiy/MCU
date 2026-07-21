import SiteLayout from '@/components/SiteLayout';
import Hero from '@/components/Hero';
import StriveSection from '@/components/StriveSection';
import DiffSection from '@/components/DiffSection';
import CoursesSection from '@/components/CoursesSection';
import AchievementsSection from '@/components/AchievementsSection';
import WhySection from '@/components/WhySection';
import TestimonialsSection from '@/components/TestimonialsSection';

export default function Home() {
  return (
    <SiteLayout>
      <Hero />
      <StriveSection />
      <DiffSection />
      <CoursesSection />
      <AchievementsSection />
      <WhySection />
      <TestimonialsSection />
    </SiteLayout>
  );
}
