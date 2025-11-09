// FRONTEND: Today's priority tasks section
// TODO: Fetch tasks from API (Pinecone query)
// TODO: Implement task completion toggle
// TODO: Implement "Ask Navia" chat modal

'use client';

import { useState } from 'react';
import { Clock, MessageCircle, CheckCircle } from 'lucide-react';
import { Task } from '@/lib/types';

interface TodaysFocusProps {
  tasks: Task[];
}

export default function TodaysFocus({ tasks }: TodaysFocusProps) {
  const [localTasks, setLocalTasks] = useState(tasks);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    // TODO: Call API to update task status in Pinecone
    setLocalTasks(
      localTasks.map((task) =>
        task.task_id === taskId
          ? {
              ...task,
              status: task.status === 'completed' ? 'in_progress' : 'completed',
            }
          : task
      )
    );
  };

  const handleAskNavia = (task: Task) => {
    // TODO: Open chat modal with task context
    console.log('Ask Navia about:', task.title);
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Today&apos;s Focus</h2>
      <div className="grid gap-4">
        {localTasks.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
            <p className="text-gray-600">No tasks for today. Great job staying on top of things!</p>
          </div>
        ) : (
          localTasks.map((task) => (
            <div
              key={task.task_id}
              className={`border-l-4 rounded-lg p-4 ${getPriorityColor(task.priority)}`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggleComplete(task.task_id)}
                  className="mt-1 flex-shrink-0"
                >
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      task.status === 'completed'
                        ? 'border-green-600 bg-green-600'
                        : 'border-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {task.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                </button>

                <div className="flex-1">
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}
                  >
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{task.time_estimate} min</span>
                    </div>
                    <span className="px-2 py-1 bg-white rounded text-xs font-medium">
                      {task.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleAskNavia(task)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Ask Navia
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
