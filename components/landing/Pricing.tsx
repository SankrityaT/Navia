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
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
          {/* Students/Basic Plan */}
          <div className="group bg-white p-8 lg:p-10 rounded-[2rem] border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col">
            <div className="text-sm font-semibold text-[var(--clay-600)] mb-3 uppercase tracking-wider">Students</div>
            <div className="text-xs text-[var(--charcoal)]/60 mb-3 leading-relaxed">from Partnered Colleges</div>
            <div className="mb-4">
              <span className="text-4xl lg:text-5xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>Free</span>
              <span className="text-[var(--charcoal)]/60 text-lg"> forever</span>
            </div>
            <p className="text-sm text-[var(--charcoal)]/60 mb-4 leading-relaxed min-h-[40px]">
              <span className="font-semibold text-[var(--charcoal)] text-lg">$4.99</span>/month if not from partnered college
            </p>
            <p className="text-[var(--charcoal)]/70 mb-6 leading-relaxed font-medium min-h-[48px]">
              * 7 day free trial
            </p>
            <ul className="space-y-3 mb-auto flex-grow">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80">Full AI executive function coaching</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80">Task breakdown</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80">Focus mode with adaptive reminders</span>
              </li>
            </ul>
            <button className="w-full bg-[var(--sand)] hover:bg-[var(--stone)] text-[var(--charcoal)] py-4 rounded-full font-semibold transition-all duration-300 border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 mt-8">
              Start 7-Day Free Trial
            </button>
          </div>

          {/* Pro Plan - Highlighted */}
          <div className="group relative bg-gradient-to-br from-[var(--clay-100)] via-[var(--sand)] to-[var(--clay-200)] p-8 lg:p-10 rounded-[2rem] border-2 border-[var(--clay-400)]/60 hover:border-[var(--clay-500)]/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--clay-500)] to-[var(--clay-600)] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
              Most Popular
            </div>
            
            <div className="text-sm font-semibold text-[var(--clay-600)] mb-3 uppercase tracking-wider">Pro</div>
            <div className="mb-4">
              <span className="text-4xl lg:text-5xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>$9.99</span>
              <span className="text-[var(--charcoal)]/60 text-lg">/month</span>
            </div>
            <p className="text-sm text-[var(--charcoal)]/60 mb-4 leading-relaxed min-h-[40px]">
              * 7 day free trial
            </p>
            <p className="text-[var(--charcoal)]/70 mb-6 leading-relaxed font-medium min-h-[48px]">
              
            </p>
            <ul className="space-y-3 mb-auto flex-grow">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80">Full AI executive function coaching</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80">Career roadmap & task breakdown</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80">Focus mode with adaptive reminders</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80">Peer mentor community access</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80">Energy level tracking</span>
              </li>
            </ul>
            <button className="w-full bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl mt-8">
              Start 7-Day Free Trial
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="group bg-white p-8 lg:p-10 rounded-[2rem] border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col">
            <div className="text-sm font-semibold text-[var(--clay-600)] mb-3 uppercase tracking-wider">Enterprise</div>
            <div className="mb-4">
              <span className="text-4xl lg:text-5xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>Custom</span>
            </div>
            <p className="text-sm text-[var(--charcoal)]/60 mb-4 leading-relaxed min-h-[40px]">
              
            </p>
            <p className="text-[var(--charcoal)]/70 mb-6 leading-relaxed font-medium min-h-[48px]">
              
            </p>
            <ul className="space-y-3 mb-auto flex-grow">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80 font-medium">Everything in Pro, plus:</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80">Admin dashboard with analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80">Custom onboarding & training</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80">HR/student system integration</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80">Dedicated account manager</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80">Usage reporting & outcome tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80">Compliance support (FERPA, ADA, HIPAA)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[var(--sage-600)] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)]/80">Volume discounts available</span>
              </li>
            </ul>
            <button className="w-full bg-[var(--sand)] hover:bg-[var(--stone)] text-[var(--charcoal)] py-4 rounded-full font-semibold transition-all duration-300 border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 mt-8">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
