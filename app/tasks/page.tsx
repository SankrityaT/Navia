// FRONTEND: Task visualizer page with Kanban and List views
// TODO: Fetch tasks from API

'use client';

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import KanbanView from '@/components/tasks/KanbanView';
import ListView from '@/components/tasks/ListView';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TasksPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  // TODO: Fetch real tasks from API
  const mockTasks = [
    {
      user_id: 'user_1',
      task_id: 'task_1',
      title: 'Update resume with recent projects',
      status: 'in_progress' as const,
      priority: 'high' as const,
      time_estimate: 45,
      category: 'career' as const,
      created_by: 'system',
      created_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    },
    {
      user_id: 'user_1',
      task_id: 'task_2',
      title: 'Research 5 companies in your field',
      status: 'not_started' as const,
      priority: 'medium' as const,
      time_estimate: 30,
      category: 'career' as const,
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
    {
      user_id: 'user_1',
      task_id: 'task_3',
      title: 'Set up monthly budget tracker',
      status: 'not_started' as const,
      priority: 'high' as const,
      time_estimate: 60,
      category: 'finance' as const,
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
    {
      user_id: 'user_1',
      task_id: 'task_4',
      title: 'Complete job application for Software Engineer role',
      status: 'completed' as const,
      priority: 'high' as const,
      time_estimate: 90,
      category: 'career' as const,
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
    {
      user_id: 'user_1',
      task_id: 'task_5',
      title: 'Organize weekly meal planning',
      status: 'in_progress' as const,
      priority: 'low' as const,
      time_estimate: 20,
      category: 'daily_life' as const,
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
    {
      user_id: 'user_1',
      task_id: 'task_6',
      title: 'Reach out to college friend for coffee',
      status: 'not_started' as const,
      priority: 'medium' as const,
      time_estimate: 15,
      category: 'social' as const,
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Task Visualizer</h1>
            </div>

            {/* View toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setView('kanban')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  view === 'kanban'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                Kanban
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-5 h-5" />
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {view === 'kanban' ? <KanbanView tasks={mockTasks} /> : <ListView tasks={mockTasks} />}
      </div>
    </div>
  );
}
