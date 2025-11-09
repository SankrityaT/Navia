// FRONTEND: Main dashboard page
// TODO: Fetch tasks from API
// TODO: Get user info from Clerk

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import TodaysFocus from '@/components/dashboard/TodaysFocus';
import QuickWins from '@/components/dashboard/QuickWins';
import ProgressTracker from '@/components/dashboard/ProgressTracker';
import Link from 'next/link';
import { LayoutGrid, MessageCircle, Users } from 'lucide-react';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  const userName = user?.firstName || user?.username || 'there';

  // TODO: Fetch real data from API
  const mockTasks = [
    {
      user_id: userId,
      task_id: 'task_1',
      title: 'Update resume with recent projects',
      status: 'in_progress' as const,
      priority: 'high' as const,
      time_estimate: 45,
      category: 'career' as const,
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
    {
      user_id: userId,
      task_id: 'task_2',
      title: 'Research 5 companies in your field',
      status: 'not_started' as const,
      priority: 'medium' as const,
      time_estimate: 30,
      category: 'career' as const,
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
  ];

  const mockQuickWins = [
    {
      user_id: userId,
      task_id: 'quick_1',
      title: 'Check LinkedIn messages',
      status: 'not_started' as const,
      priority: 'low' as const,
      time_estimate: 5,
      category: 'career' as const,
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
  ];

  const mockGoals = [
    { name: 'Job Search', completed: 6, total: 40, color: 'bg-blue-600' },
    { name: 'Financial Independence', completed: 3, total: 15, color: 'bg-green-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={userName} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick nav */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <LayoutGrid className="w-5 h-5" />
            View All Tasks
          </Link>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Navia
          </Link>
          <Link
            href="/peers"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <Users className="w-5 h-5" />
            Peer Network
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <TodaysFocus tasks={mockTasks} />
            <ProgressTracker goals={mockGoals} />
          </div>

          {/* Sidebar */}
          <div>
            <QuickWins tasks={mockQuickWins} />
          </div>
        </div>
      </div>
    </div>
  );
}
