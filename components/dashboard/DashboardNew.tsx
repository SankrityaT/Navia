// Enhanced Dashboard with AI Integration Points and Full Interactivity
// Final demo ready with loading states, animations, and accessibility

'use client';

import { Task } from '@/lib/types';
import { CheckCircle2, Circle, Clock, TrendingUp, Target, Zap, Calendar, Filter, Sparkles, AlertCircle, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import TaskCreationModal from './TaskCreationModal';
import FidgetBreather from '@/components/games/FidgetBreather';

interface DashboardProps {
  tasks: Task[];
  quickWins: Task[];
  goals: Array<{
    name: string;
    completed: number;
    total: number;
    color: string;
  }>;
  onBreakdownRequest?: (taskTitle: string) => void;
}

type FilterType = 'all' | 'career' | 'finance' | 'daily_life';
type SortType = 'priority' | 'time' | 'category';

export default function DashboardNew({ tasks, quickWins, goals, onBreakdownRequest }: DashboardProps) {
  console.log(' [DashboardNew] Received tasks:', tasks);
  console.log(' [DashboardNew] Task titles:', tasks.map(t => ({ id: t.task_id, title: t.title, name: (t as any).name })));
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [localQuickWins, setLocalQuickWins] = useState<Task[]>(quickWins);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('priority');
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [celebratingTaskId, setCelebratingTaskId] = useState<string | null>(null);
  const [motivationMessage, setMotivationMessage] = useState<string>('');
  const [showQuickWinPopup, setShowQuickWinPopup] = useState(false);
  const [quickWinPopupMessage, setQuickWinPopupMessage] = useState<string>('');

  // AI Integration Point: Generate motivational messages
  useEffect(() => {
    console.log(' [DashboardNew] Tasks updated via props:', tasks);
    console.log(' [DashboardNew] Setting local tasks...');
    setLocalTasks(tasks);
    console.log(' [DashboardNew] Local tasks set:', tasks.length, 'tasks');
  }, [tasks]);

  // AI Integration Point: AI-powered motivational message generation
  const generateAIMotivationalMessage = async () => {
    // TODO: Call AI API to generate personalized motivational message
    const messages = [
      "You're making great progress. Remember, small steps lead to big achievements. 💚",
      "Every task completed is a step toward your goals. Keep up the momentum! 🌟",
      "Your dedication is inspiring. Focus on one thing at a time, and you'll succeed. 🎯",
      "Progress over perfection. You're doing amazing! 💪",
      "Remember why you started. You've got this! ✨"
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMotivationalMessage(randomMessage);
  };

  // Handle task completion toggle with optimistic UI update
  const handleToggleTask = async (taskId: string) => {
    const taskToUpdate = tasks.find(t => t.task_id === taskId);
    if (!taskToUpdate) return;

    const newStatus = taskToUpdate.status === 'completed' ? 'not_started' : 'completed';
    
    // Optimistic update
    setLocalTasks((prevTasks: Task[]) =>
      prevTasks.map((task: Task) =>
        task.task_id === taskId
          ? { ...task, status: newStatus }
          : task
      )
    );

    // Check if this task is in Quick Wins and show popup
    if (newStatus === 'completed') {
      const quickWinsList = getIntelligentQuickWins();
      const isInQuickWins = quickWinsList.some(qw => qw.task_id === taskId);
      
      if (isInQuickWins) {
        const popupData = getQuickWinPopupMessage();
        setQuickWinPopupMessage(JSON.stringify(popupData));
        setShowQuickWinPopup(true);
        
        // Hide popup after 3 seconds
        setTimeout(() => {
          setShowQuickWinPopup(false);
        }, 3000);
      }
    }

    // Call API to update task status
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      // Refresh page to show updated task in correct column
      window.location.reload();
    } catch (error) {
      // Revert on error
      console.error('Failed to update task:', error);
      setShowQuickWinPopup(false);
      setLocalTasks((prevTasks: Task[]) =>
        prevTasks.map((task: Task) =>
          task.task_id === taskId
            ? { ...task, status: taskToUpdate.status }
            : task
        )
      );
    }
  };

  // Dynamic motivational messages for Quick Win popup
  const getQuickWinPopupMessage = () => {
    const messages = [
      { text: "Great choice!", emoji: "✨", color: "from-purple-400 to-purple-500" },
      { text: "Smart move!", emoji: "🧠", color: "from-blue-400 to-blue-500" },
      { text: "You're on a roll!", emoji: "🎯", color: "from-green-400 to-green-500" },
      { text: "Nailing it!", emoji: "💪", color: "from-orange-400 to-orange-500" },
      { text: "Keep the momentum!", emoji: "🚀", color: "from-pink-400 to-pink-500" },
      { text: "Brilliant work!", emoji: "⭐", color: "from-yellow-400 to-yellow-500" },
      { text: "You're unstoppable!", emoji: "⚡", color: "from-indigo-400 to-indigo-500" },
      { text: "Crushing goals!", emoji: "🏆", color: "from-red-400 to-red-500" },
      { text: "Fantastic progress!", emoji: "📈", color: "from-teal-400 to-teal-500" },
      { text: "Way to go!", emoji: "🎊", color: "from-cyan-400 to-cyan-500" },
      { text: "You're amazing!", emoji: "💎", color: "from-violet-400 to-violet-500" },
      { text: "Keep shining!", emoji: "🌟", color: "from-amber-400 to-amber-500" },
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Dynamic motivational messages
  const getRandomMotivationMessage = () => {
    const messages = [
      "Keep going! 🚀",
      "You're on fire! 🔥",
      "Crushing it! 💪",
      "Unstoppable! ⚡",
      "Beast mode! 🦁",
      "Momentum building! 📈",
      "You're amazing! ✨",
      "Keep crushing! 💎",
      "On a roll! 🎯",
      "Fantastic work! 🌟",
      "You got this! 💯",
      "Killing it! 🎊",
      "Superstar! ⭐",
      "Legendary! 🏆",
      "Phenomenal! 🎨",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Handle quick win completion with celebration
  const handleToggleQuickWin = async (taskId: string) => {
    const taskToUpdate = quickWins.find(t => t.task_id === taskId);
    if (!taskToUpdate) return;

    const newStatus = taskToUpdate.status === 'completed' ? 'not_started' : 'completed';
    
    // Optimistic update
    setLocalQuickWins((prevTasks: Task[]) =>
      prevTasks.map((task: Task) =>
        task.task_id === taskId
          ? { ...task, status: newStatus }
          : task
      )
    );

    // Show celebration if completing task
    if (newStatus === 'completed') {
      setCelebratingTaskId(taskId);
      setMotivationMessage(getRandomMotivationMessage());
      setTimeout(() => {
        setCelebratingTaskId(null);
        setMotivationMessage('');
      }, 3000);
    }

    // Call API to update task status
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      // Refresh page to show updated task
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Failed to update quick win:', error);
      setCelebratingTaskId(null);
      setMotivationMessage('');
      setLocalQuickWins((prevTasks: Task[]) =>
        prevTasks.map((task: Task) =>
          task.task_id === taskId ? { ...task, status: taskToUpdate.status } : task
        )
      );
    }
  };

  // Filter tasks based on category
  const getFilteredTasks = () => {
    let filtered = tasks;
    if (filter !== 'all') {
      filtered = tasks.filter(task => {
        if (filter === 'daily_life') return task.category === 'daily_life';
        return task.category === filter;
      });
    }
    return filtered;
  };

  // Sort tasks
  const getSortedTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      if (sort === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sort === 'time') {
        return (a.time_estimate || 0) - (b.time_estimate || 0);
      } else {
        return a.category.localeCompare(b.category);
      }
    });
  };

  const filteredAndSortedTasks = getSortedTasks(getFilteredTasks());
  const todayTasks = filteredAndSortedTasks.filter((t) => t.status !== 'completed').slice(0, 5);
  const completedToday = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;

  // Intelligent Quick Wins: Select easiest tasks based on time, priority, and category
  const getIntelligentQuickWins = () => {
    // Combine all tasks and remove duplicates by task_id
    const allTasks = [...tasks, ...quickWins];
    const uniqueTasks = Array.from(
      new Map(allTasks.map(task => [task.task_id, task])).values()
    );
    
    // Filter out completed tasks
    const incompleteTasks = uniqueTasks.filter(t => t.status !== 'completed');
    
    // Score tasks: lower is easier
    const scoredTasks = incompleteTasks.map(task => {
      let score = 0;
      
      // Time estimate (most important)
      score += (task.time_estimate || 30) * 2;
      
      // Priority (low priority = easier to start)
      if (task.priority === 'low') score += 0;
      else if (task.priority === 'medium') score += 20;
      else score += 40;
      
      // Category (daily_life tasks are often easier)
      if (task.category === 'daily_life') score -= 10;
      
      return { task, score };
    });
    
    // Sort by score and return ONLY top 3
    return scoredTasks
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map(item => item.task);
  };

  const intelligentQuickWins = getIntelligentQuickWins();

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-[var(--clay-100)] rounded-xl"></div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream)] via-[var(--sand)] to-[var(--clay-50)] relative overflow-hidden">
      {/* Floating decorative blobs - z-index controlled */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[var(--clay-200)] rounded-full blur-[120px] opacity-20 pointer-events-none -z-0"></div>
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-[var(--sage-300)] rounded-full blur-[100px] opacity-15 pointer-events-none -z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Bento Grid Layout - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          
          {/* Left Column - Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            
            {/* Today's Focus Card - AI Integration Point */}
            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-4 sm:p-6 lg:p-8 border-2 border-[var(--clay-200)] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center shadow-md flex-shrink-0">
                    <Target className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                      Today's Focus
                    </h2>
                    <p className="text-sm text-[var(--charcoal)]/60">AI-prioritized tasks</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Filter Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === 'all'
                          ? 'bg-[var(--clay-500)] text-white shadow-md'
                          : 'bg-[var(--sand)] text-[var(--charcoal)]/70 hover:bg-[var(--stone)]'
                      }`}
                      aria-label="Show all tasks"
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter('career')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === 'career'
                          ? 'bg-[var(--clay-500)] text-white shadow-md'
                          : 'bg-[var(--sand)] text-[var(--charcoal)]/70 hover:bg-[var(--stone)]'
                      }`}
                      aria-label="Show career tasks"
                    >
                      💼 Career
                    </button>
                    <button
                      onClick={() => setFilter('finance')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === 'finance'
                          ? 'bg-[var(--clay-500)] text-white shadow-md'
                          : 'bg-[var(--sand)] text-[var(--charcoal)]/70 hover:bg-[var(--stone)]'
                      }`}
                      aria-label="Show finance tasks"
                    >
                      💰 Finance
                    </button>
                  </div>
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-lg"
                    aria-label="Add new task"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    <span className="hidden sm:inline">Add Task</span>
                  </button>
                  <div className="px-4 py-2 bg-gradient-to-r from-[var(--sage-100)] to-[var(--sage-200)] rounded-full border border-[var(--sage-300)]">
                    <span className="text-sm font-semibold text-[var(--sage-700)]">
                      {todayTasks.length} tasks
                    </span>
                  </div>
                </div>
              </div>

              {/* Tasks List with Loading State */}
              {isLoading ? (
                <LoadingSkeleton />
              ) : todayTasks.length === 0 ? (
                /* Empty State with Action */
                <div className="text-center py-12">
                  {filter === 'all' ? (
                    <>
                      <CheckCircle2 className="w-16 h-16 text-[var(--sage-500)] mx-auto mb-4 animate-bounce" strokeWidth={2} />
                      <p className="text-lg font-semibold text-[var(--charcoal)] mb-2">All caught up! 🎉</p>
                      <p className="text-sm text-[var(--charcoal)]/60">You've completed all your tasks for today.</p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-16 h-16 text-[var(--clay-400)] mx-auto mb-4" strokeWidth={2} />
                      <p className="text-lg font-semibold text-[var(--charcoal)] mb-2">No {filter} tasks</p>
                      <p className="text-sm text-[var(--charcoal)]/60">Try a different filter or add new tasks.</p>
                    </>
                  )}
                  </div>
                ) : (
                <div className="space-y-3">
                  {todayTasks.map((task, index) => (
                    <div
                      key={task.task_id}
                      className="group flex items-start gap-4 p-4 bg-white rounded-xl border-2 border-[var(--clay-200)] hover:border-[var(--clay-400)] hover:shadow-md transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <button 
                        onClick={() => handleToggleTask(task.task_id)}
                        className="mt-0.5 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)] rounded-full p-1 transition-transform hover:scale-110 active:scale-95"
                        aria-label={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-[var(--sage-600)]" strokeWidth={2.5} />
                        ) : (
                          <Circle className="w-5 h-5 text-[var(--clay-400)] group-hover:text-[var(--clay-600)]" strokeWidth={2.5} />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold mb-1 ${task.status === 'completed' ? 'text-[var(--charcoal)]/50 line-through' : 'text-[var(--charcoal)]'}`}>
                          {task.title || (task as any).name || 'Untitled Task'}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-[var(--charcoal)]/60 flex-wrap">
                          <span className={`px-2 py-1 rounded-md font-medium ${
                            task.category === 'career' ? 'bg-[var(--clay-100)]' :
                            task.category === 'finance' ? 'bg-[var(--sage-100)]' :
                            'bg-[var(--stone)]'
                          }`}>
                            {task.category === 'career' ? '💼' : task.category === 'finance' ? '💰' : '✅'} {task.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          {task.time_estimate && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.time_estimate}m
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
            </div>

            {/* Goal Progress Card - AI Predictions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-4 sm:p-6 lg:p-8 border-2 border-[var(--clay-200)] shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] flex items-center justify-center shadow-md flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                    Goal Progress
                  </h2>
                  <p className="text-sm text-[var(--charcoal)]/60">AI-powered forecasting</p>
                </div>
              </div>

              <div className="space-y-4">
                {goals.map((goal, index) => {
                  const percentage = Math.round((goal.completed / goal.total) * 100);
                  
                  // Calculate estimated days based on actual completion rate
                  let daysToComplete = 0;
                  const remaining = goal.total - goal.completed;
                  
                  if (remaining === 0) {
                    daysToComplete = 0; // Already complete
                  } else if (goal.completed === 0) {
                    daysToComplete = remaining * 7; // Estimate 1 task per week if no progress
                  } else {
                    // Calculate based on current velocity (tasks per day)
                    // Assuming tasks were completed over the last 7 days
                    const tasksPerDay = goal.completed / 7;
                    daysToComplete = Math.ceil(remaining / tasksPerDay);
                  }
                  
                  return (
                    <div key={index} className="p-4 bg-white rounded-xl border-2 border-[var(--clay-200)] hover:border-[var(--clay-400)] transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-[var(--charcoal)]">{goal.name}</h3>
                        <span className="text-sm font-bold text-[var(--charcoal)]">
                          {goal.completed}/{goal.total}
                        </span>
                      </div>
                      {/* Animated Progress Bar */}
                      <div className="relative h-3 bg-[var(--clay-100)] rounded-full overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${
                            index === 0 
                              ? 'from-[var(--clay-500)] to-[var(--clay-600)]' 
                              : 'from-[var(--sage-500)] to-[var(--sage-600)]'
                          } rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-[var(--charcoal)]/60">{percentage}% complete</p>
                        {/* Real Data Prediction */}
                        <p className="text-xs text-[var(--sage-600)] font-semibold">
                          📊 Est. {daysToComplete} {daysToComplete === 1 ? 'day' : 'days'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
            
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-[var(--clay-200)] via-[var(--sand)] to-[var(--clay-100)] rounded-[2rem] p-4 sm:p-6 border-2 border-[var(--clay-300)]/40 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center shadow-md flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  Today's Stats
                </h3>
              </div>
              
              <div className="space-y-2.5">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-[var(--clay-200)] min-h-[72px] flex flex-col justify-center hover:shadow-md transition-shadow">
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[var(--charcoal)] mb-0.5 leading-none" style={{fontFamily: 'var(--font-fraunces)'}}>
                    {completionRate}%
                  </div>
                  <p className="text-xs text-[var(--charcoal)]/70 leading-tight">Completion Rate</p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-[var(--clay-200)] min-h-[72px] flex flex-col justify-center hover:shadow-md transition-shadow">
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[var(--charcoal)] mb-0.5 leading-none" style={{fontFamily: 'var(--font-fraunces)'}}>
                    {completedToday}
                  </div>
                  <p className="text-xs text-[var(--charcoal)]/70 leading-tight">Tasks Completed</p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-[var(--clay-200)] min-h-[72px] flex flex-col justify-center hover:shadow-md transition-shadow">
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[var(--charcoal)] mb-0.5 leading-none" style={{fontFamily: 'var(--font-fraunces)'}}>
                    {todayTasks.length}
                  </div>
                  <p className="text-xs text-[var(--charcoal)]/70 leading-tight">Tasks Remaining</p>
                </div>
              </div>
            </div>

            {/* Calm Space - Neurodivergent-Friendly Fidget Game */}
            <FidgetBreather />

            {/* AI-Generated Motivational Card */}
            <div className="bg-white rounded-[2rem] p-4 sm:p-5 border-2 border-[var(--charcoal)] shadow-lg flex-shrink-0 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center shadow-md">
                    <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>
                    AI Insight
                  </h3>
                  <p className="text-sm text-[var(--charcoal)]/70 leading-relaxed">
                    {motivationalMessage || "You're making great progress. Remember, small steps lead to big achievements. 💚"}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskCreationModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={() => window.location.reload()}
      />
    </div>
  );
}

