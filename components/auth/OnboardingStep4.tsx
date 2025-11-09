// FRONTEND: Onboarding Step 4 - Completion
// TODO: Redirect to dashboard after animation

'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function OnboardingStep4() {
  const router = useRouter();

  const handleComplete = () => {
    router.push('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          You&apos;re all set!
        </h2>
        <p className="text-xl text-gray-600">
          Let&apos;s get started on your journey beyond the cliff
        </p>
      </div>

      <button
        onClick={handleComplete}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
