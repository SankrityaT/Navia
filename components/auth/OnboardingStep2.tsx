// FRONTEND: Onboarding Step 2 - Neurotype & EF Profile
// Two multiple-select questions with checkboxes

'use client';

import { useState } from 'react';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface Step2Props {
  onNext: (data: any) => void;
  onBack: () => void;
}

export default function OnboardingStep2({ onNext, onBack }: Step2Props) {
  const [neurotypes, setNeurotypes] = useState({
    adhd: false,
    autism: false,
    dyslexia: false,
    anxiety_depression: false,
    other: false,
    prefer_not_to_say: false,
    not_sure: false,
  });

  const [otherText, setOtherText] = useState('');

  const [efChallenges, setEfChallenges] = useState({
    starting_tasks: false,
    time_management: false,
    organization: false,
    decision_making: false,
    emotional_regulation: false,
    social_interaction: false,
    focus: false,
  });

  const neurotypesOptions = [
    { key: 'adhd', label: 'ADHD' },
    { key: 'autism', label: 'Autism' },
    { key: 'dyslexia', label: 'Dyslexia' },
    { key: 'anxiety_depression', label: 'Anxiety/Depression' },
    { key: 'other', label: 'Other' },
    { key: 'prefer_not_to_say', label: 'Prefer not to say' },
    { key: 'not_sure', label: "Not sure / I'm exploring" },
  ];

  const efOptions = [
    { key: 'starting_tasks', label: 'Starting tasks / Getting started' },
    { key: 'time_management', label: 'Time management / Deadlines' },
    { key: 'organization', label: 'Organization / Remembering details' },
    { key: 'decision_making', label: 'Decision-making / Analysis paralysis' },
    { key: 'emotional_regulation', label: 'Emotional regulation / Stress' },
    { key: 'social_interaction', label: 'Social interaction' },
    { key: 'focus', label: 'Focus / Concentration' },
  ];

  const toggleNeurotype = (key: string) => {
    setNeurotypes({ ...neurotypes, [key]: !neurotypes[key as keyof typeof neurotypes] });
  };

  const toggleEfChallenge = (key: string) => {
    const selectedCount = Object.values(efChallenges).filter(Boolean).length;
    const isCurrentlySelected = efChallenges[key as keyof typeof efChallenges];
    
    // Allow deselecting or selecting if under 3
    if (isCurrentlySelected || selectedCount < 3) {
      setEfChallenges({ ...efChallenges, [key]: !efChallenges[key as keyof typeof efChallenges] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ 
      neurotypes,
      other_neurotype: otherText,
      ef_challenges: efChallenges 
    });
  };

  const selectedEfCount = Object.values(efChallenges).filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <h2 
        className="text-3xl md:text-4xl font-serif font-bold text-[var(--charcoal)] mb-3"
        style={{fontFamily: 'var(--font-fraunces)'}}
      >
        How do you describe yourself?
      </h2>
      <p className="text-[var(--charcoal)]/70 mb-8 text-lg">Pick all that apply</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Neurotype Selection */}
        <div className="space-y-3">
          {neurotypesOptions.map((option) => (
            <div key={option.key}>
              <button
                type="button"
                onClick={() => toggleNeurotype(option.key)}
                className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-3 ${
                  neurotypes[option.key as keyof typeof neurotypes]
                    ? 'border-[var(--clay-500)] bg-[var(--clay-50)]'
                    : 'border-[var(--stone)] hover:border-[var(--clay-300)] bg-[var(--sand)]/40'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    neurotypes[option.key as keyof typeof neurotypes]
                      ? 'border-[var(--clay-500)] bg-[var(--clay-500)]'
                      : 'border-[var(--charcoal)]/30'
                  }`}
                >
                  {neurotypes[option.key as keyof typeof neurotypes] && (
                    <Check className="w-4 h-4 text-[var(--cream)]" strokeWidth={3} />
                  )}
                </div>
                <span className="font-medium text-[var(--charcoal)]">{option.label}</span>
              </button>
              
              {/* Text input for "Other" */}
              {option.key === 'other' && neurotypes.other && (
                <input
                  type="text"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Please specify..."
                  className="w-full mt-2 px-4 py-3 border-2 border-[var(--clay-300)] rounded-xl focus:ring-2 focus:ring-[var(--clay-500)] focus:border-transparent bg-[var(--cream)]"
                />
              )}
            </div>
          ))}
        </div>

        {/* EF Challenges */}
        <div className="pt-4">
          <h3 
            className="text-2xl md:text-3xl font-serif font-bold text-[var(--charcoal)] mb-3"
            style={{fontFamily: 'var(--font-fraunces)'}}
          >
            What's hardest for you?
          </h3>
          <p className="text-[var(--charcoal)]/70 mb-6 text-lg">
            Pick up to 3 {selectedEfCount > 0 && `(${selectedEfCount}/3 selected)`}
          </p>

          <div className="space-y-3">
            {efOptions.map((option) => {
              const isSelected = efChallenges[option.key as keyof typeof efChallenges];
              const isDisabled = !isSelected && selectedEfCount >= 3;
              
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => toggleEfChallenge(option.key)}
                  disabled={isDisabled}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-3 ${
                    isSelected
                      ? 'border-[var(--clay-500)] bg-[var(--clay-50)]'
                      : isDisabled
                      ? 'border-[var(--stone)] bg-[var(--sand)]/20 opacity-50 cursor-not-allowed'
                      : 'border-[var(--stone)] hover:border-[var(--clay-300)] bg-[var(--sand)]/40'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-[var(--clay-500)] bg-[var(--clay-500)]'
                        : 'border-[var(--charcoal)]/30'
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-[var(--cream)]" strokeWidth={3} />
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
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--sand)] hover:bg-[var(--stone)] text-[var(--charcoal)] py-4 rounded-full text-lg font-semibold transition-all duration-300 border-2 border-[var(--clay-300)]/40"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            Back
          </button>
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Continue
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
