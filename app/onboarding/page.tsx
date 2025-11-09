// FRONTEND: Onboarding flow page
// TODO: Check if user already onboarded (redirect to dashboard)

'use client';

import { useState } from 'react';
import OnboardingStep1 from '@/components/auth/OnboardingStep1';
import OnboardingStep2 from '@/components/auth/OnboardingStep2';
import OnboardingStep3 from '@/components/auth/OnboardingStep3';
import OnboardingStep4 from '@/components/auth/OnboardingStep4';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<any>({});

  const handleStep1 = (data: any) => {
    setOnboardingData({ ...onboardingData, ...data });
    setStep(2);
  };

  const handleStep2 = (data: any) => {
    setOnboardingData({ ...onboardingData, ...data });
    setStep(3);
  };

  const handleStep3 = async (data: any) => {
    const finalData = { ...onboardingData, ...data };
    
    // Save to backend
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        setStep(4);
      } else {
        console.error('Failed to save onboarding data');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step ? 'w-12 bg-blue-600' : i < step ? 'w-8 bg-green-600' : 'w-8 bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">Step {step} of 4</p>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && <OnboardingStep1 onNext={handleStep1} />}
          {step === 2 && <OnboardingStep2 onNext={handleStep2} onBack={() => setStep(1)} />}
          {step === 3 && <OnboardingStep3 onNext={handleStep3} onBack={() => setStep(2)} />}
          {step === 4 && <OnboardingStep4 />}
        </div>
      </div>
    </div>
  );
}
