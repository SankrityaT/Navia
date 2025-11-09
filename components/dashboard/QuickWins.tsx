// FRONTEND: Quick wins sidebar - micro tasks under 10 minutes
// TODO: Fetch from Pinecone with duration filter

'use client';

import { CheckCircle, Zap } from 'lucide-react';
import { Task } from '@/lib/types';

interface QuickWinsProps {
  tasks: Task[];
}

export default function QuickWins({ tasks }: QuickWinsProps) {
  const handleComplete = async (taskId: string) => {
    // TODO: Call API to mark task as complete
    console.log('Complete quick win:', taskId);
  };

  return (
    <aside className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-600" />
        <h3 className="text-xl font-bold text-gray-900">Quick Wins</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">Tasks under 10 minutes</p>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No quick wins available
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.task_id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <button
                onClick={() => handleComplete(task.task_id)}
                className="mt-0.5 flex-shrink-0"
              >
                <div className="w-5 h-5 rounded border-2 border-gray-400 hover:border-green-600 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-transparent hover:text-green-600" />
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">{task.title}</p>
                <p className="text-xs text-gray-600">{task.time_estimate} min</p>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
