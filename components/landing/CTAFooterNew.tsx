// Final CTA section with product mockup and footer
// Warm-organic aesthetic with terracotta palette and Unsplash imagery

'use client';

import Link from 'next/link';
import { ArrowRight, Mail, Heart, Sparkles, Leaf } from 'lucide-react';
import Image from 'next/image';

export default function CTAFooter() {
  return (
    <>
      {/* Final CTA Section with Mockup */}
      <section className="relative py-32 overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--clay-100)] via-[var(--sand)] to-[var(--clay-200)]"></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--sage-400)] rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-[var(--clay-300)] rounded-full blur-[110px] opacity-25"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            {/* Left Side - CTA Content */}
            <div className="order-2 md:order-1">
              {/* Empathetic Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--cream)]/80 backdrop-blur-sm rounded-full border border-[var(--clay-300)]/30 mb-8 shadow-sm">
                <Heart className="w-4 h-4 text-[var(--clay-600)]" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)] font-medium">You deserve support that doesn't end with a diploma</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[var(--charcoal)] mb-6 leading-tight tracking-tight" style={{fontFamily: 'var(--font-fraunces)'}}>
                Ready to Take the
                <span className="block text-[var(--clay-600)] italic font-light mt-2">First Step?</span>
              </h2>
              
              <p className="text-lg md:text-xl text-[var(--charcoal)]/70 mb-10 leading-relaxed">
                Start your journey with a gentle assessment. No pressure, no judgment—just understanding.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
                <Link
                  href="/sign-up"
                  className="group inline-flex items-center gap-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] px-10 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5"
                >
                  Begin Your Assessment
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
                </Link>
                <a
                  href="mailto:support@navia.app"
                  className="inline-flex items-center gap-3 bg-[var(--cream)] hover:bg-[var(--sand)] text-[var(--charcoal)] px-10 py-5 rounded-full text-lg font-semibold transition-all duration-300 border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60"
                >
                  <Mail className="w-5 h-5" strokeWidth={2.5} />
                  Questions? Reach Out
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 text-sm text-[var(--charcoal)]/70">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--sage-600)]"></div>
                  <span>Privacy-first</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--sage-600)]"></div>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--sage-600)]"></div>
                  <span>Start in 5 minutes</span>
                </div>
              </div>
            </div>

            {/* Right Side - Mockup Screens */}
            <div className="order-1 md:order-2 relative">
              <div className="relative">
                {/* Main Screen - Dashboard Preview */}
                <div className="relative z-10 bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-[var(--cream)]">
                  <div className="aspect-[4/5] relative">
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-br from-[var(--clay-100)] to-[var(--sand)] p-6 border-b border-[var(--clay-200)]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-[var(--cream)]" strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--charcoal)]">Good morning, Alex</div>
                          <div className="text-xs text-[var(--charcoal)]/60">How are you feeling today?</div>
                        </div>
                      </div>
                    </div>

                    {/* Content Area with Unsplash Image */}
                    <div className="absolute top-24 left-0 right-0 bottom-0 p-6 space-y-4">
                      {/* Energy Level Card */}
                      <div className="bg-gradient-to-br from-[var(--sage-400)]/20 to-[var(--sage-500)]/30 rounded-2xl p-5 border border-[var(--sage-500)]/20">
                        <div className="text-xs font-semibold text-[var(--sage-600)] mb-2 uppercase tracking-wider">Energy Level</div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-[var(--sage-200)] rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-gradient-to-r from-[var(--sage-500)] to-[var(--sage-600)] rounded-full"></div>
                          </div>
                          <span className="text-sm font-semibold text-[var(--charcoal)]">75%</span>
                        </div>
                      </div>

                      {/* Today's Tasks Card */}
                      <div className="bg-gradient-to-br from-[var(--clay-100)] to-[var(--clay-200)]/60 rounded-2xl p-5 border border-[var(--clay-300)]/30">
                        <div className="text-xs font-semibold text-[var(--clay-600)] mb-3 uppercase tracking-wider">Today's Focus</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-md bg-[var(--sage-500)]"></div>
                            <span className="text-sm text-[var(--charcoal)]">Morning routine</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-md border-2 border-[var(--clay-400)]"></div>
                            <span className="text-sm text-[var(--charcoal)]/60">Job application</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-md border-2 border-[var(--clay-400)]"></div>
                            <span className="text-sm text-[var(--charcoal)]/60">Self-care break</span>
                          </div>
                        </div>
                      </div>

                      {/* Insight Card with Image Placeholder */}
                      <div className="bg-white rounded-2xl overflow-hidden border border-[var(--clay-200)] shadow-md">
                        <div className="h-32 bg-gradient-to-br from-[var(--clay-200)] to-[var(--sage-300)] relative">
                          {/* Placeholder for calming nature image */}
                          <div className="absolute inset-0 flex items-center justify-center text-[var(--charcoal)]/30 text-xs">
                            Calming workspace
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="text-xs font-semibold text-[var(--charcoal)] mb-1">Your Progress</div>
                          <div className="text-xs text-[var(--charcoal)]/60">You've completed 12 tasks this week 🎉</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Mini Card - Top Right */}
                <div className="hidden md:block absolute -top-8 -right-8 z-20 bg-white rounded-2xl shadow-xl p-5 border-2 border-[var(--cream)] w-48">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[var(--cream)]" strokeWidth={2.5} />
                    </div>
                    <div className="text-xs font-semibold text-[var(--charcoal)]">New Insight</div>
                  </div>
                  <p className="text-xs text-[var(--charcoal)]/70 leading-relaxed">
                    Your masking levels are lower this week!
                  </p>
                </div>

                {/* Floating Mini Card - Bottom Left */}
                <div className="hidden md:block absolute -bottom-6 -left-6 z-20 bg-gradient-to-br from-[var(--sage-400)]/90 to-[var(--sage-500)]/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border-2 border-white w-44">
                  <div className="text-xs font-semibold text-white mb-2 uppercase tracking-wider">Support Available</div>
                  <p className="text-xs text-white/90">24/7 AI guidance when you need it</p>
                </div>
              </div>
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
