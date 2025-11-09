// FRONTEND: Final CTA section
// TODO: Add email capture for waitlist if needed

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTAFooter() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Start Your Journey Today
        </h2>
        <p className="text-xl text-blue-100 mb-10">
          Join Navia and get the support you deserve beyond the cliff
        </p>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          Get Started Free
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
