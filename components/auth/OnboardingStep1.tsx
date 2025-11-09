// FRONTEND: Onboarding Step 1 - Basic Info
// TODO: Add form validation
// TODO: Store in Clerk user metadata

'use client';

import { useState } from 'react';

interface Step1Props {
  onNext: (data: { name: string; graduation_date: string; university: string }) => void;
}

export default function OnboardingStep1({ onNext }: Step1Props) {
  const [formData, setFormData] = useState({
    name: '',
    graduation_date: '',
    university: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
      <p className="text-gray-600 mb-8">Help us personalize your experience</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Graduation Date (or months post-grad)
          </label>
          <input
            type="text"
            required
            value={formData.graduation_date}
            onChange={(e) => setFormData({ ...formData, graduation_date: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., May 2024 or 6 months post-grad"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            University
          </label>
          <input
            type="text"
            required
            value={formData.university}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your university"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
