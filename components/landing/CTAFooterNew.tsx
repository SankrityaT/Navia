// Final CTA section with product mockup and footer
// Warm-organic aesthetic with terracotta palette and Unsplash imagery

'use client';

import Link from 'next/link';
import { ArrowRight, Leaf } from 'lucide-react';

export default function CTAFooter() {
  return (
    <>
      {/* Final CTA Section - Minimalistic */}
      <section className="relative py-32 overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--sand)] to-[var(--cream)]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--clay-200)] rounded-full blur-[120px] opacity-20"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          {/* Main Content */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[var(--charcoal)] mb-6 leading-tight tracking-tight" style={{fontFamily: 'var(--font-fraunces)'}}>
            Ready to Take the
            <span className="block text-[var(--clay-600)] italic font-light mt-2">First Step?</span>
          </h2>
          
          <p className="text-lg md:text-xl text-[var(--charcoal)]/70 mb-12 leading-relaxed max-w-2xl mx-auto">
            Begin your journey with gentle, personalized support. No pressure, no judgment—just guidance crafted around you.
          </p>
          
          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] px-12 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--charcoal)]/60">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--sage-600)]"></div>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--sage-600)]"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--sage-600)]"></div>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--cream)] py-12 border-t border-[var(--clay-200)]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo and Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-[var(--cream)]" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-xl font-serif font-semibold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>Navia</div>
                <div className="text-sm text-[var(--charcoal)]/60">Beyond the Cliff</div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="flex items-center gap-8 text-sm text-[var(--charcoal)]/70">
              <a href="#about" className="hover:text-[var(--clay-600)] transition-colors duration-300">About</a>
              <a href="/privacy" className="hover:text-[var(--clay-600)] transition-colors duration-300">Privacy</a>
              <a href="/terms" className="hover:text-[var(--clay-600)] transition-colors duration-300">Terms</a>
              <a href="mailto:support@navia.app" className="hover:text-[var(--clay-600)] transition-colors duration-300">Contact</a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-[var(--clay-200)] text-center text-sm text-[var(--charcoal)]/60">
            <p>© 2024 Navia. Built with care for neurodivergent minds.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
