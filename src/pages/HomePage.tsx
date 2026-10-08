import ApplyDialog from '../components/apply/ApplyDialog';
import HeroSection from '../components/hero/HeroSection';
import TeamSection from '../components/team/TeamSection';
import WhatIsGenomiaSection from '../components/what-is-genomia/WhatIsGenomiaSection';
import Footer from '../components/footer/Footer';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhatIsGenomiaSection />
      <TeamSection />
      <ApplyDialog />
      <Footer />
    </>
  );
}
