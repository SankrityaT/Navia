'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, CheckCircle2, Target, Sparkles, Plus, Maximize2, Loader2, X, Trash2, SparklesIcon } from 'lucide-react';
import NaviaAvatar from '@/components/ai/NaviaAvatar';
import FocusMusicPlayer from '@/components/focus/FocusMusicPlayer';
import NaviaAssistant from '@/components/ai/NaviaAssistant';
import BrainDump from '@/components/dashboard/BrainDump';

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
  userId: string;
  focusMode?: boolean;
  focusTime?: number;
  focusTask?: string;
  onMaximizeFocus?: () => void;
  onPauseFocus?: () => void;
  onEndFocus?: () => void;
  onAddTime?: (minutes: number) => void;
  isPaused?: boolean;
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
  userId,
  focusMode = false,
  focusTime = 0,
  focusTask = '',
  onMaximizeFocus,
  onPauseFocus,
  onEndFocus,
  onAddTime,
  isPaused = false,
}: DashboardBentoProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [isExtractingTasks, setIsExtractingTasks] = useState(false);
  const [extractionMessage, setExtractionMessage] = useState('');
  
  // Universal NAVIA Modal State
  const [naviaModalOpen, setNaviaModalOpen] = useState(false);
  const [naviaInitialMessage, setNaviaInitialMessage] = useState('');
  const [naviaContext, setNaviaContext] = useState<any>({});
  const [naviaApiEndpoint, setNaviaApiEndpoint] = useState('/api/dashboard-chat');

  console.log('🎨 [DashboardBento] Rendering with tasks:', tasks);
  console.log('🎨 [DashboardBento] Task count:', tasks.length);

  // Listen for modal close event from breakdown completion
  useEffect(() => {
    const handleCloseModal = () => {
      setNaviaModalOpen(false);
    };
    window.addEventListener('closeNaviaModal', handleCloseModal);
    return () => window.removeEventListener('closeNaviaModal', handleCloseModal);
  }, []);

  // AI-powered task extraction
  const handleExtractTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsExtractingTasks(true);
    setExtractionMessage('Extracting tasks...');

    try {
      const response = await fetch('/api/features/extract-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: newTaskTitle }),
      });

      const data = await response.json();
      
      console.log('📥 Received from API:', data);

      if (data.success && data.tasks && data.tasks.length > 0) {
        console.log(`📝 Adding ${data.tasks.length} tasks to UI...`);
        
        // Add each extracted task
        for (const task of data.tasks) {
          console.log(`  ➕ Adding task: "${task.title}"`);
          onAddTask(task.title);
        }
        
        setExtractionMessage(data.message);
        setNewTaskTitle('');
        
        // Clear message after 3 seconds
        setTimeout(() => setExtractionMessage(''), 3000);
      } else {
        setExtractionMessage(data.message || 'No tasks found');
        setTimeout(() => setExtractionMessage(''), 3000);
      }
    } catch (error) {
      console.error('Task extraction error:', error);
      setExtractionMessage('Oops, something went wrong. Try again? 💛');
      setTimeout(() => setExtractionMessage(''), 3000);
    } finally {
      setIsExtractingTasks(false);
    }
  };

  // Open NAVIA for task breakdown
  const handleBreakdownClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setNaviaApiEndpoint('/api/features/task-breakdown');
    setNaviaInitialMessage(`Let me break down "${task.title}" for you...`);
    setNaviaContext({
      task: task.title,
      supportLevel,
      userContext: { energyLevel },
    });
    setNaviaModalOpen(true);
  };

  // Open NAVIA for energy check-in
  const handleEnergyChange = (newLevel: number) => {
    onEnergyChange(newLevel);
    
    setNaviaApiEndpoint('/api/features/navia-session'); // Use general chat - wait for user
    setNaviaInitialMessage(`I noticed your energy is at ${newLevel}/10. How are you feeling?`);
    setNaviaContext({
      energyLevel: newLevel,
      sessionType: 'energy_checkin',
    });
    setNaviaModalOpen(true);
  };

  // Open NAVIA for support check-in
  const handleSupportChange = (newLevel: number) => {
    onSupportChange(newLevel);
    
    // Generate detailed explanation based on support level
    let explanation = '';
    switch(newLevel) {
      case 1:
        explanation = `**Support Level 1/5 - Minimal Support** 💪\n\nYou've got this! I'll give you:\n- Clear, straightforward steps\n- Trust you to figure out the details\n- Minimal hand-holding\n- Quick tips when needed\n\nPerfect for when you're feeling confident and just need a roadmap!`;
        break;
      case 2:
        explanation = `**Support Level 2/5 - Light Support** 🌱\n\nYou're pretty independent! I'll provide:\n- Clear steps with brief explanations\n- Some helpful tips\n- Space for you to problem-solve\n- Encouragement without over-explaining\n\nGreat for when you know what you're doing but want a little guidance.`;
        break;
      case 3:
        explanation = `**Support Level 3/5 - Balanced Support** ⚖️\n\nThe sweet spot! I'll give you:\n- 6-8 clear steps\n- Helpful tips and alternatives\n- Balance between guidance and independence\n- Acknowledgment of challenges\n\nPerfect for most tasks - not too much, not too little.`;
        break;
      case 4:
        explanation = `**Support Level 4/5 - High Support** 🤝\n\nI'm here for you! Expect:\n- 8-10 micro-steps\n- Detailed guidance for each step\n- Lots of encouragement\n- Sensory considerations\n- Pause points and breaks\n\nIdeal for overwhelming tasks or low-energy days.`;
        break;
      case 5:
        explanation = `**Support Level 5/5 - Maximum Support** 💛\n\nI've got you completely! You'll get:\n- The tiniest possible micro-steps\n- Encouragement after each step\n- Acknowledgment of every difficulty\n- Sensory alternatives\n- Frequent pause points\n- Maximum compassion, zero judgment\n\nPerfect for really hard days or tasks that feel impossible.`;
        break;
    }
    
    setNaviaApiEndpoint('/api/features/navia-session'); // Use general chat for follow-up
    setNaviaInitialMessage(explanation);
    setNaviaContext({
      currentSupportLevel: newLevel,
      sessionType: 'support_explanation',
    });
    setNaviaModalOpen(true);
  };

  // Open NAVIA for general chat
  const handleOpenNavia = () => {
    setNaviaApiEndpoint('/api/features/navia-session');
    setNaviaInitialMessage("Hey! I'm here to help. What's on your mind? 💛");
    setNaviaContext({
      messages: [],
      sessionType: 'general',
      userContext: { userName, energyLevel },
    });
    setNaviaModalOpen(true);
  };

  // Open NAVIA with memory context (for Brain Dump quick questions)
  const handleOpenNaviaWithMemory = (message: string, context: any, endpoint: string) => {
    setNaviaApiEndpoint(endpoint);
    setNaviaInitialMessage(message);
    setNaviaContext(context);
    setNaviaModalOpen(true);
  };

  // Filter tasks based on energy level
  const getEnergyFilteredTasks = () => {
    const allActive = tasks.filter(t => t.status !== 'completed' && !t.completed);
    
    // Low energy (1-3): Prioritize quick tasks (≤15 min), but show at least 3 tasks
    if (energyLevel <= 3) {
      const quickTasks = allActive.filter(t => !t.time_estimate || t.time_estimate <= 15);
      // If we have quick tasks, show them. Otherwise show shortest 3 tasks
      if (quickTasks.length > 0) {
        return quickTasks;
      }
      // Sort by time estimate and show shortest 3
      return allActive
        .sort((a, b) => (a.time_estimate || 30) - (b.time_estimate || 30))
        .slice(0, 3);
    }
    // Medium energy (4-6): Show tasks ≤30 min, or shortest 5 if none qualify
    if (energyLevel <= 6) {
      const mediumTasks = allActive.filter(t => !t.time_estimate || t.time_estimate <= 30);
      if (mediumTasks.length > 0) {
        return mediumTasks;
      }
      return allActive
        .sort((a, b) => (a.time_estimate || 60) - (b.time_estimate || 60))
        .slice(0, 5);
    }
    // High energy (7-10): Show all tasks
    return allActive;
  };

  const activeTasks = getEnergyFilteredTasks();
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.completed);
  const hiddenTaskCount = tasks.filter(t => t.status !== 'completed' && !t.completed).length - activeTasks.length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night'; // Late night/early morning
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Greeting Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>
            {getGreeting()}, {userName}! 💛
          </h1>
          <p className="text-base md:text-lg text-[var(--clay-700)]">
            <span className="font-bold text-lg md:text-xl text-[var(--clay-600)]">You've got this.</span> One step at a time.
          </p>
        </motion.div>

        {/* Mobile: Navia Avatar at Top */}
        <div className="md:hidden flex justify-center mb-8">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleOpenNavia}
            className="group flex flex-col items-center cursor-pointer"
          >
            <motion.div 
              className="relative"
              animate={{
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <NaviaAvatar size="lg" isSpeaking={false} isThinking={false} />
              <motion.div 
                className="absolute -bottom-1 -right-1 text-2xl"
                whileHover={{
                  scale: [1, 1.15, 1],
                  transition: { 
                    duration: 2.5,
                    repeat: Infinity,
                    ease: [0.45, 0.05, 0.55, 0.95]
                  }
                }}
              >
                😴
              </motion.div>
            </motion.div>
            <motion.div 
              className="text-center mt-2 group-hover:scale-125 transition-transform duration-300"
            >
              <p className="text-sm font-bold text-[var(--charcoal)] group-hover:text-[var(--sage-600)] whitespace-nowrap bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm group-hover:shadow-lg transition-all duration-300">
                Click me if you need help
              </p>
            </motion.div>
          </motion.button>
        </div>

        <div className="relative">
          {/* Bento Grid Layout - 2x2 equal boxes with more spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-6 md:gap-16 md:h-[900px]">
          
          {/* TOP LEFT: Tasks List */}
          <motion.div
            data-tutorial="tasks"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl border-2 border-[var(--clay-200)] p-4 md:p-6 shadow-lg overflow-hidden flex flex-col min-h-[400px] md:min-h-0 md:-translate-x-4 md:-translate-y-4"
          >
            <div className="flex flex-col items-center mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center">
                  <Target className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  Your Tasks
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 md:px-3 py-1 bg-[var(--sage-100)] text-[var(--sage-700)] rounded-full text-xs md:text-sm font-semibold">
                  {activeTasks.length} active
                </span>
                {hiddenTaskCount > 0 && (
                  <span className="px-2 md:px-3 py-1 bg-[var(--clay-100)] text-[var(--clay-700)] rounded-full text-xs md:text-sm font-semibold">
                    {hiddenTaskCount} hidden (low energy)
                  </span>
                )}
              </div>
            </div>

            {/* Task List */}
            <div className="flex-1 space-y-2 md:space-y-3 mb-3 md:mb-4 overflow-y-auto">
              {tasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-8 md:py-12 px-4 md:px-6 text-center h-full"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-[var(--sand)] rounded-full flex items-center justify-center mb-3 md:mb-4">
                    <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-[var(--clay-400)]" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-[var(--charcoal)] mb-2">
                    No tasks yet
                  </h3>
                  <p className="text-sm md:text-base text-[var(--sage-600)] mb-4 md:mb-6 max-w-sm">
                    Start your day by adding your first task below. I'll help you break it down if it feels overwhelming! 💛
                  </p>
                </motion.div>
              ) : (
                [...tasks].sort((a, b) => {
                  // Sort: incomplete tasks first, completed tasks last
                  const aCompleted = a.status === 'completed' || a.completed;
                  const bCompleted = b.status === 'completed' || b.completed;
                  if (aCompleted === bCompleted) return 0;
                  return aCompleted ? 1 : -1;
                }).map((task) => {
                  const taskId = task.id;
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
                      className={`flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-xl border transition-all group relative overflow-hidden ${
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
                          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[var(--sage-600)]" strokeWidth={2.5} />
                        ) : (
                          <Circle className="w-4 h-4 md:w-5 md:h-5 text-[var(--clay-400)] group-hover:text-[var(--clay-600)]" strokeWidth={2.5} />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 
                          className={`font-semibold text-sm md:text-base transition-all ${
                            isCompleted 
                              ? 'text-[var(--charcoal)]/50 line-through' 
                              : 'text-[var(--charcoal)]'
                          }`}
                          style={{ color: isCompleted ? 'rgba(45, 45, 45, 0.5)' : '#2d2d2d' }}
                        >
                          {taskTitle}
                        </h3>
                      </div>
                      <div className="flex gap-1 md:gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBreakdownClick(taskId);
                          }}
                          className="text-[var(--clay-600)] hover:text-[var(--charcoal)] hover:bg-[var(--clay-100)] hover:font-bold text-xs md:text-sm font-medium opacity-100 md:opacity-0 group-hover:opacity-100 transition-all rounded-md px-2 py-1 flex items-center gap-1"
                        >
                          <SparklesIcon className="w-3 h-3" />
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
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all rounded-md p-1.5 flex items-center justify-center"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* AI-Powered Task Input */}
            <div className="space-y-2">
              <form onSubmit={handleExtractTasks} className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Brain dump all your tasks here... I'll organize them! 💛"
                    disabled={isExtractingTasks}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border-2 border-[var(--clay-200)] rounded-xl focus:outline-none focus:border-[var(--clay-500)] text-[var(--charcoal)] text-sm md:text-base disabled:opacity-50"
                  />
                  {isExtractingTasks && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-[var(--clay-500)]" />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isExtractingTasks}
                  className="px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-[var(--clay-500)] to-[var(--clay-600)] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExtractingTasks ? (
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" strokeWidth={2.5} />
                  ) : (
                    <Plus className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                  )}
                </button>
              </form>
              {extractionMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-[var(--sage-700)] text-center bg-[var(--sage-100)] px-3 py-2 rounded-lg"
                >
                  {extractionMessage}
                </motion.p>
              )}
              <p className="text-[10px] text-[var(--clay-600)] text-center">
                ✨ Type multiple tasks at once - I'll extract them automatically!
              </p>
            </div>
          </motion.div>

          {/* TOP RIGHT: Energy Level */}
          <motion.div
            data-tutorial="energy-level"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl border-2 border-[var(--clay-200)] p-4 md:p-6 shadow-lg overflow-hidden flex flex-col min-h-[350px] md:min-h-0 md:translate-x-4 md:-translate-y-4"
          >
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                How are you feeling?
              </h2>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {/* Energy Level */}
              <div>
                <p className="text-xs md:text-sm font-semibold text-[var(--charcoal)] mb-2 md:mb-3">Energy Level</p>
                <div className="text-center mb-3 md:mb-4">
                  <div className="text-4xl md:text-6xl font-bold text-[var(--charcoal)] mb-2">
                    {energyLevel}/10
                  </div>
                  <p className="text-sm md:text-base font-bold text-[var(--clay-700)]">
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
                  onChange={(e) => handleEnergyChange(Number(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #c4a57b 0%, #c4a57b ${((energyLevel - 1) / 9) * 100}%, #e8dcc8 ${((energyLevel - 1) / 9) * 100}%, #e8dcc8 100%)`,
                    accentColor: energyLevel <= 3 ? '#c4a57b' : energyLevel <= 6 ? '#9ca986' : '#6b8e6f'
                  }}
                />
                <div className="flex justify-between text-[10px] md:text-xs font-medium text-[var(--clay-600)] mt-2 px-1">
                  <span>Drained</span>
                  <span>Okay</span>
                  <span>Energized</span>
                </div>
                
                {/* Energy Context */}
                <div className="mt-2 md:mt-3 bg-[var(--sage-100)] rounded-lg p-2 md:p-3 border border-[var(--sage-300)]">
                  <p className="text-[10px] md:text-xs text-center text-[var(--sage-800)]">
                    <span className="font-bold text-xs md:text-sm">Tell me how you're feeling</span><br/>
                    I'll adjust to meet you where you are
                  </p>
                </div>
              </div>

            </div>
          </motion.div>

          {/* BOTTOM RIGHT: Brain Dump & Memory */}
          <motion.div
            data-tutorial="brain-dump"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="min-h-[350px] md:min-h-0 md:-translate-x-8 md:translate-y-8"
          >
            <BrainDump 
              userId={userId} 
              onOpenNavia={handleOpenNaviaWithMemory}
            />
          </motion.div>

          {/* BOTTOM LEFT: Focus Mode */}
          <motion.div
            data-tutorial="focus-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border-2 border-[var(--clay-200)] p-4 md:p-6 shadow-lg overflow-y-auto flex flex-col min-h-[350px] md:min-h-0 md:translate-x-8 md:translate-y-8"
          >
            <div className="flex items-center justify-center mb-4 md:mb-6 relative">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center">
                  <Target className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  Focus Mode
                </h2>
              </div>
              
              {/* Maximize button - only show when focus mode is active */}
              {focusMode && (
                <button
                  onClick={onMaximizeFocus}
                  className="absolute right-0 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-full p-2 md:p-2.5 transition-all shadow-lg hover:scale-110 active:scale-95"
                  title="Maximize focus mode"
                >
                  <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 md:space-y-3 w-full px-2">
              {focusMode ? (
                <>
                  <div className="text-center space-y-1 md:space-y-2">
                    <p className="text-xs text-[var(--clay-600)] font-semibold">Focusing on:</p>
                    <p className="text-base md:text-xl font-bold text-[var(--clay-700)]">{focusTask}</p>
                    <div className="text-4xl md:text-6xl font-bold text-[var(--charcoal)] my-2 md:my-3">
                      {Math.floor(focusTime / 60)}:{(focusTime % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  
                  {/* Music Player */}
                  <div className="w-full max-w-md">
                    <FocusMusicPlayer isPlaying={!isPaused} />
                  </div>
                  
                  {/* Control Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
                    <button
                      onClick={onPauseFocus}
                      className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all font-semibold text-xs md:text-sm hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1.5"
                    >
                      {isPaused ? (
                        <>
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                          Resume
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                          </svg>
                          Pause
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => onAddTime && onAddTime(1)}
                      className="bg-[var(--sage-500)] hover:bg-[var(--sage-600)] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all font-semibold text-xs md:text-sm hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1"
                      title="Add 1 minute"
                    >
                      <Plus className="w-3 h-3 md:w-4 md:h-4" />
                      1 min
                    </button>
                    
                    <button
                      onClick={onEndFocus}
                      className="bg-white hover:bg-gray-50 text-[var(--charcoal)] border-2 border-[var(--clay-200)] px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-all font-semibold text-xs md:text-sm hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1.5"
                    >
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      End Session
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 md:gap-3 w-full">
                    <div className="bg-gradient-to-br from-[var(--sage-50)] to-[var(--sage-100)] rounded-xl p-2 md:p-3 border border-[var(--sage-200)]">
                      <p className="text-[10px] md:text-xs text-[var(--sage-800)] font-semibold">
                        🌊 Take your time
                      </p>
                      <p className="text-[8px] md:text-[10px] text-[var(--sage-700)] mt-1">
                        Progress over perfection
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-[var(--clay-50)] to-[var(--clay-100)] rounded-xl p-2 md:p-3 border border-[var(--clay-200)]">
                      <p className="text-[10px] md:text-xs text-[var(--clay-800)] font-semibold">
                        💛 You're not alone
                      </p>
                      <p className="text-[8px] md:text-[10px] text-[var(--clay-700)] mt-1">
                        I'm here for you
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={onStartFocus}
                    className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-6 md:px-10 py-3 md:py-4 rounded-full transition-all font-bold text-base md:text-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    Start Focus Session
                  </button>
                  
                  <p className="text-[var(--clay-700)] text-xs md:text-sm max-w-xs">
                    Set your intention and <span className="font-bold text-[var(--clay-600)]">I'll stay with you</span>
                  </p>
                </>
              )}
            </div>
          </motion.div>

        </div>

          {/* CENTER: Navia Avatar - Absolute positioned at intersection (Desktop only) */}
          <div data-tutorial="navia-avatar" className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%-30px)] z-30">
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onOpenNavia}
              className="group flex flex-col items-center cursor-pointer"
            >
              <motion.div 
                className="relative"
                animate={{
                  scale: [1, 1.03, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <NaviaAvatar size="lg" isSpeaking={false} isThinking={false} />
                <motion.div 
                  className="absolute -bottom-1 -right-1 text-2xl"
                  whileHover={{
                    scale: [1, 1.15, 1],
                    transition: { 
                      duration: 2.5,
                      repeat: Infinity,
                      ease: [0.45, 0.05, 0.55, 0.95]
                    }
                  }}
                >
                  😴
                </motion.div>
              </motion.div>
              <motion.div 
                className="text-center mt-2 group-hover:scale-125 transition-transform duration-300"
              >
                <p className="text-sm font-bold text-[var(--charcoal)] group-hover:text-[var(--sage-600)] whitespace-nowrap bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm group-hover:shadow-lg transition-all duration-300">
                  Click me if you need help
                </p>
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* NAVIA Assistant - Full Screen Centered Modal */}
      {naviaModalOpen && (
        <NaviaAssistant
          energyLevel={energyLevel}
          focusMode={focusMode}
          context={naviaContext}
          manualTrigger={naviaModalOpen}
          manualMessage={naviaInitialMessage}
          apiEndpoint={naviaApiEndpoint}
        />
      )}
    </div>
  );
}
