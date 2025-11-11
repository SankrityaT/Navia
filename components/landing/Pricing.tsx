// Pricing section - Simple and user-friendly
// Warm-organic aesthetic with terracotta palette

'use client';

import { Check } from 'lucide-react';

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      {/* Layered background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--cream)] to-[var(--sand)]"></div>
      <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-[var(--clay-200)] rounded-full blur-[110px] opacity-25"></div>
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-[var(--sage-400)] rounded-full blur-[100px] opacity-20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-[var(--charcoal)] mb-7 leading-tight tracking-tight" style={{fontFamily: 'var(--font-fraunces)'}}>
            Simple, Transparent
            <span className="block text-[var(--clay-600)] italic font-light mt-2">Pricing</span>
          </h2>
          <p className="text-xl md:text-2xl text-[var(--charcoal)]/70 max-w-2xl mx-auto leading-relaxed font-light">
            Because your journey matters
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Student Plan */}
          <div className="group bg-white p-8 lg:p-10 rounded-[2rem] border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col">
            <div className="text-sm font-semibold text-[var(--clay-600)] mb-3 uppercase tracking-wider">Student Plan</div>
            <div className="mb-4">
              <span className="text-4xl lg:text-5xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>$6.99</span>
              <span className="text-[var(--charcoal)]/60 text-lg">/month</span>
            </div>
            <p className="text-sm text-[var(--charcoal)]/60 mb-4 leading-relaxed">
              For current students • Requires .edu email
            </p>
            <p className="text-[var(--charcoal)]/70 mb-8 leading-relaxed font-medium text-lg">
              AI coaching to prepare you for life after graduation.
            </p>
            <button className="w-full bg-[var(--sand)] hover:bg-[var(--stone)] text-[var(--charcoal)] py-4 rounded-full font-semibold transition-all duration-300 border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 mt-auto">
              Start 7-Day Free Trial
            </button>
          </div>

          {/* Professional Plan - Highlighted */}
          <div className="group relative bg-gradient-to-br from-[var(--clay-100)] via-[var(--sand)] to-[var(--clay-200)] p-8 lg:p-10 rounded-[2rem] border-2 border-[var(--clay-400)]/60 hover:border-[var(--clay-500)]/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--clay-500)] to-[var(--clay-600)] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
              Most Popular
            </div>
            
            <div className="text-sm font-semibold text-[var(--clay-600)] mb-3 uppercase tracking-wider">Professional Plan</div>
            <div className="mb-4">
              <span className="text-4xl lg:text-5xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>$19.99</span>
              <span className="text-[var(--charcoal)]/60 text-lg">/month</span>
            </div>
            <p className="text-sm text-[var(--charcoal)]/60 mb-4 leading-relaxed">
              For post-college professionals • Open to all
            </p>
            <p className="text-[var(--charcoal)]/70 mb-8 leading-relaxed font-medium text-lg">
              Full support navigating the "support cliff" after graduation.
            </p>
            <button className="w-full bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl mt-auto">
              Start 7-Day Free Trial
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="group bg-white p-8 lg:p-10 rounded-[2rem] border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col">
            <div className="text-sm font-semibold text-[var(--clay-600)] mb-3 uppercase tracking-wider">Enterprise Plan</div>
            <div className="mb-4">
              <span className="text-4xl lg:text-5xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>Custom</span>
            </div>
            <p className="text-sm text-[var(--charcoal)]/60 mb-4 leading-relaxed">
              For universities & employers • 50+ users
            </p>
            <p className="text-[var(--charcoal)]/70 mb-8 leading-relaxed font-medium text-lg">
              Dedicated support with admin tools and compliance features.
            </p>
            <button className="w-full bg-[var(--sand)] hover:bg-[var(--stone)] text-[var(--charcoal)] py-4 rounded-full font-semibold transition-all duration-300 border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 mt-auto">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
