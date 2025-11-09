// FRONTEND: Problem section showing the support cliff
// TODO: Add interactive graph/chart showing support drop-off
// TODO: Add testimonials or real data points

import { TrendingDown, AlertCircle } from 'lucide-react';

export default function Problem() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            The Post-Graduation Cliff
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Neurodivergent students face a sudden drop in support after college
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Visual representation */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <TrendingDown className="w-8 h-8 text-red-600" />
              <h3 className="text-2xl font-bold text-gray-900">Support Cliff</h3>
            </div>
            
            {/* Simple visual graph */}
            <div className="relative h-64 flex items-end justify-around">
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 bg-green-500 rounded-t-lg" style={{ height: '80%' }}></div>
                <span className="text-sm font-medium text-gray-700">College</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 bg-red-500 rounded-t-lg" style={{ height: '20%' }}></div>
                <span className="text-sm font-medium text-gray-700">Post-Grad</span>
              </div>
            </div>
          </div>

          {/* Key problems */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  No More Academic Support
                </h4>
                <p className="text-gray-600">
                  Disability services, tutoring, and structured schedules vanish overnight
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Executive Function Challenges
                </h4>
                <p className="text-gray-600">
                  Task initiation, time management, and organization become overwhelming
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  High Unemployment
                </h4>
                <p className="text-gray-600">
                  30-40% unemployment rate despite having valuable skills and education
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
