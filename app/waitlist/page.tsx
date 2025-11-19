import Link from 'next/link';
import { ArrowLeft, Users, Sparkles, Heart } from 'lucide-react';
import WaitlistForm from '@/components/landing/WaitlistForm';

export default function WaitlistPage() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-[var(--cream)]">
      {/* Layered organic background */}
      <div className="absolute inset-0 bg-[var(--cream)] texture-grain"></div>
      <div className="absolute inset-0 organic-blob opacity-40"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--clay-200)] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--sage-400)] rounded-full blur-[100px] opacity-15 translate-y-1/3 -translate-x-1/4"></div>

      {/* Navigation */}
      <nav className="relative z-10 w-full px-6 py-8 md:px-12 animate-fade-in">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group animate-slide-in-left delay-100">
            <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-[#c4a574] via-[#9ca986] to-[#6b8e6f] shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-[#c4a574]/80 via-[#9ca986]/80 to-[#6b8e6f]/80" />
            </div>
            <span className="text-2xl font-serif font-semibold text-[var(--charcoal)] tracking-tight" style={{fontFamily: 'var(--font-fraunces)'}}>Navia</span>
          </Link>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-[var(--charcoal)] hover:text-[var(--clay-600)] transition-colors duration-300 font-medium animate-fade-in delay-200"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--sand)]/80 backdrop-blur-sm rounded-full border border-[var(--clay-300)]/30 mb-8 shadow-sm animate-scale-in delay-300">
            <Sparkles className="w-4 h-4 text-[var(--clay-600)]" strokeWidth={2.5} />
            <span className="text-sm text-[var(--charcoal)] font-medium">Early Access</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-[var(--charcoal)] mb-6 leading-[1.1] tracking-tight animate-fade-in-up delay-400" style={{fontFamily: 'var(--font-fraunces)'}}>
            Join the
            <span className="block mt-3 text-[var(--clay-600)] italic font-light">Navia Community</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-[var(--charcoal)]/80 mb-4 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in-up delay-500">
            Be among the first to experience AI-powered support designed for neurodivergent minds.
          </p>
          <p className="text-base md:text-lg text-[var(--charcoal)]/60 mb-12 max-w-xl mx-auto leading-relaxed animate-fade-in-up delay-600">
            Get early access, exclusive updates, and help shape the future of Navia.
          </p>

          {/* Waitlist Form */}
          <div className="mb-16 animate-scale-in delay-700">
            <WaitlistForm />
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-[var(--sand)]/60 backdrop-blur-sm p-8 rounded-2xl border border-[var(--clay-300)]/20 hover:border-[var(--clay-400)]/40 transition-all duration-500 hover:-translate-y-1 animate-fade-in-up delay-800">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center mb-4 mx-auto shadow-md">
                <Sparkles className="w-6 h-6 text-[var(--cream)]" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-serif font-semibold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>
                Early Access
              </h3>
              <p className="text-sm text-[var(--charcoal)]/60">
                Be the first to try new features and shape the product
              </p>
            </div>

            <div className="bg-[var(--sand)]/60 backdrop-blur-sm p-8 rounded-2xl border border-[var(--clay-300)]/20 hover:border-[var(--clay-400)]/40 transition-all duration-500 hover:-translate-y-1 animate-fade-in-up delay-[900ms]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--sage-400)] to-[var(--sage-600)] flex items-center justify-center mb-4 mx-auto shadow-md">
                <Users className="w-6 h-6 text-[var(--cream)]" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-serif font-semibold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>
                Exclusive Community
              </h3>
              <p className="text-sm text-[var(--charcoal)]/60">
                Connect with other early adopters and share your journey
              </p>
            </div>

            <div className="bg-[var(--sand)]/60 backdrop-blur-sm p-8 rounded-2xl border border-[var(--clay-300)]/20 hover:border-[var(--clay-400)]/40 transition-all duration-500 hover:-translate-y-1 animate-fade-in-up delay-[1000ms]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--moss-500)] to-[var(--moss-600)] flex items-center justify-center mb-4 mx-auto shadow-md">
                <Heart className="w-6 h-6 text-[var(--cream)]" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-serif font-semibold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>
                Special Perks
              </h3>
              <p className="text-sm text-[var(--charcoal)]/60">
                Enjoy exclusive benefits and discounts as a founding member
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-8 text-center text-sm text-[var(--charcoal)]/50">
        <p>© 2025 Navia. Built with care for neurodivergent minds.</p>
      </footer>
    </main>
  );
}
