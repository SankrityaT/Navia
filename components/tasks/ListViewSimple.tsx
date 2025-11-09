// FRONTEND: ADHD-Friendly List View
// Simple, scannable list with filters

'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { Clock, Square, CheckSquare, Timer, MoreHorizontal } from 'lucide-react';
import TaskModal from './TaskModal';

interface ListViewProps {
  tasks: Task[];
}

export default function ListView({ tasks }: ListViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'All', icon: '📋' },
    { key: 'career', label: 'Career', icon: '💼' },
    { key: 'finance', label: 'Finance', icon: '💰' },
    { key: 'daily_life', label: 'Daily', icon: '✅' },
    { key: 'social', label: 'Social', icon: '👥' },
  ];

  const filteredTasks = filterCategory === 'all'
    ? tasks
    : tasks.filter((task) => task.category === filterCategory);

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckSquare className="w-5 h-5 text-green-600" strokeWidth={2.5} />;
      case 'in_progress':
        return <Timer className="w-5 h-5 text-yellow-600" strokeWidth={2.5} />;
      default:
        return <Square className="w-5 h-5 text-[var(--charcoal)]/40" strokeWidth={2.5} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Complete';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-2xl p-4 border border-[var(--clay-300)]/30">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilterCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  filterCategory === cat.key
                    ? 'bg-[var(--clay-500)] text-[var(--cream)] shadow-md'
                    : 'bg-[var(--stone)] text-[var(--charcoal)]/70 hover:text-[var(--charcoal)]'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="text-sm">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.task_id}
              onClick={() => setSelectedTask(task)}
              className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-[var(--clay-300)]/30 hover:border-[var(--clay-400)]/50 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                {/* Status Checkbox */}
                <div className="flex-shrink-0">
                  {getStatusIcon(task.status)}
                </div>

                {/* Priority Dot */}
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getPriorityDot(task.priority)}`} />

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-[var(--charcoal)] ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                    {task.title}
                  </h4>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 text-sm text-[var(--charcoal)]/70 flex-shrink-0">
                  <Clock className="w-4 h-4" strokeWidth={2} />
                  <span className="font-medium">{task.time_estimate}min</span>
                </div>

                {/* Category Icon */}
                <span className="text-lg flex-shrink-0">
                  {categories.find(c => c.key === task.category)?.icon || '📋'}
                </span>

                {/* Status Label (desktop only) */}
                <div className="hidden sm:block flex-shrink-0 min-w-[100px]">
                  <span className="text-sm text-[var(--charcoal)]/60">
                    {getStatusLabel(task.status)}
                  </span>
                </div>

                {/* Expand */}
                <button className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <MoreHorizontal className="w-5 h-5 text-[var(--clay-500)]" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-[var(--charcoal)]/40 italic">
              No tasks in this category
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
}
