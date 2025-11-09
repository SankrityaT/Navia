// Problem section with warm-organic aesthetic and layered backgrounds
// Terracotta palette with Fraunces typography

'use client';

import { Leaf, Users, Flame } from 'lucide-react';

export default function Problem() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Layered background */}
      <div className="absolute inset-0 bg-[var(--sand)]"></div>
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[var(--clay-200)] rounded-full blur-[100px] opacity-30"></div>
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-[var(--sage-400)] rounded-full blur-[90px] opacity-25"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-[var(--charcoal)] mb-7 leading-tight tracking-tight" style={{fontFamily: 'var(--font-fraunces)'}}>
            We Understand What
            <span className="block text-[var(--clay-600)] italic font-light mt-2">You're Going Through</span>
          </h2>
          <p className="text-xl md:text-2xl text-[var(--charcoal)]/70 max-w-2xl mx-auto leading-relaxed font-light">
            The transition after graduation can feel isolating. You're not imagining it.
          </p>
        </div>

        {/* Pain Points - Organic Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="group bg-[var(--cream)] p-12 rounded-[2rem] border-2 border-[var(--clay-300)]/30 hover:border-[var(--clay-400)]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--clay-300)] to-[var(--clay-500)] flex items-center justify-center mb-7 shadow-lg group-hover:scale-110 transition-transform duration-500">
              <Leaf className="w-8 h-8 text-[var(--cream)]" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-serif font-semibold text-[var(--charcoal)] mb-5" style={{fontFamily: 'var(--font-fraunces)'}}>
              The Support Cliff
            </h3>
            <p className="text-[var(--charcoal)]/70 leading-relaxed text-lg">
              All the accommodations and structure that helped you succeed suddenly disappear at graduation.
            </p>
          </div>

          <div className="group bg-[var(--cream)] p-12 rounded-[2rem] border-2 border-[var(--clay-300)]/30 hover:border-[var(--clay-400)]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--sage-500)] to-[var(--moss-600)] flex items-center justify-center mb-7 shadow-lg group-hover:scale-110 transition-transform duration-500">
              <Users className="w-8 h-8 text-[var(--cream)]" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-serif font-semibold text-[var(--charcoal)] mb-5" style={{fontFamily: 'var(--font-fraunces)'}}>
              Navigating Expectations
            </h3>
            <p className="text-[var(--charcoal)]/70 leading-relaxed text-lg">
              Managing job interviews and workplace demands while handling executive function challenges takes a toll on your energy and well-being.
            </p>
          </div>

          <div className="group bg-[var(--cream)] p-12 rounded-[2rem] border-2 border-[var(--clay-300)]/30 hover:border-[var(--clay-400)]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-700)] flex items-center justify-center mb-7 shadow-lg group-hover:scale-110 transition-transform duration-500">
              <Flame className="w-8 h-8 text-[var(--cream)]" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-serif font-semibold text-[var(--charcoal)] mb-5" style={{fontFamily: 'var(--font-fraunces)'}}>
              Burnout & Overwhelm
            </h3>
            <p className="text-[var(--charcoal)]/70 leading-relaxed text-lg">
              Without the right support, even simple tasks can feel impossible, leading to cycles of burnout.
            </p>
          </div>
        </div>

        {/* Empathetic Message */}
        <div className="relative bg-gradient-to-br from-[var(--clay-100)] via-[var(--sand)] to-[var(--stone)] p-14 rounded-[2.5rem] text-center border-2 border-[var(--clay-300)]/40 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--clay-200)] rounded-full blur-[80px] opacity-40"></div>
          <div className="relative z-10">
            <p className="text-2xl md:text-3xl text-[var(--charcoal)] font-serif font-semibold mb-5 italic" style={{fontFamily: 'var(--font-fraunces)'}}>
              "You've worked so hard to get here."
            </p>
            <p className="text-lg md:text-xl text-[var(--charcoal)]/70 max-w-3xl mx-auto leading-relaxed font-light">
              You deserve support that doesn't end with a diploma. Navia is here to help you navigate what comes next—at your own pace, in your own way.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
