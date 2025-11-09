import Hero from '@/components/landing/Hero';
import Problem from '@/components/landing/Problem';
import Solution from '@/components/landing/Solution';
import CTAFooter from '@/components/landing/CTAFooter';

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <Solution />
      <CTAFooter />
    </main>
  );
}
