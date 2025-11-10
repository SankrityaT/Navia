import Hero from '@/components/landing/Hero';
import Problem from '@/components/landing/ProblemNew';
import HowItWorks from '@/components/landing/HowItWorksNew';
import Pricing from '@/components/landing/Pricing';
import CTAFooter from '@/components/landing/CTAFooterNew';

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-[var(--cream)]">
      <Hero />
      <Problem />
      <HowItWorks />
      <Pricing />
      <CTAFooter />
    </main>
  );
}
