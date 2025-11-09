// Solution section with asymmetric bento grid layout
// Warm terracotta & clay palette with organic shapes

'use client';

import { Brain, MapPin, Lightbulb, Heart, TrendingUp, Calendar, Zap } from 'lucide-react';

export default function Solution() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Layered background */}
      <div className="absolute inset-0 bg-[var(--cream)]"></div>
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[var(--sage-400)] rounded-full blur-[120px] opacity-20"></div>
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[var(--clay-200)] rounded-full blur-[100px] opacity-25"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-[var(--charcoal)] mb-7 leading-tight tracking-tight" style={{fontFamily: 'var(--font-fraunces)'}}>
            Support That Adapts
            <span className="block text-[var(--clay-600)] italic font-light mt-2">To Your Needs</span>
          </h2>
          <p className="text-xl md:text-2xl text-[var(--charcoal)]/70 max-w-2xl mx-auto leading-relaxed font-light">
            AI-powered tools designed specifically for neurodivergent executive function support
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(200px,auto)]">
          
          {/* Large Feature - Masking Assessment (spans 7 cols, 2 rows) */}
          <div className="md:col-span-7 md:row-span-2 group bg-gradient-to-br from-[var(--clay-100)] via-[var(--sand)] to-[var(--clay-200)] p-10 md:p-12 rounded-[2rem] border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--clay-300)] rounded-full blur-[80px] opacity-30"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Brain className="w-8 h-8 text-[var(--cream)]" strokeWidth={2.5} />
              </div>
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-[var(--charcoal)] mb-5" style={{fontFamily: 'var(--font-fraunces)'}}>
                Masking Assessment Tool
              </h3>
              <p className="text-lg text-[var(--charcoal)]/70 leading-relaxed mb-6 max-w-xl">
                Understand your masking patterns and energy expenditure. Our AI helps you identify when and where you're masking most, so you can make informed decisions about your energy.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--sage-600)]"></div>
                  <span className="text-[var(--charcoal)]/80">Track masking patterns over time</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--sage-600)]"></div>
                  <span className="text-[var(--charcoal)]/80">Identify energy-draining situations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--sage-600)]"></div>
                  <span className="text-[var(--charcoal)]/80">Personalized recovery strategies</span>
                </div>
              </div>
            </div>
          </div>

          {/* Medium Feature - Environmental Mapping (spans 5 cols, 1 row) */}
          <div className="md:col-span-5 md:row-span-1 group bg-gradient-to-br from-[var(--sage-400)]/20 via-[var(--sand)] to-[var(--sage-500)]/30 p-8 rounded-[2rem] border-2 border-[var(--sage-500)]/30 hover:border-[var(--sage-600)]/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--sage-500)] to-[var(--moss-600)] flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-500">
              <MapPin className="w-7 h-7 text-[var(--cream)]" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-4" style={{fontFamily: 'var(--font-fraunces)'}}>
              Environmental Stressor Mapping
            </h3>
            <p className="text-[var(--charcoal)]/70 leading-relaxed">
              Visualize what environments trigger overwhelm and plan accordingly.
            </p>
          </div>

          {/* Small Feature - Energy Management (spans 5 cols, 1 row) */}
          <div className="md:col-span-5 md:row-span-1 group bg-gradient-to-br from-[var(--clay-200)]/40 via-[var(--sand)] to-[var(--clay-300)]/50 p-8 rounded-[2rem] border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-700)] flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-500">
              <Zap className="w-7 h-7 text-[var(--cream)]" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-4" style={{fontFamily: 'var(--font-fraunces)'}}>
              Energy Management
            </h3>
            <p className="text-[var(--charcoal)]/70 leading-relaxed">
              Schedule tasks when you have the right energy for them.
            </p>
          </div>

          {/* Tall Feature - Personalized Recommendations (spans 4 cols, 2 rows) */}
          <div className="md:col-span-4 md:row-span-2 group bg-gradient-to-br from-[var(--clay-300)]/30 via-[var(--sand)] to-[var(--clay-400)]/40 p-8 rounded-[2rem] border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[var(--clay-300)] rounded-full blur-[70px] opacity-30"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Lightbulb className="w-7 h-7 text-[var(--cream)]" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-4" style={{fontFamily: 'var(--font-fraunces)'}}>
                Personalized Recommendations
              </h3>
              <p className="text-[var(--charcoal)]/70 leading-relaxed mb-6">
                Based on your unique profile, energy levels, and goals.
              </p>
              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-2 text-sm text-[var(--charcoal)]/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--clay-500)]"></div>
                  <span>Task breakdown</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--charcoal)]/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--clay-500)]"></div>
                  <span>Coping strategies</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--charcoal)]/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--clay-500)]"></div>
                  <span>Adaptive techniques</span>
                </div>
              </div>
            </div>
          </div>

          {/* Medium Feature - Progress Tracking (spans 8 cols, 1 row) */}
          <div className="md:col-span-8 md:row-span-1 group bg-gradient-to-br from-[var(--sage-400)]/30 via-[var(--sand)] to-[var(--sage-500)]/40 p-8 rounded-[2rem] border-2 border-[var(--sage-500)]/30 hover:border-[var(--sage-600)]/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--sage-500)] to-[var(--moss-600)] flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="w-7 h-7 text-[var(--cream)]" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-4" style={{fontFamily: 'var(--font-fraunces)'}}>
              Progress Tracking
            </h3>
            <p className="text-[var(--charcoal)]/70 leading-relaxed">
              Watch your growth over time and celebrate wins.
            </p>
          </div>

          {/* Wide Feature - Daily Support (spans 8 cols, 1 row) */}
          <div className="md:col-span-8 md:row-span-1 group bg-gradient-to-br from-[var(--clay-100)] via-[var(--sand)] to-[var(--clay-200)]/60 p-8 rounded-[2rem] border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-32 h-32 bg-[var(--clay-300)] rounded-full blur-[60px] opacity-30"></div>
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                <Heart className="w-7 h-7 text-[var(--cream)]" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-3" style={{fontFamily: 'var(--font-fraunces)'}}>
                  Daily Support That Understands You
                </h3>
                <p className="text-[var(--charcoal)]/70 leading-relaxed">
                  No generic advice—just support tailored to your brain, your challenges, and your goals. At your own pace, in your own way.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
