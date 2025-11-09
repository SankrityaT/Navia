// FRONTEND: Onboarding Step 5 - Interests & What You're Looking For (Optional)
// Allows users to customize their peer matching profile

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Check } from 'lucide-react';

interface Step5Props {
  onNext: (data: any) => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function OnboardingStep5({ onNext, onBack, onSkip }: Step5Props) {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedSeeking, setSelectedSeeking] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interestOptions = [
    { key: 'productivity_tools', label: 'Productivity tools & apps' },
    { key: 'body_doubling', label: 'Body doubling / Co-working' },
    { key: 'mental_health', label: 'Mental health & wellness' },
    { key: 'career_development', label: 'Career development' },
    { key: 'creative_hobbies', label: 'Creative hobbies' },
    { key: 'fitness_health', label: 'Fitness & health' },
    { key: 'gaming', label: 'Gaming' },
    { key: 'reading_books', label: 'Reading & books' },
    { key: 'music', label: 'Music' },
    { key: 'cooking', label: 'Cooking' },
    { key: 'travel', label: 'Travel' },
    { key: 'pets', label: 'Pets' },
  ];

  const seekingOptions = [
    { key: 'accountability_partner', label: 'Accountability partner' },
    { key: 'peer_support', label: 'General peer support' },
    { key: 'career_guidance', label: 'Career guidance' },
    { key: 'job_search_support', label: 'Job search help' },
    { key: 'budgeting_help', label: 'Budgeting & money management' },
    { key: 'organization_tips', label: 'Organization & planning tips' },
    { key: 'social_support', label: 'Social skills & friendship' },
    { key: 'emotional_support', label: 'Emotional support' },
    { key: 'task_initiation_support', label: 'Help starting tasks' },
    { key: 'time_management_tips', label: 'Time management strategies' },
  ];

  const toggleInterest = (key: string) => {
    if (selectedInterests.includes(key)) {
      setSelectedInterests(selectedInterests.filter(i => i !== key));
    } else if (selectedInterests.length < 8) {
      setSelectedInterests([...selectedInterests, key]);
    }
  };

  const toggleSeeking = (key: string) => {
    if (selectedSeeking.includes(key)) {
      setSelectedSeeking(selectedSeeking.filter(i => i !== key));
    } else if (selectedSeeking.length < 6) {
      setSelectedSeeking([...selectedSeeking, key]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await onNext({ 
      interests: selectedInterests,
      seeking: selectedSeeking,
    });
    
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    await onSkip();
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--sage-100)] rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-[var(--sage-600)]" />
          <span className="text-sm text-[var(--sage-700)] font-medium">Optional - Improve your matches</span>
        </div>
        <h2 
          className="text-3xl md:text-4xl font-serif font-bold text-[var(--charcoal)] mb-3"
          style={{fontFamily: 'var(--font-fraunces)'}}
        >
          Help us find your perfect match
        </h2>
        <p className="text-[var(--charcoal)]/70 text-lg">
          Share your interests and what you're looking for (or skip to use smart defaults)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Interests */}
        <div>
          <h3 className="text-xl font-serif font-bold text-[var(--charcoal)] mb-3">
            Your interests {selectedInterests.length > 0 && `(${selectedInterests.length}/8)`}
          </h3>
          <p className="text-[var(--charcoal)]/60 text-sm mb-4">Pick up to 8 things you enjoy</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {interestOptions.map((option) => {
              const isSelected = selectedInterests.includes(option.key);
              const isDisabled = !isSelected && selectedInterests.length >= 8;
              
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => toggleInterest(option.key)}
                  disabled={isDisabled}
                  className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 text-sm ${
                    isSelected
                      ? 'border-[var(--clay-500)] bg-[var(--clay-50)]'
                      : isDisabled
                      ? 'border-[var(--stone)] bg-[var(--sand)]/20 opacity-50 cursor-not-allowed'
                      : 'border-[var(--stone)] hover:border-[var(--clay-300)] bg-[var(--sand)]/40'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? 'border-[var(--clay-500)] bg-[var(--clay-500)]'
                        : 'border-[var(--charcoal)]/30'
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-[var(--cream)]" strokeWidth={3} />
                    )}
                  </div>
                  <span className="font-medium text-[var(--charcoal)]">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* What You're Seeking */}
        <div>
          <h3 className="text-xl font-serif font-bold text-[var(--charcoal)] mb-3">
            What you're looking for {selectedSeeking.length > 0 && `(${selectedSeeking.length}/6)`}
          </h3>
          <p className="text-[var(--charcoal)]/60 text-sm mb-4">Pick up to 6 types of support</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {seekingOptions.map((option) => {
              const isSelected = selectedSeeking.includes(option.key);
              const isDisabled = !isSelected && selectedSeeking.length >= 6;
              
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => toggleSeeking(option.key)}
                  disabled={isDisabled}
                  className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 text-sm ${
                    isSelected
                      ? 'border-[var(--clay-500)] bg-[var(--clay-50)]'
                      : isDisabled
                      ? 'border-[var(--stone)] bg-[var(--sand)]/20 opacity-50 cursor-not-allowed'
                      : 'border-[var(--stone)] hover:border-[var(--clay-300)] bg-[var(--sand)]/40'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? 'border-[var(--clay-500)] bg-[var(--clay-500)]'
                        : 'border-[var(--charcoal)]/30'
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-[var(--cream)]" strokeWidth={3} />
                    )}
                  </div>
                  <span className="font-medium text-[var(--charcoal)]">{option.label}</span>
                </button>
              );
            })}
          </div>
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
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--stone)] hover:bg-[var(--charcoal)]/20 text-[var(--charcoal)] py-4 rounded-full text-lg font-semibold transition-all duration-300 border-2 border-[var(--clay-300)]/40 disabled:opacity-50"
          >
            Skip (Use Defaults)
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
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
