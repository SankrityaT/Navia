// Problem section with empathetic, calming design
// Addresses pain points without overwhelming neurodivergent users

import { Heart, Users, Sparkles } from 'lucide-react';

export default function Problem() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-[#FFF9F5]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            We Understand What You're
            <span className="block text-[#E5989B]">Going Through</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The transition after graduation can feel isolating. You're not imagining it.
          </p>
        </div>

        {/* Pain Points - Soft, Spacious Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-10 rounded-3xl border border-[#E5989B]/10 hover:border-[#E5989B]/30 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFE5D9] to-[#FFD6A5] flex items-center justify-center mb-6">
              <Heart className="w-7 h-7 text-[#FFB4A2]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              The Support Cliff
            </h3>
            <p className="text-gray-600 leading-relaxed">
              All the accommodations and structure that helped you succeed suddenly disappear at graduation.
            </p>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-[#E5989B]/10 hover:border-[#E5989B]/30 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E5C1CD] to-[#E5989B] flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Double Masking
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Navigating job interviews and workplace expectations while managing executive function challenges is exhausting.
            </p>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-[#E5989B]/10 hover:border-[#E5989B]/30 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#B8E0D2] to-[#95D5B2] flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7 text-[#52B788]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Burnout & Overwhelm
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Without the right support, even simple tasks can feel impossible, leading to cycles of burnout.
            </p>
          </div>
        </div>

        {/* Empathetic Message */}
        <div className="bg-gradient-to-br from-[#FFF5F0] to-[#FFE5D9] p-12 rounded-3xl text-center">
          <p className="text-xl md:text-2xl text-gray-800 font-medium mb-4">
            "You've worked so hard to get here."
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            You deserve support that doesn't end with a diploma. Navia is here to help you navigate what comes next—at your own pace, in your own way.
          </p>
        </div>
      </div>
    </section>
  );
}
