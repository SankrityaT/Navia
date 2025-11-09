// FRONTEND: Onboarding Step 2 - EF Profile
// TODO: Store selections in Pinecone with user_id

'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface Step2Props {
  onNext: (data: any) => void;
  onBack: () => void;
}

export default function OnboardingStep2({ onNext, onBack }: Step2Props) {
  const [efProfile, setEfProfile] = useState({
    task_initiation: false,
    time_management: false,
    organization: false,
    planning: false,
    working_memory: false,
  });

  const challenges = [
    { key: 'task_initiation', label: 'Task initiation (starting things)' },
    { key: 'time_management', label: 'Time management (estimating/tracking time)' },
    { key: 'organization', label: 'Organization (keeping track of details)' },
    { key: 'planning', label: 'Planning (breaking down projects)' },
    { key: 'working_memory', label: 'Working memory (remembering steps)' },
  ];

  const toggleChallenge = (key: string) => {
    setEfProfile({ ...efProfile, [key]: !efProfile[key as keyof typeof efProfile] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ ef_profile: efProfile });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        What executive function challenges do you face?
      </h2>
      <p className="text-gray-600 mb-8">Select all that apply</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {challenges.map((challenge) => (
          <button
            key={challenge.key}
            type="button"
            onClick={() => toggleChallenge(challenge.key)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
              efProfile[challenge.key as keyof typeof efProfile]
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div
              className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                efProfile[challenge.key as keyof typeof efProfile]
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300'
              }`}
            >
              {efProfile[challenge.key as keyof typeof efProfile] && (
                <Check className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="font-medium text-gray-900">{challenge.label}</span>
          </button>
        ))}

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
