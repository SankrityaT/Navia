'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
}

export default function TaskCreationModal({ isOpen, onClose, onTaskCreated }: TaskCreationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'daily_life' as 'career' | 'finance' | 'daily_life',
    priority: 'medium' as 'low' | 'medium' | 'high',
    time_estimate: 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          title: '',
          category: 'daily_life',
          priority: 'medium',
          time_estimate: 30,
        });
        
        // Close modal
        onClose();
        
        // Trigger refresh
        if (onTaskCreated) {
          onTaskCreated();
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border-2 border-[var(--clay-200)] relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-[var(--sand)] rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-[var(--charcoal)]" />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-6" style={{fontFamily: 'var(--font-fraunces)'}}>
          Create New Task
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What do you need to do?"
              required
              className="w-full px-4 py-3 border-2 border-[var(--clay-200)] rounded-xl focus:border-[var(--clay-500)] focus:outline-none transition-colors text-[var(--charcoal)] placeholder:text-[var(--charcoal)]/40"
            />
          </div>

          {/* Category, Priority, Time in a row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-[var(--clay-200)] rounded-xl focus:border-[var(--clay-500)] focus:outline-none transition-colors text-[var(--charcoal)]"
              >
                <option value="daily_life">Daily Life</option>
                <option value="career">Career</option>
                <option value="finance">Finance</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-[var(--clay-200)] rounded-xl focus:border-[var(--clay-500)] focus:outline-none transition-colors text-[var(--charcoal)]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">
                Time (min)
              </label>
              <input
                type="number"
                value={formData.time_estimate}
                onChange={(e) => setFormData({ ...formData, time_estimate: parseInt(e.target.value) })}
                min="5"
                step="5"
                className="w-full px-4 py-3 border-2 border-[var(--clay-200)] rounded-xl focus:border-[var(--clay-500)] focus:outline-none transition-colors text-[var(--charcoal)]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-[var(--sand)] hover:bg-[var(--stone)] text-[var(--charcoal)] rounded-xl font-semibold transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
