// Solution features with calming, accessible design
// Focus on core features: masking assessment, stressor visualization, personalized recommendations

import { Brain, MapPin, Lightbulb, CheckCircle } from 'lucide-react';

export default function Solution() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Support That Adapts
            <span className="block text-[#E5989B]">To Your Needs</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            AI-powered tools designed specifically for neurodivergent executive function support
          </p>
        </div>

        {/* Core Features - Clean Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {/* Masking Assessment */}
          <div className="bg-gradient-to-br from-[#FFF5F0] to-[#FFE5D9] p-10 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6">
              <Brain className="w-8 h-8 text-[#E5989B]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Masking Assessment Tool
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Understand your masking patterns and energy expenditure. Our AI helps you identify when and where you're masking most, so you can make informed decisions about your energy.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#52B788] flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Track masking patterns over time</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#52B788] flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Identify energy-draining situations</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#52B788] flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Personalized recovery strategies</span>
              </li>
            </ul>
          </div>

          {/* Environmental Stressor Visualization */}
          <div className="bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] p-10 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-[#52B788]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Environmental Stressor Mapping
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Visualize what environments and situations trigger overwhelm. See patterns in your daily life and plan accordingly.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#E5989B] flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Map sensory triggers and stressors</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#E5989B] flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Identify safe spaces and routines</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#E5989B] flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Plan your day with confidence</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="bg-gradient-to-br from-[#E5C1CD] to-[#FFE5D9] p-12 rounded-3xl">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-8 h-8 text-[#FFB4A2]" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Personalized Recommendations
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Based on your unique profile, energy levels, and goals, Navia suggests actionable strategies that actually work for your brain. No generic advice—just support tailored to you.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl">
                <h4 className="font-semibold text-gray-900 mb-2">Task Breakdown</h4>
                <p className="text-sm text-gray-600">Break overwhelming tasks into manageable steps</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl">
                <h4 className="font-semibold text-gray-900 mb-2">Energy Management</h4>
                <p className="text-sm text-gray-600">Schedule tasks when you have the right energy</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl">
                <h4 className="font-semibold text-gray-900 mb-2">Coping Strategies</h4>
                <p className="text-sm text-gray-600">Adaptive techniques for your specific challenges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
