'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Circle, CheckCircle2, Target, Sparkles, Plus } from 'lucide-react';
import NaviaAvatar from '@/components/ai/NaviaAvatar';
import FidgetBreather from '@/components/games/FidgetBreather';

interface Task {
  id: string;
  task_id?: string;
  title: string;
  status?: string;
  completed?: boolean;
  category?: string;
  time_estimate?: number;
}

interface DashboardBentoProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string) => void;
  onDeleteTask: (taskId: string) => void;
  onBreakdownTask: (taskId: string) => void;
  onStartFocus: () => void;
  onOpenNavia: () => void;
  energyLevel: number;
  onEnergyChange: (level: number) => void;
  supportLevel: number;
  onSupportChange: (level: number) => void;
  userName?: string;
  focusMode?: boolean;
  focusTime?: number;
  focusTask?: string;
  onMaximizeFocus?: () => void;
}

export default function DashboardBento({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onBreakdownTask,
  onStartFocus,
  onOpenNavia,
  energyLevel,
  onEnergyChange,
  supportLevel,
  onSupportChange,
  userName = 'friend',
  focusMode = false,
  focusTime = 0,
  focusTask = '',
  onMaximizeFocus,
}: DashboardBentoProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  console.log('🎨 [DashboardBento] Rendering with tasks:', tasks);
  console.log('🎨 [DashboardBento] Task count:', tasks.length);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle);
      setNewTaskTitle('');
    }
  };

  const activeTasks = tasks.filter(t => t.status !== 'completed' && !t.completed);
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.completed);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night'; // Late night/early morning
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Greeting Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-serif font-bold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>
            {getGreeting()}, {userName}! 💛
          </h1>
          <p className="text-lg text-[var(--clay-700)]">
            <span className="font-bold text-xl text-[var(--clay-600)]">You've got this.</span> One step at a time.
          </p>
        </motion.div>

        <div className="relative">
          {/* Bento Grid Layout - 2x2 equal boxes with more spacing */}
          <div className="grid grid-cols-2 grid-rows-2 gap-16 h-[900px]">
          
          {/* TOP LEFT: Tasks List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl border-2 border-[var(--clay-200)] p-6 shadow-lg overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  Your Tasks
                </h2>
              </div>
              <span className="px-3 py-1 bg-[var(--sage-100)] text-[var(--sage-700)] rounded-full text-sm font-semibold">
                {activeTasks.length} active
              </span>
            </div>

            {/* Task List */}
            <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="space-y-3">
                  {/* Loading Skeleton */}
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="flex items-start gap-3 p-4 bg-[var(--sand)]/50 rounded-xl border border-[var(--clay-200)]"
                    >
                      <div className="w-5 h-5 rounded-full bg-[var(--clay-200)] animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[var(--clay-200)] rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-[var(--clay-100)] rounded w-1/2 animate-pulse" />
                      </div>
                    </motion.div>
                  ))}
                  <p className="text-center text-[var(--charcoal)]/40 text-sm mt-4">Loading your tasks...</p>
                </div>
              ) : (
                tasks.map((task) => {
                  const taskId = task.task_id || task.id;
                  const isCompleted = task.status === 'completed' || task.completed;
                  const taskTitle = task.title || 'Untitled Task';
                  const isDeleting = deletingTaskId === taskId;
                  const isCompleting = completingTaskId === taskId;
                  
                  console.log('📝 [DashboardBento] Rendering task:', { taskId, taskTitle, isCompleted });
                  
                  return (
                    <motion.div
                      key={taskId}
                      layout
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ 
                        opacity: isDeleting ? 0 : 1,
                        x: isDeleting ? -100 : 0,
                        y: isDeleting ? -20 : 0,
                        scale: isDeleting ? 0.9 : 1,
                      }}
                      exit={{ opacity: 0, x: -100, scale: 0.8 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        duration: 0.3
                      }}
                      className={`flex items-start gap-3 p-4 rounded-xl border transition-all group relative overflow-hidden ${
                        'bg-[var(--sand)] border-[var(--clay-200)] hover:border-[var(--clay-400)]'
                      }`}
                    >
                      {/* Completion Shine Effect */}
                      {isCompleting && (
                        <motion.div
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{ duration: 0.6, ease: 'easeInOut' }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--sage-300)]/30 to-transparent"
                          style={{ pointerEvents: 'none' }}
                        />
                      )}
                      <button
                        onClick={() => {
                          setCompletingTaskId(taskId);
                          setTimeout(() => {
                            onToggleTask(taskId);
                            setCompletingTaskId(null);
                          }, 500);
                        }}
                        className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110 active:scale-95"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-[var(--sage-600)]" strokeWidth={2.5} />
                        ) : (
                          <Circle className="w-5 h-5 text-[var(--clay-400)] group-hover:text-[var(--clay-600)]" strokeWidth={2.5} />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 
                          className={`font-semibold text-base transition-all ${
                            isCompleted 
                              ? 'text-[var(--charcoal)]/50 line-through' 
                              : 'text-[var(--charcoal)]'
                          }`}
                          style={{ color: isCompleted ? 'rgba(45, 45, 45, 0.5)' : '#2d2d2d' }}
                        >
                          {taskTitle}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onBreakdownTask(taskId)}
                          className="text-[var(--clay-600)] hover:text-[var(--clay-700)] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Break down
                        </button>
                        <button
                          onClick={() => {
                            setDeletingTaskId(taskId);
                            setTimeout(() => {
                              onDeleteTask(taskId);
                              setDeletingTaskId(null);
                            }, 300);
                          }}
                          className="text-red-500 hover:text-red-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a task..."
                className="flex-1 px-4 py-3 bg-white border-2 border-[var(--clay-200)] rounded-xl focus:outline-none focus:border-[var(--clay-500)] text-[var(--charcoal)]"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-gradient-to-r from-[var(--clay-500)] to-[var(--clay-600)] text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </form>
          </motion.div>

          {/* TOP RIGHT: Energy Level */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl border-2 border-[var(--clay-200)] p-6 shadow-lg overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                How are you feeling?
              </h2>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {/* Energy Level */}
              <div>
                <p className="text-sm font-semibold text-[var(--charcoal)] mb-3">Energy Level</p>
                <div className="text-center mb-4">
                  <div className="text-6xl font-bold text-[var(--charcoal)] mb-2">
                    {energyLevel}/10
                  </div>
                  <p className="text-base font-bold text-[var(--clay-700)]">
                    {energyLevel <= 3 && "Low energy - that's okay 💛"}
                    {energyLevel > 3 && energyLevel <= 6 && "Moderate energy"}
                    {energyLevel > 6 && "Good energy! 🌟"}
                  </p>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => onEnergyChange(Number(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #c4a57b 0%, #c4a57b ${((energyLevel - 1) / 9) * 100}%, #e8dcc8 ${((energyLevel - 1) / 9) * 100}%, #e8dcc8 100%)`,
                    accentColor: energyLevel <= 3 ? '#c4a57b' : energyLevel <= 6 ? '#9ca986' : '#6b8e6f'
                  }}
                />
                <div className="flex justify-between text-xs font-medium text-[var(--clay-600)] mt-2 px-1">
                  <span>Drained</span>
                  <span>Okay</span>
                  <span>Energized</span>
                </div>
                
                {/* Energy Context */}
                <div className="mt-3 bg-[var(--sage-100)] rounded-lg p-3 border border-[var(--sage-300)]">
                  <p className="text-xs text-center text-[var(--sage-800)]">
                    <span className="font-bold text-sm">Tell me how you're feeling</span><br/>
                    I'll adjust to meet you where you are
                  </p>
                </div>
              </div>

            </div>
          </motion.div>

          {/* BOTTOM RIGHT: Support Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border-2 border-[var(--clay-200)] p-6 shadow-lg overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                Support Level
              </h2>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="space-y-4">
                <p className="text-sm font-semibold text-[var(--charcoal)] text-center">How much support do you need?</p>
                <div className="text-center">
                  <div className="text-5xl font-bold text-[var(--clay-600)] mb-3">
                    {supportLevel === 1 && "🎯 Minimal"}
                    {supportLevel === 2 && "👍 Low"}
                    {supportLevel === 3 && "⚖️ Balanced"}
                    {supportLevel === 4 && "🤝 High"}
                    {supportLevel === 5 && "💛 Maximum"}
                  </div>
                  <p className="text-sm text-[var(--clay-600)] mb-4">
                    {supportLevel === 1 && "I trust you - just high-level guidance"}
                    {supportLevel === 2 && "Some help, but you've got this"}
                    {supportLevel === 3 && "Good mix of guidance & independence"}
                    {supportLevel === 4 && "Detailed steps & frequent check-ins"}
                    {supportLevel === 5 && "Let's do this together, step by step"}
                  </p>
                </div>
                
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={supportLevel}
                  onChange={(e) => onSupportChange(Number(e.target.value))}
                  className="w-full h-4 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-[var(--clay-300)] to-[var(--clay-600)]"
                />
                <div className="flex justify-between text-xs font-medium text-[var(--clay-600)] px-1">
                  <span>Independent</span>
                  <span>Balanced</span>
                  <span>Supported</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* BOTTOM LEFT: Focus Mode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border-2 border-[var(--clay-200)] p-6 shadow-lg overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center">
                <Target className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                Focus Mode
              </h2>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              {focusMode ? (
                /* Active Focus Session - Show Timer */
                <>
                  <div className="text-center space-y-4">
                    <p className="text-sm text-[var(--clay-600)] font-semibold">Focusing on:</p>
                    <p className="text-2xl font-bold text-[var(--clay-700)]">{focusTask}</p>
                    <div className="text-7xl font-bold text-[var(--charcoal)] my-6">
                      {Math.floor(focusTime / 60)}:{(focusTime % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  
                  <button
                    onClick={onMaximizeFocus}
                    className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-10 py-4 rounded-full transition-all font-bold text-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    Maximize Focus
                  </button>
                  
                  <p className="text-[var(--sage-700)] text-sm">
                    I'm with you 💛
                  </p>
                </>
              ) : (
                /* No Active Session - Show Start Button */
                <>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="bg-gradient-to-br from-[var(--sage-50)] to-[var(--sage-100)] rounded-xl p-3 border border-[var(--sage-200)]">
                      <p className="text-xs text-[var(--sage-800)] font-semibold">
                        🌊 Take your time
                      </p>
                      <p className="text-[10px] text-[var(--sage-700)] mt-1">
                        Progress over perfection
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-[var(--clay-50)] to-[var(--clay-100)] rounded-xl p-3 border border-[var(--clay-200)]">
                      <p className="text-xs text-[var(--clay-800)] font-semibold">
                        💛 You're not alone
                      </p>
                      <p className="text-[10px] text-[var(--clay-700)] mt-1">
                        I'm here for you
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={onStartFocus}
                    className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-10 py-4 rounded-full transition-all font-bold text-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    Start Focus Session
                  </button>
                  
                  <p className="text-[var(--clay-700)] text-sm max-w-xs">
                    Set your intention and <span className="font-bold text-[var(--clay-600)]">I'll stay with you</span>
                  </p>
                </>
              )}
            </div>
          </motion.div>

        </div>

          {/* CENTER: Navia Avatar - Absolute positioned at intersection */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onOpenNavia}
              className="group flex flex-col items-center gap-2 cursor-pointer"
            >
              <div className="relative">
                <NaviaAvatar size="lg" isSpeaking={false} isThinking={false} />
                <div className="absolute -bottom-1 -right-1 text-3xl">😴</div>
              </div>
              <div className="text-center">
                <p className="text-xs text-[var(--charcoal)]/80 font-medium group-hover:text-[var(--sage-600)] transition-colors">
                  Click me if you need help
                </p>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
