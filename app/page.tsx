import { Controls } from '@/components/controls';
import { Hero } from '@/components/hero';
import { HowItWorks } from '@/components/how-it-works';
import { InstallCta } from '@/components/install-cta';
import { PrivacySection } from '@/components/privacy-section';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { TheShift } from '@/components/the-shift';

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <TheShift />
        <HowItWorks />
        <Controls />
        <PrivacySection />
        <InstallCta />
      </main>
      <SiteFooter />
    </>
  );
}
