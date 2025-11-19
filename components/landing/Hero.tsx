// Warm-organic hero with terracotta palette, Fraunces typography, and staggered animations
// Layered backgrounds create depth and atmosphere

'use client';

import Link from 'next/link';
import { ArrowRight, Brain, Users, Leaf } from 'lucide-react';

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Layered organic background */}
      <div className="absolute inset-0 bg-[var(--cream)] texture-grain"></div>
      <div className="absolute inset-0 organic-blob opacity-40"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--clay-200)] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--sage-400)] rounded-full blur-[100px] opacity-15 translate-y-1/3 -translate-x-1/4"></div>
      
      <div className="relative z-10 flex flex-col flex-1">
        {/* Minimal Navigation */}
        <nav className="w-full px-6 py-8 md:px-12 animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 animate-slide-in-left delay-100">
              <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-[#c4a574] via-[#9ca986] to-[#6b8e6f] shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-[#c4a574]/80 via-[#9ca986]/80 to-[#6b8e6f]/80" />
              </div>
              <span className="text-2xl font-serif font-semibold text-[var(--charcoal)] tracking-tight" style={{fontFamily: 'var(--font-fraunces)'}}>Navia</span>
            </div>
            <div className="hidden md:flex items-center gap-10 text-[var(--charcoal)] font-medium animate-fade-in delay-200">
              <Link 
                href="/waitlist"
                className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-6 py-2.5 rounded-full transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
              >
                Join Waitlist
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto text-center">
            {/* Empathetic Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--sand)]/80 backdrop-blur-sm rounded-full border border-[var(--clay-300)]/30 mb-10 shadow-sm animate-scale-in delay-300">
              <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-[#c4a574] via-[#9ca986] to-[#6b8e6f] overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              </div>
              <span className="text-sm text-[var(--charcoal)] font-medium">I'm built with care for neurodivergent minds</span>
            </div>

            {/* Main Headline - Addressing the Support Cliff */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-[var(--charcoal)] mb-8 leading-[1.1] tracking-tight animate-fade-in-up delay-400" style={{fontFamily: 'var(--font-fraunces)'}}>
              I'm Here for You in
              <span className="block mt-4 text-[var(--clay-600)] italic font-light">The Unknown</span>
            </h1>

            {/* Empathetic Subheadline */}
            <p className="text-xl md:text-2xl text-[var(--charcoal)]/80 mb-5 max-w-3xl mx-auto leading-relaxed font-light animate-fade-in-up delay-500">
              Losing campus support and navigating life without it is tough. I'm Navia, and I'm here.
            </p>
            <p className="text-base md:text-lg text-[var(--charcoal)]/60 mb-14 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-600">
              I offer AI-powered task management, focus sessions, and daily support designed for your neurodivergent mind—plus peer connections who truly understand.
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20 animate-scale-in delay-700">
              <Link
                href="/waitlist"
                className="group inline-flex items-center gap-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] px-10 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5"
              >
                Join Waitlist
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-[var(--sand)]/60 backdrop-blur-sm p-10 rounded-3xl border border-[var(--clay-300)]/20 hover:border-[var(--clay-400)]/40 transition-all duration-500 hover:-translate-y-1 animate-fade-in-up delay-800">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--sage-400)] to-[var(--sage-600)] flex items-center justify-center mb-5 mx-auto shadow-md">
                  <Leaf className="w-7 h-7 text-[var(--cream)]" strokeWidth={2.5} />
                </div>
                <div className="text-sm text-[var(--charcoal)]/60 mb-2 font-medium uppercase tracking-wider">Understanding</div>
                <div className="text-2xl font-serif font-semibold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>Be Yourself</div>
              </div>
              <div className="bg-[var(--sand)]/60 backdrop-blur-sm p-10 rounded-3xl border border-[var(--clay-300)]/20 hover:border-[var(--clay-400)]/40 transition-all duration-500 hover:-translate-y-1 animate-fade-in-up delay-[900ms]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center mb-5 mx-auto shadow-md">
                  <Brain className="w-7 h-7 text-[var(--cream)]" strokeWidth={2.5} />
                </div>
                <div className="text-sm text-[var(--charcoal)]/60 mb-2 font-medium uppercase tracking-wider">AI-Powered</div>
                <div className="text-2xl font-serif font-semibold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>Smart Support</div>
              </div>
              <div className="bg-[var(--sand)]/60 backdrop-blur-sm p-10 rounded-3xl border border-[var(--clay-300)]/20 hover:border-[var(--clay-400)]/40 transition-all duration-500 hover:-translate-y-1 animate-fade-in-up delay-[1000ms]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--moss-500)] to-[var(--moss-600)] flex items-center justify-center mb-5 mx-auto shadow-md">
                  <Users className="w-7 h-7 text-[var(--cream)]" strokeWidth={2.5} />
                </div>
                <div className="text-sm text-[var(--charcoal)]/60 mb-2 font-medium uppercase tracking-wider">Community</div>
                <div className="text-2xl font-serif font-semibold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>Connect & Share</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
