// FRONTEND: Solution preview section
// TODO: Add hover effects on cards
// TODO: Link to actual dashboard screenshot when available

import { Briefcase, ListChecks, Users } from 'lucide-react';

export default function Solution() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your AI Executive Function Coach
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Navia provides the structure and support you need to thrive post-graduation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Career Support */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Briefcase className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Career Support</h3>
            <p className="text-gray-600">
              Break down job searching into manageable steps. Track applications, prepare for interviews, and build your professional network.
            </p>
          </div>

          {/* Task Breakdown */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <ListChecks className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Task Breakdown</h3>
            <p className="text-gray-600">
              AI-powered task decomposition turns overwhelming projects into clear, actionable steps with time estimates.
            </p>
          </div>

          {/* Peer Network */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Peer Network</h3>
            <p className="text-gray-600">
              Connect with others navigating similar challenges. Share strategies and celebrate wins together.
            </p>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Your Personal Dashboard
          </h3>
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-96 flex items-center justify-center">
            <p className="text-gray-500 text-lg">Dashboard Screenshot Placeholder</p>
          </div>
        </div>
      </div>
    </section>
  );
}
