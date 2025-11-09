// FRONTEND: Progress tracker for active goals
// TODO: Calculate progress from Pinecone task counts

'use client';

interface Goal {
  name: string;
  completed: number;
  total: number;
  color: string;
}

interface ProgressTrackerProps {
  goals: Goal[];
}

export default function ProgressTracker({ goals }: ProgressTrackerProps) {
  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <section className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Progress Tracker</h3>

      <div className="space-y-6">
        {goals.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No active goals yet
          </p>
        ) : (
          goals.map((goal, index) => {
            const percentage = getProgressPercentage(goal.completed, goal.total);
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{goal.name}</span>
                  <span className="text-sm text-gray-600">
                    {percentage}% ({goal.completed}/{goal.total} steps)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${goal.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
