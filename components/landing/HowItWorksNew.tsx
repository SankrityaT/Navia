// Animated roadmap with bento grid cards connected by animated dots
// Zigzag flow: left → bottom-right → bottom-left → bottom-right
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

        {/* Animated Roadmap with Bento Cards */}
        <div className="relative">
          
          {/* Step 1 - Top Left */}
          <div className="flex justify-start mb-16 md:mb-20">
            <div className="relative group max-w-md">
              {/* Card */}
              <div className="bg-gradient-to-br from-[var(--clay-100)] via-[var(--sand)] to-[var(--clay-200)] p-10 rounded-[2rem] border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <UserPlus className="w-8 h-8 text-[var(--cream)]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--clay-600)] mb-2 uppercase tracking-wider">STEP 1</div>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-[var(--charcoal)] mb-4" style={{fontFamily: 'var(--font-fraunces)'}}>
                      Create Your Profile
                    </h3>
                    <p className="text-[var(--charcoal)]/70 leading-relaxed">
                      Share what feels comfortable. Tell us about your challenges, your goals, and what kind of support would be helpful for you.
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Connecting Line 1 - Curved path to Step 2 */}
          <svg className="hidden md:block absolute top-[180px] left-0 w-full h-[180px] pointer-events-none" style={{zIndex: 1}}>
            <path
              d="M 420 40 Q 520 90, 680 140"
              stroke="var(--clay-400)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="8 8"
              opacity="0.4"
              className="animate-dash"
            />
          </svg>

          {/* Step 2 - Middle Right */}
          <div className="flex justify-end mb-16 md:mb-20">
            <div className="relative group max-w-md">
              {/* Card */}
              <div className="bg-gradient-to-br from-[var(--sage-400)]/20 via-[var(--sand)] to-[var(--sage-500)]/30 p-10 rounded-[2rem] border-2 border-[var(--sage-500)]/30 hover:border-[var(--sage-600)]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--sage-500)] to-[var(--moss-600)] flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <Brain className="w-8 h-8 text-[var(--cream)]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--sage-600)] mb-2 uppercase tracking-wider">STEP 2</div>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-[var(--charcoal)] mb-4" style={{fontFamily: 'var(--font-fraunces)'}}>
                      Explore Your Patterns
                    </h3>
                    <p className="text-[var(--charcoal)]/70 leading-relaxed">
                      Gentle prompts help you notice energy changes, what drains you, and the environments that feel supportive. No judgment—just curious reflection.
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Connecting Line 2 - Curved path to Step 3 */}
          <svg className="hidden md:block absolute top-[440px] left-0 w-full h-[180px] pointer-events-none" style={{zIndex: 1}}>
            <path
              d="M 680 40 Q 520 90, 420 140"
              stroke="var(--clay-400)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="8 8"
              opacity="0.4"
              className="animate-dash"
              style={{animationDelay: '0.3s'}}
            />
          </svg>

          {/* Step 3 - Bottom Left */}
          <div className="flex justify-start mb-16 md:mb-20">
            <div className="relative group max-w-md">
              {/* Card */}
              <div className="bg-gradient-to-br from-[var(--clay-200)]/40 via-[var(--sand)] to-[var(--clay-300)]/50 p-10 rounded-[2rem] border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--moss-500)] to-[var(--moss-600)] flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="w-8 h-8 text-[var(--cream)]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--moss-600)] mb-2 uppercase tracking-wider">STEP 3</div>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-[var(--charcoal)] mb-4" style={{fontFamily: 'var(--font-fraunces)'}}>
                      Get Personalized Support
                    </h3>
                    <p className="text-[var(--charcoal)]/70 leading-relaxed">
                      Receive personalized suggestions, task breakdowns, and strategies to help you navigate daily challenges in ways that work for you.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Connection dot at bottom-right of Step 3 */}
              <div className="hidden md:block absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[var(--clay-500)] shadow-sm" style={{transform: 'translate(50%, 50%)'}}></div>
            </div>
          </div>

          {/* Connecting Line 3 - Curved S-path from Step 3 to Step 4 */}
          <svg className="hidden md:block absolute top-[680px] left-0 w-full h-[200px] pointer-events-none" style={{zIndex: 1}}>
            <path
              d="M 420 20 Q 500 60, 550 100 T 680 160"
              stroke="var(--clay-400)"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="8 8"
              opacity="0.5"
              className="animate-dash"
              style={{animationDelay: '0.6s'}}
            />
          </svg>

          {/* Step 4 - Bottom Right */}
          <div className="flex justify-end">
            <div className="relative group max-w-md">
              {/* Connection dot at top-left of Step 4 */}
              <div className="hidden md:block absolute top-0 left-0 w-2 h-2 rounded-full bg-[var(--clay-500)] shadow-sm" style={{transform: 'translate(-50%, -50%)'}}></div>
              
              {/* Card */}
              <div className="bg-gradient-to-br from-[var(--clay-300)]/30 via-[var(--sand)] to-[var(--clay-400)]/40 p-10 rounded-[2rem] border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-700)] flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <TrendingUp className="w-8 h-8 text-[var(--cream)]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--clay-600)] mb-2 uppercase tracking-wider">STEP 4</div>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-[var(--charcoal)] mb-4" style={{fontFamily: 'var(--font-fraunces)'}}>
                      Track Your Progress
                    </h3>
                    <p className="text-[var(--charcoal)]/70 leading-relaxed">
                      See your progress over time. Celebrate small wins, adjust what's working, and build confidence—all at your own pace.
                    </p>
                  </div>
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

      {/* CSS for animated dashed line */}
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -16;
          }
        }
        .animate-dash {
          animation: dash 1s linear infinite;
        }
      `}</style>
    </section>
  );
}
