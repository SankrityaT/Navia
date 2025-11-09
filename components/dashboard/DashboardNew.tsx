// Main dashboard with warm-organic aesthetic
// Bento grid layout, no phone mockup

'use client';

import { Task } from '@/lib/types';
import { CheckCircle2, Circle, Clock, TrendingUp, Target, Zap, Calendar } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  quickWins: Task[];
  goals: Array<{
    name: string;
    completed: number;
    total: number;
    color: string;
  }>;
}

export default function Dashboard({ tasks, quickWins, goals }: DashboardProps) {
  const todayTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 5);
  const completedToday = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream)] via-[var(--sand)] to-[var(--clay-50)] relative overflow-hidden">
      {/* Floating decorative blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[var(--clay-200)] rounded-full blur-[120px] opacity-20"></div>
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-[var(--sage-300)] rounded-full blur-[100px] opacity-15"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Today's Focus Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 lg:p-8 border-2 border-[var(--clay-200)] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center shadow-md">
                    <Target className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                      Today's Focus
                    </h2>
                    <p className="text-sm text-[var(--charcoal)]/60">Your priority tasks</p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-[var(--sage-100)] to-[var(--sage-200)] rounded-full border border-[var(--sage-300)]">
                  <span className="text-sm font-semibold text-[var(--sage-700)]">
                    {todayTasks.length} tasks
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-[var(--sage-500)] mx-auto mb-3" strokeWidth={2} />
                    <p className="text-[var(--charcoal)]/60">All caught up! 🎉</p>
                  </div>
                ) : (
                  todayTasks.map((task) => (
                    <div
                      key={task.task_id}
                      className="group flex items-start gap-4 p-4 bg-white rounded-xl border-2 border-[var(--clay-200)] hover:border-[var(--clay-400)] hover:shadow-md transition-all duration-300"
                    >
                      <button className="mt-0.5 flex-shrink-0">
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-[var(--sage-600)]" strokeWidth={2.5} />
                        ) : (
                          <Circle className="w-5 h-5 text-[var(--clay-400)] group-hover:text-[var(--clay-600)]" strokeWidth={2.5} />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--charcoal)] mb-1">{task.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-[var(--charcoal)]/60">
                          <span className="px-2 py-1 bg-[var(--clay-100)] rounded-md font-medium">
                            {task.category}
                          </span>
                          {task.time_estimate && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.time_estimate}m
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Progress Tracker */}
            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 lg:p-8 border-2 border-[var(--clay-200)] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] flex items-center justify-center shadow-md">
                  <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                    Goal Progress
                  </h2>
                  <p className="text-sm text-[var(--charcoal)]/60">Track your journey</p>
                </div>
              </div>

              <div className="space-y-4">
                {goals.map((goal, index) => {
                  const percentage = Math.round((goal.completed / goal.total) * 100);
                  return (
                    <div key={index} className="p-4 bg-white rounded-xl border-2 border-[var(--clay-200)]">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-[var(--charcoal)]">{goal.name}</h3>
                        <span className="text-sm font-bold text-[var(--charcoal)]">
                          {goal.completed}/{goal.total}
                        </span>
                      </div>
                      <div className="relative h-3 bg-[var(--clay-100)] rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${
                            index === 0 
                              ? 'from-[var(--clay-500)] to-[var(--clay-600)]' 
                              : 'from-[var(--sage-500)] to-[var(--sage-600)]'
                          } rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-[var(--charcoal)]/60 mt-2">{percentage}% complete</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-[var(--clay-200)] via-[var(--sand)] to-[var(--clay-100)] rounded-[2rem] p-6 border-2 border-[var(--clay-300)]/40 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  Today's Stats
                </h3>
              </div>
              
              <div className="space-y-2.5">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-[var(--clay-200)] min-h-[72px] flex flex-col justify-center">
                  <div className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-0.5 leading-none" style={{fontFamily: 'var(--font-fraunces)'}}>
                    {completionRate}%
                  </div>
                  <p className="text-xs text-[var(--charcoal)]/70 leading-tight">Completion Rate</p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-[var(--clay-200)] min-h-[72px] flex flex-col justify-center">
                  <div className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-0.5 leading-none" style={{fontFamily: 'var(--font-fraunces)'}}>
                    {completedToday}
                  </div>
                  <p className="text-xs text-[var(--charcoal)]/70 leading-tight">Tasks Completed</p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-[var(--clay-200)] min-h-[72px] flex flex-col justify-center">
                  <div className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-0.5 leading-none" style={{fontFamily: 'var(--font-fraunces)'}}>
                    {todayTasks.length}
                  </div>
                  <p className="text-xs text-[var(--charcoal)]/70 leading-tight">Tasks Remaining</p>
                </div>
              </div>
            </div>

            {/* Quick Wins */}
            <div className="bg-gradient-to-br from-[var(--sage-400)]/20 via-white to-[var(--sage-300)]/20 rounded-[2rem] p-6 border-2 border-[var(--sage-400)]/30 shadow-lg hover:shadow-xl transition-all duration-300 flex-grow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  Quick Wins
                </h3>
              </div>
              
              <div className="space-y-3">
                {quickWins.slice(0, 3).map((task) => (
                  <div
                    key={task.task_id}
                    className="group p-3 bg-white rounded-xl border border-[var(--sage-300)] hover:border-[var(--sage-500)] hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <Circle className="w-4 h-4 text-[var(--sage-500)] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--charcoal)] mb-1">{task.title}</p>
                        {task.time_estimate && (
                          <div className="flex items-center gap-1 text-xs text-[var(--charcoal)]/60">
                            <Clock className="w-3 h-3" />
                            {task.time_estimate}m
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational Card - Aligned with Goal Progress */}
            <div className="bg-white rounded-[2rem] p-5 border-2 border-[var(--charcoal)] shadow-lg flex-shrink-0">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Calendar className="w-8 h-8 text-[var(--charcoal)]" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>
                    Keep Going!
                  </h3>
                  <p className="text-sm text-[var(--charcoal)]/70 leading-relaxed">
                    You're making great progress. Remember, small steps lead to big achievements. 💚
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
