// FRONTEND: Kanban board view for tasks
// TODO: Implement drag-and-drop functionality (use @dnd-kit/core)
// TODO: Update task status in Pinecone on drop

'use client';

import { Task } from '@/lib/types';
import { Clock, MoreVertical } from 'lucide-react';

interface KanbanViewProps {
  tasks: Task[];
}

export default function KanbanView({ tasks }: KanbanViewProps) {
  const columns = [
    { status: 'not_started', title: 'Not Started', color: 'border-red-500' },
    { status: 'in_progress', title: 'In Progress', color: 'border-yellow-500' },
    { status: 'completed', title: 'Completed', color: 'border-green-500' },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'career':
        return '💼';
      case 'finance':
        return '💰';
      case 'daily_life':
        return '✅';
      case 'social':
        return '👥';
      default:
        return '📋';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div key={column.status} className="bg-gray-50 rounded-lg p-4">
          <div className={`border-l-4 ${column.color} pl-3 mb-4`}>
            <h3 className="text-lg font-bold text-gray-900">{column.title}</h3>
            <p className="text-sm text-gray-600">
              {getTasksByStatus(column.status).length} tasks
            </p>
          </div>

          <div className="space-y-3">
            {getTasksByStatus(column.status).map((task) => (
              <div
                key={task.task_id}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getCategoryIcon(task.category)}</span>
                    <div className={`w-2 h-2 rounded-full ${getPriorityDot(task.priority)}`} />
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{task.time_estimate} min</span>
                  </div>
                  {task.due_date && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {getTasksByStatus(column.status).length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No tasks
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
