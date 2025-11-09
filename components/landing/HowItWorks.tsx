// How It Works - Visual step-by-step flow
// Minimal text, maximum whitespace, simple diagrams

import { UserPlus, Brain, Sparkles, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-[#FFF9F5]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Your Journey
            <span className="block text-[#E5989B]">In Four Simple Steps</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Getting started is gentle and at your own pace
          </p>
        </div>

        {/* Steps - Vertical Flow with Connectors */}
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Step 1 */}
          <div className="flex gap-8 items-start">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFE5D9] to-[#FFD6A5] flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-[#FFB4A2]" />
              </div>
              <div className="w-0.5 h-24 bg-gradient-to-b from-[#FFB4A2]/30 to-transparent mt-4"></div>
            </div>
            <div className="pt-2">
              <div className="text-sm font-semibold text-[#E5989B] mb-2">STEP 1</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Your Profile</h3>
              <p className="text-gray-600 leading-relaxed">
                Share what feels comfortable. Tell us about your executive function challenges, your goals, and what support looks like for you.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-8 items-start">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E5C1CD] to-[#E5989B] flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="w-0.5 h-24 bg-gradient-to-b from-[#E5989B]/30 to-transparent mt-4"></div>
            </div>
            <div className="pt-2">
              <div className="text-sm font-semibold text-[#E5989B] mb-2">STEP 2</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Take the Assessment</h3>
              <p className="text-gray-600 leading-relaxed">
                Our gentle, adaptive assessment helps identify your masking patterns, energy drains, and environmental stressors. No judgment, just understanding.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-8 items-start">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B8E0D2] to-[#95D5B2] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#52B788]" />
              </div>
              <div className="w-0.5 h-24 bg-gradient-to-b from-[#52B788]/30 to-transparent mt-4"></div>
            </div>
            <div className="pt-2">
              <div className="text-sm font-semibold text-[#52B788] mb-2">STEP 3</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Personalized Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive tailored recommendations, task breakdowns, and coping strategies designed for your unique neurodivergent profile.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-8 items-start">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD6A5] to-[#FFB4A2] flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="pt-2">
              <div className="text-sm font-semibold text-[#FFB4A2] mb-2">STEP 4</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Track Your Progress</h3>
              <p className="text-gray-600 leading-relaxed">
                Watch your growth over time. Celebrate small wins, adjust strategies, and build confidence in your abilities—at your own pace.
              </p>
            </div>
          </div>
        </div>

        {/* Reassurance Message */}
        <div className="mt-20 text-center">
          <div className="inline-block bg-white/60 backdrop-blur-sm px-8 py-4 rounded-full border border-[#FFB4A2]/20">
            <p className="text-gray-700">
              <span className="font-semibold text-gray-900">Take your time.</span> There's no rush, no pressure—just support when you need it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
