import Hero from '@/components/landing/Hero';
import Problem from '@/components/landing/ProblemNew';
import Solution from '@/components/landing/SolutionNew';
import HowItWorks from '@/components/landing/HowItWorksNew';
import CTAFooter from '@/components/landing/CTAFooterNew';

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-[var(--cream)]">
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <CTAFooter />
    </main>
  );
}
