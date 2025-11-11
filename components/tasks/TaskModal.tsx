// FRONTEND: Task detail modal (ADHD-friendly)
// Shows full task details, tips from Navia, and actions

'use client';

import { Task } from '@/lib/types';
import { X, Clock, AlertCircle, MessageCircle, CheckCircle2 } from 'lucide-react';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return { label: 'High', color: 'text-red-600', bg: 'bg-red-100' };
      case 'medium':
        return { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'low':
        return { label: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
      default:
        return { label: 'Normal', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'career':
        return { label: 'Career', icon: '📈' };
      case 'finance':
        return { label: 'Finance', icon: '💵' };
      case 'daily_life':
        return { label: 'Daily Life', icon: '🏠' };
      case 'social':
        return { label: 'Social', icon: '👥' };
      default:
        return { label: 'Other', icon: '📋' };
    }
  };

  const priority = getPriorityLabel(task.priority);
  const category = getCategoryLabel(task.category);

  // Mock details and tips (in real app, fetch from metadata)
  const taskDetails = task.metadata?.details || "This task is part of your larger goal. Take it one step at a time.";
  const naviaTips = task.metadata?.tips || "Task initiation is hard with ADHD. Just open the document first—don't commit to finishing. 5 minutes is enough to start.";

  const handleMarkComplete = () => {
    // TODO: Call API to update task status
    console.log('Mark complete:', task.task_id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--sand)] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[var(--clay-300)]/40">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--sand)] border-b border-[var(--clay-300)]/30 p-6 flex items-start justify-between">
          <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)] pr-8" style={{fontFamily: 'var(--font-fraunces)'}}>
            {task.title}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-[var(--stone)] rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-[var(--charcoal)]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metadata Row */}
          <div className="flex flex-wrap gap-4">
            {/* Time */}
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--stone)] rounded-xl">
              <Clock className="w-5 h-5 text-[var(--clay-600)]" strokeWidth={2.5} />
              <div>
                <p className="text-xs text-[var(--charcoal)]/60 font-medium">Time</p>
                <p className="font-semibold text-[var(--charcoal)]">{task.time_estimate} min</p>
              </div>
            </div>

            {/* Priority */}
            <div className={`flex items-center gap-2 px-4 py-2 ${priority.bg} rounded-xl`}>
              <AlertCircle className={`w-5 h-5 ${priority.color}`} strokeWidth={2.5} />
              <div>
                <p className="text-xs text-[var(--charcoal)]/60 font-medium">Priority</p>
                <p className={`font-semibold ${priority.color}`}>{priority.label}</p>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--stone)] rounded-xl">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <p className="text-xs text-[var(--charcoal)]/60 font-medium">Category</p>
                <p className="font-semibold text-[var(--charcoal)]">{category.label}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <h3 className="text-lg font-serif font-bold text-[var(--charcoal)] mb-3" style={{fontFamily: 'var(--font-fraunces)'}}>
              Details
            </h3>
            <p className="text-[var(--charcoal)]/80 leading-relaxed">
              {taskDetails}
            </p>
          </div>

          {/* Tips from Navia */}
          <div className="bg-[var(--sage-400)]/20 border-2 border-[var(--sage-500)]/30 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[var(--sage-500)]/30 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-[var(--sage-600)]" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-[var(--sage-700)] mb-1" style={{fontFamily: 'var(--font-fraunces)'}}>
                  Tips from Navia
                </h3>
                <p className="text-[var(--charcoal)]/80 text-sm leading-relaxed italic">
                  "{naviaTips}"
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => window.location.href = '/chat'}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[var(--stone)] hover:bg-[var(--clay-200)] text-[var(--charcoal)] rounded-2xl font-semibold transition-all duration-300 border-2 border-[var(--clay-300)]/40"
            >
              <MessageCircle className="w-5 h-5" strokeWidth={2.5} />
              Ask Navia About This
            </button>
            <button
              onClick={handleMarkComplete}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
              Mark Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
