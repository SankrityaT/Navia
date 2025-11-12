// Creative vertical timeline with numbered circles and flowing design
// Warm-organic aesthetic with terracotta palette

'use client';

import { UserPlus, Brain, Sparkles, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      {/* Layered background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--sand)] to-[var(--cream)]"></div>
      <div className="absolute top-1/3 left-0 w-[450px] h-[450px] bg-[var(--clay-200)] rounded-full blur-[110px] opacity-25"></div>
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-[var(--sage-400)] rounded-full blur-[100px] opacity-20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-[var(--charcoal)] mb-7 leading-tight tracking-tight" style={{fontFamily: 'var(--font-fraunces)'}}>
            Your Journey
            <span className="block text-[var(--clay-600)] italic font-light mt-2">In Four Simple Steps</span>
          </h2>
          <p className="text-xl md:text-2xl text-[var(--charcoal)]/70 max-w-2xl mx-auto leading-relaxed font-light">
            Getting started is gentle and at your own pace
          </p>
        </div>

        {/* Creative Vertical Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--clay-300)] via-[var(--clay-400)] to-[var(--clay-300)] opacity-30"></div>
          
          {/* Step 1 */}
          <div className="relative mb-20">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Number Circle - Left */}
              <div className="md:w-1/2 flex justify-end">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center shadow-2xl border-4 border-white z-10 relative">
                    <span className="text-3xl font-serif font-bold text-white" style={{fontFamily: 'var(--font-fraunces)'}}>1</span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-[var(--clay-500)] blur-xl opacity-40 animate-pulse"></div>
                </div>
              </div>
              
              {/* Content Card - Right */}
              <div className="md:w-1/2">
                <div className="group bg-white p-8 rounded-2xl border-2 border-[var(--clay-200)] hover:border-[var(--clay-400)] hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                      Chat with Navia
                    </h3>
                  </div>
                  <p className="text-[var(--charcoal)]/70 leading-relaxed">
                    Have a warm conversation with Navia. Share what you're struggling with and what kind of support would help you most.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative mb-20">
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              {/* Number Circle - Right */}
              <div className="md:w-1/2 flex justify-start">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] flex items-center justify-center shadow-2xl border-4 border-white z-10 relative">
                    <span className="text-3xl font-serif font-bold text-white" style={{fontFamily: 'var(--font-fraunces)'}}>2</span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-[var(--sage-500)] blur-xl opacity-40 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                </div>
              </div>
              
              {/* Content Card - Left */}
              <div className="md:w-1/2">
                <div className="group bg-white p-8 rounded-2xl border-2 border-[var(--sage-200)] hover:border-[var(--sage-400)] hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                      Manage Your Tasks
                    </h3>
                  </div>
                  <p className="text-[var(--charcoal)]/70 leading-relaxed">
                    Break down overwhelming tasks into tiny steps with AI help. Track your energy levels and get support when you need it.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative mb-20">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Number Circle - Left */}
              <div className="md:w-1/2 flex justify-end">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--moss-500)] to-[var(--moss-600)] flex items-center justify-center shadow-2xl border-4 border-white z-10 relative">
                    <span className="text-3xl font-serif font-bold text-white" style={{fontFamily: 'var(--font-fraunces)'}}>3</span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-[var(--moss-500)] blur-xl opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
              
              {/* Content Card - Right */}
              <div className="md:w-1/2">
                <div className="group bg-white p-8 rounded-2xl border-2 border-[var(--moss-200)] hover:border-[var(--moss-400)] hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--moss-500)] to-[var(--moss-600)] flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                      Enter Focus Mode
                    </h3>
                  </div>
                  <p className="text-[var(--charcoal)]/70 leading-relaxed">
                    Immersive focus sessions with lofi music or Spotify. Set your intention, choose your time, and Navia stays with you the whole way.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative">
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              {/* Number Circle - Right */}
              <div className="md:w-1/2 flex justify-start">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-700)] flex items-center justify-center shadow-2xl border-4 border-white z-10 relative">
                    <span className="text-3xl font-serif font-bold text-white" style={{fontFamily: 'var(--font-fraunces)'}}>4</span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-[var(--clay-600)] blur-xl opacity-40 animate-pulse" style={{animationDelay: '1.5s'}}></div>
                </div>
              </div>
              
              {/* Content Card - Left */}
              <div className="md:w-1/2">
                <div className="group bg-white p-8 rounded-2xl border-2 border-[var(--clay-200)] hover:border-[var(--clay-400)] hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-700)] flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                      Find Your People
                    </h3>
                  </div>
                  <p className="text-[var(--charcoal)]/70 leading-relaxed">
                    Connect with peers who truly understand. No masking, no judgment—just real connections with people who get it.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Reassurance Message */}
        <div className="mt-24 text-center">
          <div className="inline-block bg-[var(--sand)]/80 backdrop-blur-sm px-10 py-5 rounded-full border-2 border-[var(--clay-300)]/30 shadow-lg">
            <p className="text-lg text-[var(--charcoal)]">
              <span className="font-serif font-semibold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>Take your time.</span> There's no rush, no pressure—just support when you need it.
            </p>
          </div>
        </div>
      </div>

    </section>
  );
}
