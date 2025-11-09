// Final CTA and Footer with calming, reassuring design
// Minimal footer links in muted tones

import Link from 'next/link';
import { ArrowRight, Mail, Heart, Sparkles } from 'lucide-react';

export default function CTAFooter() {
  return (
    <>
      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#FFF5F0] via-[#FFE5D9] to-[#E5C1CD]">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-[#FFB4A2]/20 mb-8">
            <Heart className="w-4 h-4 text-[#E5989B]" />
            <span className="text-sm text-gray-600">You deserve support that doesn't end with a diploma</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Ready to Take the
            <span className="block text-[#E5989B]">First Step?</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            Start your journey with a gentle check-in that listens. No pressure, no judgment—just understanding support.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-[#E5989B] hover:bg-[#D88A8C] text-white px-10 py-5 rounded-full text-lg font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Begin Your Assessment
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="mailto:support@navia.app"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-10 py-5 rounded-full text-lg font-medium transition-all border-2 border-gray-200"
            >
              <Mail className="w-5 h-5" />
              Questions? Reach Out
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo and Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFB4A2] to-[#E5989B] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-800">Navia</div>
                <div className="text-sm text-gray-500">Beyond the Cliff</div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="flex items-center gap-8 text-sm text-gray-600">
              <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
              <a href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-gray-900 transition-colors">Terms</a>
              <a href="mailto:support@navia.app" className="hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
            <p>© 2024 Navia. Built with care for neurodivergent minds.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
