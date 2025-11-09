// Social Proof - Testimonials with soft, supportive design
// Emphasizes safety, understanding, and trust

import { Quote } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            You're In
            <span className="block text-[#E5989B]">Good Company</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Hear from neurodivergent young adults finding their way
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Testimonial 1 */}
          <div className="bg-gradient-to-br from-[#FFF5F0] to-[#FFE5D9] p-8 rounded-3xl">
            <Quote className="w-8 h-8 text-[#FFB4A2] mb-6" />
            <p className="text-gray-700 leading-relaxed mb-6">
              "For the first time since graduating, I don't feel like I'm drowning. Navia helps me break down tasks without judgment."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFB4A2] to-[#E5989B]"></div>
              <div>
                <div className="font-semibold text-gray-900">Alex</div>
                <div className="text-sm text-gray-600">ADHD, Class of 2023</div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] p-8 rounded-3xl">
            <Quote className="w-8 h-8 text-[#52B788] mb-6" />
            <p className="text-gray-700 leading-relaxed mb-6">
              "The masking assessment was eye-opening. I finally understand why I'm so exhausted all the time, and I have strategies that actually work."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#95D5B2] to-[#52B788]"></div>
              <div>
                <div className="font-semibold text-gray-900">Jordan</div>
                <div className="text-sm text-gray-600">Autistic, Class of 2022</div>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-gradient-to-br from-[#E5C1CD] to-[#FFE5D9] p-8 rounded-3xl">
            <Quote className="w-8 h-8 text-[#E5989B] mb-6" />
            <p className="text-gray-700 leading-relaxed mb-6">
              "Navia doesn't make me feel broken. It meets me where I am and helps me build confidence in my own way of doing things."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E5989B] to-[#E5C1CD]"></div>
              <div>
                <div className="font-semibold text-gray-900">Sam</div>
                <div className="text-sm text-gray-600">Dyslexic, Class of 2024</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gradient-to-br from-[#FFF9F5] to-white p-12 rounded-3xl border border-[#FFB4A2]/10">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Built With Neurodivergent Voices
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-[#52B788] mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Co-designed with neurodivergent adults</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Every feature is shaped by lived experience, not assumptions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-[#E5989B] mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Privacy-first approach</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Your data is yours. We never share or sell your information.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-[#FFB4A2] mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Evidence-based strategies</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Grounded in executive function research and neurodiversity-affirming practices.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-[#95D5B2] mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Continuously improving</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    We listen to feedback and evolve based on what you need.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
