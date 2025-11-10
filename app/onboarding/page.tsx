// FRONTEND: Onboarding flow page
// 4-step onboarding with warm organic theme

'use client';

import { useState } from 'react';
import OnboardingStep1 from '@/components/auth/OnboardingStep1';
import OnboardingStep2 from '@/components/auth/OnboardingStep2';
import OnboardingStep3 from '@/components/auth/OnboardingStep3';
import OnboardingStep4 from '@/components/auth/OnboardingStep4';
import OnboardingStep5 from '@/components/auth/OnboardingStep5';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<any>({});

  const handleStep1 = () => {
    setStep(2);
  };

  const handleStep2 = (data: any) => {
    setOnboardingData({ ...onboardingData, ...data });
    setStep(3);
  };

  const handleStep3 = (data: any) => {
    setOnboardingData({ ...onboardingData, ...data });
    setStep(4);
  };

  const handleStep4 = (data: any) => {
    setOnboardingData({ ...onboardingData, ...data });
    setStep(5);
  };

  const handleStep5 = async (data: any) => {
    const finalData = { ...onboardingData, ...data };
    
    // Save to backend
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save onboarding data:', response.status, errorData);
        return; // Don't redirect on error
      }
      
      // Success - redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };

  const handleSkipStep5 = async () => {
    // Save without custom interests/seeking
    const finalData = { ...onboardingData };
    
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        console.error('Failed to save onboarding data');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
      {/* Organic background elements */}
      <div className="absolute inset-0 texture-grain"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--clay-200)] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--sage-400)] rounded-full blur-[100px] opacity-15 translate-y-1/3 -translate-x-1/4"></div>
      
      <div className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === step 
                      ? 'w-12 bg-[var(--clay-500)]' 
                      : i < step 
                      ? 'w-8 bg-[var(--sage-600)]' 
                      : 'w-8 bg-[var(--stone)]'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-[var(--charcoal)]/60 mt-3">
              Step {step} of 5 • ~{Math.max(0, (5 - step) * 20 + 20)} seconds
            </p>
          </div>

          {/* Step content */}
          <div className="bg-[var(--cream)]/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-[var(--clay-300)]/20">
            {step === 1 && <OnboardingStep1 onNext={handleStep1} />}
            {step === 2 && <OnboardingStep2 onNext={handleStep2} onBack={() => setStep(1)} />}
            {step === 3 && <OnboardingStep3 onNext={handleStep3} onBack={() => setStep(2)} />}
            {step === 4 && <OnboardingStep4 onNext={handleStep4} onBack={() => setStep(3)} />}
            {step === 5 && <OnboardingStep5 onNext={handleStep5} onBack={() => setStep(4)} onSkip={handleSkipStep5} />}
          </div>
        </div>
      </div>
    </div>
  );
}
