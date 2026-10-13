import ApplyDialog from '../components/apply/ApplyDialog';
import HeroSection from '../components/hero/HeroSection';
import TeamSection from '../components/team/TeamSection';
import WhatIsGenomiaSection from '../components/what-is-genomia/WhatIsGenomiaSection';
import Footer from '../components/footer/Footer';
import ConoceSection from '../components/conoce/ConoceSection';
import FaqSection from '../components/faq/FaqSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhatIsGenomiaSection />
      <ConoceSection />
      <FaqSection />
      <TeamSection />
      <ApplyDialog />
      <Footer />
    </>
  );
}
