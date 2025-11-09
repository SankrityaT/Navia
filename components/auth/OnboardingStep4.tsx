// FRONTEND: Onboarding Step 4 - Graduation Timeline
// Dropdown selection then saves and redirects to dashboard

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface Step4Props {
  onNext: (data: any) => void;
  onBack: () => void;
}

export default function OnboardingStep4({ onNext, onBack }: Step4Props) {
  const router = useRouter();
  const [graduationTimeline, setGraduationTimeline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timelineOptions = [
    'Graduating this year',
    '3-6 months ago',
    '6-12 months ago',
    '1-2 years ago',
    '2+ years ago',
    'Never went to college',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!graduationTimeline) return;
    
    setIsSubmitting(true);
    
    // Pass data to parent which will save to backend
    await onNext({ graduation_timeline: graduationTimeline });
    
    // Redirect to dashboard after short delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <h2 
        className="text-3xl md:text-4xl font-serif font-bold text-[var(--charcoal)] mb-3"
        style={{fontFamily: 'var(--font-fraunces)'}}
      >
        When did you graduate?
      </h2>
      <p className="text-[var(--charcoal)]/70 mb-8 text-lg">This helps us tailor your experience</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropdown */}
        <div>
          <select
            value={graduationTimeline}
            onChange={(e) => setGraduationTimeline(e.target.value)}
            className="w-full px-5 py-5 border-2 border-[var(--clay-300)] rounded-2xl focus:ring-2 focus:ring-[var(--clay-500)] focus:border-transparent bg-[var(--cream)] text-[var(--charcoal)] font-medium text-lg"
            required
          >
            <option value="">Select your graduation timeline...</option>
            {timelineOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--sand)] hover:bg-[var(--stone)] text-[var(--charcoal)] py-4 rounded-full text-lg font-semibold transition-all duration-300 border-2 border-[var(--clay-300)]/40 disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            Back
          </button>
          <button
            type="submit"
            disabled={!graduationTimeline || isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                Setting up...
              </>
            ) : (
              <>
                Complete
                <Sparkles className="w-5 h-5" strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
