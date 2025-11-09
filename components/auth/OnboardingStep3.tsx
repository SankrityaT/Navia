// FRONTEND: Onboarding Step 3 - Current Goals
// TODO: Store in Pinecone with user_id

'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface Step3Props {
  onNext: (data: any) => void;
  onBack: () => void;
}

export default function OnboardingStep3({ onNext, onBack }: Step3Props) {
  const [goals, setGoals] = useState({
    job_searching: false,
    managing_finances: false,
    independent_living: false,
    building_social_connections: false,
  });

  const goalOptions = [
    { key: 'job_searching', label: 'Job searching', icon: '💼' },
    { key: 'managing_finances', label: 'Managing finances', icon: '💰' },
    { key: 'independent_living', label: 'Independent living', icon: '🏠' },
    { key: 'building_social_connections', label: 'Building social connections', icon: '👥' },
  ];

  const toggleGoal = (key: string) => {
    setGoals({ ...goals, [key]: !goals[key as keyof typeof goals] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ current_goals: goals });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        What are you working on post-grad?
      </h2>
      <p className="text-gray-600 mb-8">Select all that apply</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {goalOptions.map((goal) => (
          <button
            key={goal.key}
            type="button"
            onClick={() => toggleGoal(goal.key)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
              goals[goal.key as keyof typeof goals]
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div
              className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                goals[goal.key as keyof typeof goals]
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300'
              }`}
            >
              {goals[goal.key as keyof typeof goals] && (
                <Check className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="text-2xl mr-2">{goal.icon}</span>
            <span className="font-medium text-gray-900">{goal.label}</span>
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
