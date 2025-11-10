'use client';

import { useState } from 'react';
import { LayoutGrid, List, Search } from 'lucide-react';
import KanbanView from '@/components/tasks/KanbanView';
import ListView from '@/components/tasks/ListViewSimple';
import TaskForm from '@/components/tasks/TaskForm';
import { Task } from '@/lib/types';

interface TasksClientProps {
  initialTasks: Task[];
}

export default function TasksClient({ initialTasks }: TasksClientProps) {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  return (
    <div className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
      {/* Organic background */}
      <div className="absolute inset-0 texture-grain"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--clay-200)] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>
      
      {/* Fixed Header */}
      <div className="relative z-10 bg-[var(--sand)]/95 backdrop-blur-md border-b border-[var(--clay-300)]/30 shadow-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Spacer for centering */}
            <div className="flex-1"></div>

            {/* Center: Title */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                Task Visualizer
              </h1>
            </div>

            {/* Right: View Toggle + Search */}
            <div className="flex-1 flex items-center justify-end gap-3">
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
        {/* Creative Info Banner */}
        <div className="mb-8 relative overflow-hidden">
          {/* Floating Background Orbs */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--sage-400)]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--clay-400)]/20 rounded-full blur-2xl"></div>
          
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-[var(--clay-200)]/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Animated Icon Circle */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--clay-500)] to-[var(--sage-500)] rounded-2xl blur-md opacity-40 animate-pulse"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--sage-500)] flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                    <LayoutGrid className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                      Your Task Command Center
                    </h2>
                    <span className="hidden sm:inline-block px-2 py-0.5 bg-gradient-to-r from-[var(--sage-400)] to-[var(--sage-500)] text-white text-xs font-bold rounded-full">
                      NEW
                    </span>
                  </div>
                  <p className="text-sm text-[var(--charcoal)]/70 leading-relaxed mb-4 max-w-2xl">
                    Effortlessly organize, prioritize, and track your tasks. Drag cards across columns, switch between views, and stay on top of your goals.
                  </p>
                  
                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-2">
                    <div className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--sage-100)] to-[var(--sage-200)] rounded-full border border-[var(--sage-300)] hover:shadow-md transition-all duration-300">
                      <div className="w-2 h-2 rounded-full bg-[var(--sage-500)] group-hover:animate-pulse"></div>
                      <span className="text-xs font-semibold text-[var(--sage-700)]">Drag & Drop</span>
                    </div>
                    <div className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--clay-100)] to-[var(--clay-200)] rounded-full border border-[var(--clay-300)] hover:shadow-md transition-all duration-300">
                      <div className="w-2 h-2 rounded-full bg-[var(--clay-500)] group-hover:animate-pulse"></div>
                      <span className="text-xs font-semibold text-[var(--clay-700)]">Quick View</span>
                    </div>
                    <div className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--stone)] to-[var(--sand)] rounded-full border border-[var(--clay-300)] hover:shadow-md transition-all duration-300">
                      <div className="w-2 h-2 rounded-full bg-[var(--charcoal)] group-hover:animate-pulse"></div>
                      <span className="text-xs font-semibold text-[var(--charcoal)]">Live Updates</span>
                    </div>
                  </div>
                </div>
                
                {/* Decorative Element */}
                <div className="hidden lg:block flex-shrink-0">
                  <div className="flex flex-col gap-2">
                    <div className="w-12 h-2 bg-gradient-to-r from-[var(--sage-400)] to-transparent rounded-full"></div>
                    <div className="w-16 h-2 bg-gradient-to-r from-[var(--clay-400)] to-transparent rounded-full"></div>
                    <div className="w-10 h-2 bg-gradient-to-r from-[var(--sage-500)] to-transparent rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Accent Line */}
            <div className="h-1 bg-gradient-to-r from-[var(--sage-400)] via-[var(--clay-400)] to-[var(--sage-400)]"></div>
          </div>
        </div>

        {/* Add Task Button */}
        <div className="mb-6">
          <TaskForm />
        </div>

        {/* Task Views */}
        {view === 'kanban' ? <KanbanView tasks={initialTasks} /> : <ListView tasks={initialTasks} />}
      </div>
    </div>
  );
}
