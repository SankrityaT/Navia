// FRONTEND: Main dashboard page with warm-organic aesthetic
// TODO: Fetch tasks from API
// TODO: Get user info from Clerk

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/components/dashboard/HeaderNew';
import Dashboard from '@/components/dashboard/DashboardNew';

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
    <>
      <Header userName={userName} />
      <Dashboard tasks={mockTasks} quickWins={mockQuickWins} goals={mockGoals} />
    </>
  );
}
