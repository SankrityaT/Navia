// FRONTEND: Onboarding Step 1 - Welcome Screen
// Informational intro with CTA to continue

'use client';

import { ArrowRight } from 'lucide-react';

interface Step1Props {
  onNext: () => void;
}

export default function OnboardingStep1({ onNext }: Step1Props) {
  return (
    <div className="max-w-2xl mx-auto text-center py-8 animate-fade-in-up">
      {/* Emoji Header */}
      <div className="text-7xl mb-8 animate-scale-in delay-200">
        🚀
      </div>

      {/* Main Heading */}
      <h1 
        className="text-5xl md:text-6xl font-serif font-bold text-[var(--charcoal)] mb-6 leading-tight animate-fade-in-up delay-300"
        style={{fontFamily: 'var(--font-fraunces)'}}
      >
        Welcome to Navia
      </h1>

      {/* Body Text */}
      <div className="space-y-4 text-lg md:text-xl text-[var(--charcoal)]/80 mb-12 leading-relaxed animate-fade-in-up delay-400">
        <p className="font-medium">
          You just graduated. That's huge.
        </p>
        <p>
          Now comes the hard part: figuring out what's next.
        </p>
        <p className="pt-4">
          We're here to help. Navia is your AI coach<br />
          for finding a job, managing money, and staying sane.
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={onNext}
        className="group inline-flex items-center gap-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] px-12 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5 animate-scale-in delay-500"
      >
        Continue
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
      </button>
    </div>
  );
}
