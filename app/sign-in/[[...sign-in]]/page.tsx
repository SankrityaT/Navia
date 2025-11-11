import { SignIn } from '@clerk/nextjs';
import { Sparkles, Heart, Shield, Leaf, TrendingUp, Brain } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--sand)] via-[var(--cream)] to-[var(--clay-100)] relative overflow-hidden">
      {/* Layered Background Effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--clay-200)] rounded-full blur-[140px] opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--sage-300)] rounded-full blur-[120px] opacity-25"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding & Welcome Back */}
          <div className="hidden lg:block space-y-8">
            {/* Logo & Tagline */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center shadow-lg">
                  <Leaf className="w-6 h-6 text-[var(--cream)]" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                    Navia
                  </h1>
                  <p className="text-sm text-[var(--charcoal)]/60">Beyond the Cliff</p>
                </div>
              </div>
              
              <h2 className="text-4xl font-serif font-bold text-[var(--charcoal)] leading-tight" style={{fontFamily: 'var(--font-fraunces)'}}>
                Welcome back to
                <span className="block text-[var(--clay-600)] italic font-light mt-1">your support system</span>
              </h2>
              
              <p className="text-lg text-[var(--charcoal)]/70 leading-relaxed">
                Continue your journey with personalized support designed for your neurodivergent mind.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-[var(--clay-200)] shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-[var(--cream)]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--charcoal)] mb-1">Your Progress Awaits</h3>
                    <p className="text-sm text-[var(--charcoal)]/70">Pick up where you left off with your personalized dashboard</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-[var(--sage-300)] shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--sage-500)] to-[var(--moss-600)] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-[var(--cream)]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--charcoal)] mb-1">Daily Support Ready</h3>
                    <p className="text-sm text-[var(--charcoal)]/70">Your AI coach is here whenever you need guidance</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-[var(--clay-200)] shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--moss-500)] to-[var(--moss-600)] flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-[var(--cream)]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--charcoal)] mb-1">See Your Growth</h3>
                    <p className="text-sm text-[var(--charcoal)]/70">Review your wins and celebrate your progress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-[var(--charcoal)]/70">
                <Shield className="w-4 h-4 text-[var(--sage-600)]" strokeWidth={2.5} />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--charcoal)]/70">
                <Heart className="w-4 h-4 text-[var(--clay-600)]" strokeWidth={2.5} />
                <span>Always here for you</span>
              </div>
            </div>
          </div>

          {/* Right Side - Clerk Sign In Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Mobile Logo */}
              <div className="lg:hidden mb-8 text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center shadow-lg">
                    <Leaf className="w-6 h-6 text-[var(--cream)]" strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <h1 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                      Navia
                    </h1>
                    <p className="text-sm text-[var(--charcoal)]/60">Beyond the Cliff</p>
                  </div>
                </div>
                <p className="text-lg text-[var(--charcoal)]/70">Welcome back</p>
              </div>

              {/* Clerk Sign In Component with Custom Styling */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-[var(--clay-200)]">
                <SignIn 
                  fallbackRedirectUrl="/dashboard-new"
                  signUpUrl="/sign-up"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "bg-transparent shadow-none",
                      headerTitle: "text-[var(--charcoal)] font-serif",
                      headerSubtitle: "text-[var(--charcoal)]/70",
                      socialButtonsBlockButton: "bg-white hover:bg-[var(--sand)] border-[var(--clay-300)] text-[var(--charcoal)]",
                      formButtonPrimary: "bg-gradient-to-r from-[var(--clay-500)] to-[var(--clay-600)] hover:from-[var(--clay-600)] hover:to-[var(--clay-700)] text-white shadow-lg",
                      formFieldInput: "border-[var(--clay-300)] focus:border-[var(--clay-500)] focus:ring-[var(--clay-500)]",
                      footerActionLink: "text-[var(--clay-600)] hover:text-[var(--clay-700)]",
                      identityPreviewText: "text-[var(--charcoal)]",
                      formFieldLabel: "text-[var(--charcoal)]",
                    }
                  }}
                />
              </div>

              {/* Additional Info */}
              <p className="text-center text-sm text-[var(--charcoal)]/60 mt-6">
                Need help? Contact us at support@navia.app
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
