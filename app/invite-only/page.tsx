import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export default function InviteOnlyPage() {
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
        <div className="max-w-2xl mx-auto text-center">
          {/* Lock Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center mb-8 mx-auto shadow-lg animate-scale-in delay-300">
            <Lock className="w-10 h-10 text-[var(--cream)]" strokeWidth={2.5} />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-[var(--charcoal)] mb-6 leading-[1.1] tracking-tight animate-fade-in-up delay-400" style={{fontFamily: 'var(--font-fraunces)'}}>
            Navia is
            <span className="block mt-3 text-[var(--clay-600)] italic font-light">Invite-Only</span>
          </h1>

          {/* Message */}
          <p className="text-xl md:text-2xl text-[var(--charcoal)]/80 mb-8 leading-relaxed font-light animate-fade-in-up delay-500">
            I'm currently in early access and only available to invited users.
          </p>

          <div className="bg-[var(--sand)]/60 backdrop-blur-sm p-8 rounded-2xl border border-[var(--clay-300)]/30 mb-8 animate-fade-in-up delay-600">
            <p className="text-lg text-[var(--charcoal)]/70 leading-relaxed mb-4">
              Want to be part of the journey?
            </p>
            <p className="text-base text-[var(--charcoal)]/60 leading-relaxed">
              Join the waitlist and I'll personally reach out when it's your turn. I'm building this with care, and I want to make sure I can give you the support you deserve.
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/waitlist"
            className="inline-flex items-center gap-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] px-10 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 animate-scale-in delay-700"
          >
            Join the Waitlist
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-8 text-center text-sm text-[var(--charcoal)]/50">
        <p>© 2025 Navia. Built with care for neurodivergent minds.</p>
      </footer>
    </main>
  );
}
