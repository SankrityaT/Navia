// FRONTEND: ADHD-Friendly Task Visualizer
// Research-based design for neurodivergent users

'use client';

import { useState } from 'react';
import { LayoutGrid, List, Search, MessageCircle } from 'lucide-react';
import KanbanView from '@/components/tasks/KanbanView';
import ListView from '@/components/tasks/ListViewSimple';
import Link from 'next/link';

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
    <div className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
      {/* Organic background */}
      <div className="absolute inset-0 texture-grain"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--clay-200)] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>
      
      {/* Fixed Header */}
      <div className="relative z-10 bg-[var(--sand)]/95 backdrop-blur-md border-b border-[var(--clay-300)]/30 shadow-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back to Chat + Title */}
            <div className="flex items-center gap-4">
              <Link
                href="/chat"
                className="flex items-center gap-2 text-[var(--charcoal)]/60 hover:text-[var(--charcoal)] transition-colors font-medium"
              >
                <MessageCircle className="w-5 h-5" strokeWidth={2.5} />
                <span className="hidden sm:inline">Back to Chat</span>
              </Link>
              <div className="h-6 w-px bg-[var(--clay-300)]/40"></div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                Task Visualizer
              </h1>
            </div>

            {/* Right: View Toggle + Search */}
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex gap-1 bg-[var(--stone)] p-1 rounded-xl">
                <button
                  onClick={() => setView('kanban')}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    view === 'kanban'
                      ? 'bg-[var(--clay-500)] text-[var(--cream)] shadow-md'
                      : 'text-[var(--charcoal)]/70 hover:text-[var(--charcoal)]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Kanban</span>
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    view === 'list'
                      ? 'bg-[var(--clay-500)] text-[var(--cream)] shadow-md'
                      : 'text-[var(--charcoal)]/70 hover:text-[var(--charcoal)]'
                  }`}
                >
                  <List className="w-4 h-4" strokeWidth={2.5} />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>

              {/* Search Icon (placeholder for future) */}
              <button className="p-2 hover:bg-[var(--stone)] rounded-xl transition-colors">
                <Search className="w-5 h-5 text-[var(--charcoal)]/60" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {view === 'kanban' ? <KanbanView tasks={mockTasks} /> : <ListView tasks={mockTasks} />}
      </div>
    </div>
  );
}
