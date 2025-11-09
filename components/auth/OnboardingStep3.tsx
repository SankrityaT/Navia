// FRONTEND: Onboarding Step 3 - Current Goals
// Multi-select checkboxes with optional job field dropdown

'use client';

import { useState } from 'react';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface Step3Props {
  onNext: (data: any) => void;
  onBack: () => void;
}

export default function OnboardingStep3({ onNext, onBack }: Step3Props) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [jobField, setJobField] = useState('');

  const goalOptions = [
    { key: 'finding_job', label: 'Finding a job' },
    { key: 'managing_money', label: 'Managing money / Budget' },
    { key: 'getting_organized', label: 'Getting organized / Routines' },
    { key: 'making_friends', label: 'Making friends / Social' },
    { key: 'moving', label: 'Moving / Independent living' },
    { key: 'all_above', label: 'All of the above (jumbled)' },
    { key: 'not_sure', label: 'Not sure yet' },
  ];

  const jobFieldOptions = [
    'Software/Tech',
    'Healthcare',
    'Sales/Marketing',
    'Finance',
    'Education',
    'Other / Not decided',
  ];

  const toggleGoal = (key: string) => {
    if (selectedGoals.includes(key)) {
      setSelectedGoals(selectedGoals.filter(g => g !== key));
    } else {
      setSelectedGoals([...selectedGoals, key]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGoals.length === 0) return;
    
    onNext({ 
      current_goals: selectedGoals,
      job_field: selectedGoals.includes('finding_job') ? jobField : null
    });
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <h2 
        className="text-3xl md:text-4xl font-serif font-bold text-[var(--charcoal)] mb-3"
        style={{fontFamily: 'var(--font-fraunces)'}}
      >
        What are you focused on right now?
      </h2>
      <p className="text-[var(--charcoal)]/70 mb-8 text-lg">
        Pick all that apply {selectedGoals.length > 0 && `(${selectedGoals.length} selected)`}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Options */}
        <div className="space-y-3">
          {goalOptions.map((option) => {
            const isSelected = selectedGoals.includes(option.key);
            
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => toggleGoal(option.key)}
                className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-3 ${
                  isSelected
                    ? 'border-[var(--clay-500)] bg-[var(--clay-50)]'
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

        {/* Job Field Dropdown - Show only if "Finding a job" is selected */}
        {selectedGoals.includes('finding_job') && (
          <div className="pt-4 animate-fade-in-up">
            <label className="block text-lg font-medium text-[var(--charcoal)] mb-3">
              What field? <span className="text-[var(--charcoal)]/60 font-normal">(Optional)</span>
            </label>
            <select
              value={jobField}
              onChange={(e) => setJobField(e.target.value)}
              className="w-full px-4 py-4 border-2 border-[var(--clay-300)] rounded-2xl focus:ring-2 focus:ring-[var(--clay-500)] focus:border-transparent bg-[var(--cream)] text-[var(--charcoal)] font-medium"
            >
              <option value="">Select a field...</option>
              {jobFieldOptions.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>
        )}

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
            disabled={selectedGoals.length === 0}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Continue
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
