// FRONTEND: List view for tasks grouped by category
// TODO: Implement sorting and filtering
// TODO: Add edit/delete actions

'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { Clock, MoreVertical, CheckCircle } from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
}

export default function ListView({ tasks }: ListViewProps) {
  const [sortBy, setSortBy] = useState<'priority' | 'due_date' | 'time_estimate'>('priority');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'All Tasks', icon: '📋' },
    { key: 'career', label: 'Career Tasks', icon: '📈' },
    { key: 'finance', label: 'Financial Tasks', icon: '💵' },
    { key: 'daily_life', label: 'Daily Tasks', icon: '🏠' },
    { key: 'social', label: 'Social Tasks', icon: '👥' },
  ];

  const getFilteredTasks = () => {
    return filterCategory === 'all'
      ? tasks
      : tasks.filter((task) => task.category === filterCategory);
  };

  const getTasksByCategory = (category: string) => {
    return tasks.filter((task) => task.category === category);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleToggleComplete = (taskId: string) => {
    // TODO: Call API to update task status
    console.log('Toggle task:', taskId);
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilterCategory(cat.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterCategory === cat.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium"
        >
          <option value="priority">Sort by Priority</option>
          <option value="due_date">Sort by Due Date</option>
          <option value="time_estimate">Sort by Time</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-6">
        {filterCategory === 'all' ? (
          // Grouped by category
          categories.slice(1).map((category) => {
            const categoryTasks = getTasksByCategory(category.key);
            if (categoryTasks.length === 0) return null;

            return (
              <div key={category.key} className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span>{category.icon}</span>
                    {category.label} ({categoryTasks.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {categoryTasks.map((task) => (
                    <TaskRow key={task.task_id} task={task} onToggle={handleToggleComplete} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          // Single category
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="divide-y divide-gray-200">
              {getFilteredTasks().map((task) => (
                <TaskRow key={task.task_id} task={task} onToggle={handleToggleComplete} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
      <button onClick={() => onToggle(task.task_id)} className="flex-shrink-0">
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            task.status === 'completed'
              ? 'border-green-600 bg-green-600'
              : 'border-gray-400 hover:border-gray-600'
          }`}
        >
          {task.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
        </div>
      </button>

      <div className="flex-1 min-w-0">
        <h4
          className={`font-medium ${
            task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
          }`}
        >
          {task.title}
        </h4>
      </div>

      <div className="flex items-center gap-1 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        <span>{task.time_estimate} min</span>
      </div>

      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
      >
        {task.priority}
      </span>

      {task.due_date && (
        <span className="text-sm text-gray-600">
          {new Date(task.due_date).toLocaleDateString()}
        </span>
      )}

      <button className="text-gray-400 hover:text-gray-600">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  );
}
