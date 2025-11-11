'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import NaviaAvatar from '@/components/ai/NaviaAvatar';
import VoiceInput from '@/components/ai/VoiceInput';
import ImmersiveFocusMode from '@/components/focus/ImmersiveFocusMode';
import Navbar from '@/components/layout/Navbar';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Plus,
  Zap,
  Coffee,
  Target,
  Brain,
  Send,
  Sparkles,
  Timer,
  TrendingUp,
  Heart,
  Info,
  X,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  breakdown?: string[];
  currentStep?: number;
  priority?: string;
  time_estimate?: number;
  category?: string;
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
  emotions?: {
    topEmotion: string;
    emotionIntensity: string;
    allEmotions: Array<{ name: string; score: number }>;
  };
}

export default function DashboardNew() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Update resume', completed: false },
    { id: '2', title: 'Apply to 3 jobs', completed: false },
    { id: '3', title: 'Practice coding', completed: false },
  ]);
  const [celebratingTask, setCelebratingTask] = useState<string | null>(null);
  const [focusIntention, setFocusIntention] = useState('');
  const [showFocusSetup, setShowFocusSetup] = useState(false);
  const [selectedTaskForFocus, setSelectedTaskForFocus] = useState<string>('');
  const [newTask, setNewTask] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [focusTime, setFocusTime] = useState(25 * 60); // 25 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [supportLevel, setSupportLevel] = useState(3);
  const [isLoadingState, setIsLoadingState] = useState(true); // 1=minimal, 3=balanced, 5=maximum support
  const [showSupportInfo, setShowSupportInfo] = useState(false);
  const [showImmersiveFocus, setShowImmersiveFocus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Section visibility states
  const [sectionsVisible, setSectionsVisible] = useState({
    tasks: true,
    chat: true,
    focus: true,
    quickWins: true,
    energy: true,
  });

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load user state and tasks from backend on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user state
        const stateResponse = await fetch('/api/user-state');
        if (stateResponse.ok) {
          const data = await stateResponse.json();
          setEnergyLevel(data.energyLevel);
          setSupportLevel(data.supportLevel);
        }

        // Load tasks
        const tasksResponse = await fetch('/api/tasks');
        if (tasksResponse.ok) {
          const data = await tasksResponse.json();
          setTasks(data.tasks || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoadingState(false);
      }
    };

    loadData();
  }, []);

  // Focus timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime((prev) => prev - 1);
      }, 1000);
    } else if (focusTime === 0) {
      setTimerActive(false);
      setFocusTime(25 * 60);
      // Trigger celebration
      sendQuickMessage("Time's up! Great focus session! 🎉");
    }
    return () => clearInterval(interval);
  }, [timerActive, focusTime]);

  // Random check-ins
  useEffect(() => {
    const checkInInterval = setInterval(() => {
      const checkIns = [
        "Hey! How are you doing? Need anything?",
        "Quick check-in: How's your energy? 💛",
        "Taking breaks? Remember to hydrate! 💧",
        "You're doing great! Need help with anything?",
      ];
      const randomCheckIn = checkIns[Math.floor(Math.random() * checkIns.length)];
      setMessages((prev) => [...prev, { role: 'assistant', content: randomCheckIn }]);
    }, 20 * 60 * 1000); // Every 20 minutes

    return () => clearInterval(checkInInterval);
  }, []);

  const toggleSection = (section: keyof typeof sectionsVisible) => {
    setSectionsVisible((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const addTask = async () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask,
        completed: false,
        priority: 'medium',
        time_estimate: 30,
        category: 'daily_life',
      };
      
      // Optimistically add to UI
      setTasks([...tasks, task]);
      setNewTask('');
      
      // Save to backend
      try {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task),
        });
      } catch (error) {
        console.error('Error saving task:', error);
      }
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const wasCompleted = task.completed;
    const nowCompleted = !wasCompleted;
    
    // Update task state
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: nowCompleted } : t)));
    
    // If task just got completed, celebrate!
    if (nowCompleted && !wasCompleted) {
      setCelebratingTask(id);
      
      // Generate AI affirmation
      const affirmation = `I just completed: ${task.title}! 🎉`;
      await sendQuickMessage(affirmation);
      
      // Clear celebration after animation
      setTimeout(() => setCelebratingTask(null), 3000);
    }
  };

  const breakdownTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setIsLoading(true);
    sendQuickMessage(`Can you break down "${task.title}" into tiny steps?`);
  };

  const startFocus = () => {
    // Show focus setup modal
    setShowFocusSetup(true);
  };
  
  const beginFocusSession = () => {
    setShowFocusSetup(false);
    setFocusMode(true);
    setShowImmersiveFocus(true);
    setTimerActive(true);
  };
  
  const handleEndFocus = () => {
    setShowImmersiveFocus(false);
    setFocusMode(false);
    setTimerActive(false);
    setFocusTime(25 * 60);
  };
  
  const handleMinimizeFocus = () => {
    setShowImmersiveFocus(false);
    // Keep focus mode active, just hide immersive view
  };
  
  const handleEnergyChange = async (newLevel: number) => {
    const oldLevel = energyLevel;
    setEnergyLevel(newLevel);
    
    // Save to Supabase
    try {
      await fetch('/api/user-state', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ energyLevel: newLevel }),
      });
    } catch (error) {
      console.error('Error saving energy level:', error);
    }
    
    // Proactive check-in when energy drops to ≤3 - will trigger Navia popup
    if (newLevel <= 3 && oldLevel > 3) {
      // Trigger Navia popup (will implement next)
      console.log('Energy dropped to low - should trigger Navia popup');
    }
  };

  const sendQuickMessage = async (message: string) => {
    setIsLoading(true);
    setIsSpeaking(true);

    // Detect emotions from user message
    let detectedEmotions = null;
    try {
      const emotionResponse = await fetch('/api/emotion-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });
      
      if (emotionResponse.ok) {
        detectedEmotions = await emotionResponse.json();
      }
    } catch (error) {
      console.log('Emotion detection unavailable, continuing without it');
    }

    // Add user message with emotions
    setMessages((prev) => [...prev, { 
      role: 'user', 
      content: message,
      emotions: detectedEmotions ? {
        topEmotion: detectedEmotions.topEmotion,
        emotionIntensity: detectedEmotions.emotionIntensity,
        allEmotions: detectedEmotions.allEmotions || [],
      } : undefined,
    }]);

    try {
      const context = {
        tasks: tasks.map((t) => ({ title: t.title, completed: t.completed })),
        energyLevel,
        focusMode,
        supportLevel, // 1=minimal, 3=balanced, 5=maximum
      };

      // Clean messages - remove emotions property before sending to API
      const cleanMessages = messages.map(({ role, content }) => ({ role, content }));
      
      const response = await fetch('/api/dashboard-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...cleanMessages, { role: 'user', content: message }],
          context,
          emotions: detectedEmotions, // Pass emotions separately
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsSpeaking(false);
              break;
            }
            try {
              const parsed = JSON.parse(data);
              assistantMessage += parsed.content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMessage;
                return newMessages;
              });
            } catch (e) {
              // Ignore
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble right now. Try again?" },
      ]);
      setIsSpeaking(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    sendQuickMessage(message);
  };

  const quickWins = [
    { icon: Coffee, text: 'Drink water', action: () => sendQuickMessage('I just drank water!') },
    { icon: Target, text: 'One tiny task', action: () => sendQuickMessage('Help me pick one tiny task') },
    { icon: Brain, text: '5 deep breaths', action: () => sendQuickMessage('I took 5 deep breaths') },
    { icon: Sparkles, text: 'Desk cleanup', action: () => sendQuickMessage('I cleaned my desk!') },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
  <>
    {/* Navbar */}
    <Navbar />
    
    {/* Immersive Focus Mode Overlay */}
    <AnimatePresence>
      {showImmersiveFocus && (
        <ImmersiveFocusMode
          taskTitle={selectedTaskForFocus ? tasks.find(t => t.id === selectedTaskForFocus)?.title || focusIntention : focusIntention}
          initialTime={focusTime}
          onEnd={handleEndFocus}
          onMinimize={handleMinimizeFocus}
          context={{
            tasks: tasks.map((t) => ({ title: t.title, completed: t.completed })),
            energyLevel,
            supportLevel,
          }}
        />
      )}
    </AnimatePresence>
    
    <div className="min-h-screen bg-[var(--cream)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-[var(--charcoal)] mb-2">
            Welcome back, {user?.firstName || 'friend'}! 💛
          </h1>
          <p className="text-lg text-[var(--clay-700)]">
            <span className="font-bold text-xl text-[var(--clay-600)]">You've got this.</span> One step at a time.
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tasks & Focus */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tasks Section */}
            <Section
              title="Your Tasks"
              icon={CheckCircle2}
              isVisible={sectionsVisible.tasks}
              onToggle={() => toggleSection('tasks')}
            >
              <div className="space-y-3">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      scale: celebratingTask === task.id ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                      scale: { duration: 0.5, repeat: celebratingTask === task.id ? 2 : 0 }
                    }}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      celebratingTask === task.id 
                        ? 'bg-[var(--sage-100)] border-[var(--sage-400)] shadow-lg' 
                        : 'bg-white border-[var(--stone)] hover:border-[var(--clay-400)]'
                    }`}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 transition-transform hover:scale-110"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-[var(--sage-600)]" />
                      ) : (
                        <Circle className="w-6 h-6 text-[var(--clay-400)]" />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-[var(--charcoal)] ${
                        task.completed ? 'line-through opacity-50' : ''
                      }`}
                    >
                      {task.title}
                    </span>
                    {!task.completed && (
                      <button
                        onClick={() => breakdownTask(task.id)}
                        className="text-[var(--clay-600)] hover:text-[var(--clay-700)] text-sm font-medium"
                      >
                        Break down
                      </button>
                    )}
                    {celebratingTask === task.id && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        className="text-2xl"
                      >
                        🎉
                      </motion.span>
                    )}
                  </motion.div>
                ))}

                {/* Add Task */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    placeholder="Add a task..."
                    className="flex-1 bg-white border border-[var(--stone)] rounded-lg px-4 py-2 text-[var(--charcoal)] placeholder-[var(--sage-500)] focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)]"
                  />
                  <button
                    onClick={addTask}
                    className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-lg p-2 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Section>

            {/* Focus Mode */}
            <Section
              title="Focus Mode"
              icon={Timer}
              isVisible={sectionsVisible.focus}
              onToggle={() => toggleSection('focus')}
            >
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-[var(--charcoal)]">{formatTime(focusTime)}</div>
                <div className="flex gap-3 justify-center">
                  {!focusMode ? (
                    <button
                      onClick={startFocus}
                      className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-8 py-3 rounded-full transition-all font-medium"
                    >
                      Start Focus Session
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setTimerActive(!timerActive)}
                        className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-6 py-2 rounded-full transition-all"
                      >
                        {timerActive ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => {
                          setFocusMode(false);
                          setTimerActive(false);
                          setFocusTime(25 * 60);
                        }}
                        className="bg-white hover:bg-[var(--sand)] text-[var(--charcoal)] border border-[var(--stone)] px-6 py-2 rounded-full transition-all"
                      >
                        End Session
                      </button>
                    </>
                  )}
                </div>
                {focusMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--sage-100)] border-2 border-[var(--sage-400)] rounded-lg p-4"
                  >
                    <p className="text-[var(--sage-700)] text-sm font-medium mb-1">
                      Focusing on: {selectedTaskForFocus ? tasks.find(t => t.id === selectedTaskForFocus)?.title : focusIntention}
                    </p>
                    <p className="text-[var(--sage-700)] text-base font-bold">I'm right here with you 💛</p>
                  </motion.div>
                )}
                {!focusMode && (
                  <p className="text-[var(--clay-700)] text-base">
                    Set your intention and <span className="font-bold text-[var(--clay-600)]">I'll stay with you</span>
                  </p>
                )}
              </div>
            </Section>

            {/* Quick Wins */}
            <Section
              title="Quick Wins"
              icon={Zap}
              isVisible={sectionsVisible.quickWins}
              onToggle={() => toggleSection('quickWins')}
            >
              <div className="grid grid-cols-2 gap-3">
                {quickWins.map((win, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={win.action}
                    className="bg-white hover:bg-[var(--sand)] border border-[var(--stone)] rounded-lg p-4 text-[var(--charcoal)] transition-all flex flex-col items-center gap-2"
                  >
                    <win.icon className="w-6 h-6" />
                    <span className="text-sm">{win.text}</span>
                  </motion.button>
                ))}
              </div>
            </Section>
          </div>

          {/* Right Column - AI Chat & Energy */}
          <div className="space-y-6">
            {/* Energy Level */}
            <Section
              title="How are you feeling?"
              icon={Heart}
              isVisible={sectionsVisible.energy}
              onToggle={() => toggleSection('energy')}
            >
              <div className="space-y-6">
                {/* Energy Level */}
                <div>
                  <label className="block text-sm font-bold text-[var(--charcoal)] mb-3">
                    Energy Level
                  </label>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-[var(--charcoal)] mb-2">
                        {energyLevel}/10
                      </div>
                      <p className="text-base font-bold text-[var(--clay-700)]">
                        {energyLevel <= 3 && "Low energy - that's okay 💛"}
                        {energyLevel > 3 && energyLevel <= 6 && "Moderate energy"}
                        {energyLevel > 6 && "Good energy! 🌟"}
                      </p>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={energyLevel}
                        onChange={(e) => handleEnergyChange(Number(e.target.value))}
                        className="w-full h-4 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, 
                            #c4a57b 0%, 
                            #c4a57b ${((energyLevel - 1) / 9) * 100}%, 
                            #e8dcc8 ${((energyLevel - 1) / 9) * 100}%, 
                            #e8dcc8 100%)`,
                          accentColor: energyLevel <= 3 ? '#c4a57b' : energyLevel <= 6 ? '#9ca986' : '#6b8e6f'
                        }}
                      />
                      <div className="flex justify-between text-sm font-medium text-[var(--clay-600)] mt-2 px-1">
                        <span>Drained</span>
                        <span>Okay</span>
                        <span>Energized</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-center text-[var(--sage-700)] bg-[var(--sage-100)] rounded-lg p-3 border border-[var(--sage-300)]">
                      <span className="font-bold text-base text-[var(--sage-800)]">Tell me how you're feeling</span> - I'll adjust to meet you where you are
                    </p>
                  </div>
                </div>

                {/* Support Level */}
                <div className="border-t border-[var(--stone)] pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-[var(--charcoal)]">
                      How much support do you need?
                    </label>
                    <button
                      onClick={() => setShowSupportInfo(true)}
                      className="text-[var(--clay-500)] hover:text-[var(--clay-700)] transition-colors"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[var(--clay-600)] mb-2">
                        {supportLevel === 1 && "🎯 Minimal"}
                        {supportLevel === 2 && "👍 Low"}
                        {supportLevel === 3 && "⚖️ Balanced"}
                        {supportLevel === 4 && "🤝 High"}
                        {supportLevel === 5 && "💛 Maximum"}
                      </div>
                      <p className="text-sm text-[var(--clay-600)]">
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
                      onChange={(e) => setSupportLevel(Number(e.target.value))}
                      className="w-full h-4 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-[var(--clay-300)] to-[var(--clay-600)]"
                    />
                    <div className="flex justify-between text-xs font-medium text-[var(--clay-600)] px-1">
                      <span>Independent</span>
                      <span>Balanced</span>
                      <span>Supported</span>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* AI Chat */}
            <Section
              title="Chat with Navia"
              icon={Sparkles}
              isVisible={sectionsVisible.chat}
              onToggle={() => toggleSection('chat')}
            >
              <div className="space-y-4">
                <NaviaAvatar
                  isSpeaking={isSpeaking}
                  isThinking={isLoading && !isSpeaking}
                  size="sm"
                />

                {/* Messages */}
                <div className="h-64 overflow-y-auto space-y-2 pr-2">
                  {messages.length === 0 && (
                    <p className="text-[var(--clay-600)] text-sm text-center py-8">
                      Hi! I'm here to help. How can I support you today?
                    </p>
                  )}
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${
                        message.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                          message.role === 'user'
                            ? 'bg-[var(--clay-500)] text-white'
                            : 'bg-[var(--sand)] text-[var(--charcoal)]'
                        }`}
                      >
                        {message.content}
                      </div>
                      {/* Emotion indicator for user messages */}
                      {message.role === 'user' && message.emotions && (
                        <div className="flex gap-1 mt-1 text-xs text-[var(--sage-600)]">
                          <span className="font-medium">{message.emotions.topEmotion}</span>
                          <span>·</span>
                          <span>{message.emotions.emotionIntensity}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input with voice */}
                <form onSubmit={sendMessage} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type or speak..."
                    disabled={isLoading}
                    className="flex-1 bg-white border border-[var(--stone)] rounded-lg px-3 py-2 text-sm text-[var(--charcoal)] placeholder-[var(--sage-500)] focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)] disabled:opacity-50"
                  />
                  <div className="scale-75">
                    <VoiceInput
                      onTranscript={(text, emotions) => {
                        setInput(text);
                        // Emotions will be detected when message is sent
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-lg p-2 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </Section>
          </div>
        </div>
      </div>
      
      {/* Focus Setup Modal */}
      {showFocusSetup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowFocusSetup(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-white to-[var(--sand)] rounded-3xl p-8 max-w-lg w-full shadow-2xl border-2 border-[var(--clay-200)]"
          >
            <h2 className="text-3xl font-bold text-[var(--charcoal)] mb-3">
              What are you focusing on?
            </h2>
            <p className="text-lg text-[var(--clay-700)] mb-6">
              <span className="font-bold text-xl text-[var(--clay-600)]">I'll stay with you</span> the whole time 💛
            </p>
            
            <div className="space-y-4">
              {/* Choose from tasks */}
              {tasks.filter(t => !t.completed).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
                    Choose a task:
                  </label>
                  <select
                    value={selectedTaskForFocus}
                    onChange={(e) => {
                      setSelectedTaskForFocus(e.target.value);
                      setFocusIntention('');
                    }}
                    className="w-full bg-white border border-[var(--stone)] rounded-lg px-4 py-3 text-[var(--charcoal)] focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)]"
                  >
                    <option value="">Select a task...</option>
                    {tasks.filter(t => !t.completed).map(task => (
                      <option key={task.id} value={task.id}>{task.title}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Or custom intention */}
              <div>
                <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
                  Or write your own:
                </label>
                <input
                  type="text"
                  value={focusIntention}
                  onChange={(e) => {
                    setFocusIntention(e.target.value);
                    setSelectedTaskForFocus('');
                  }}
                  placeholder="e.g., Reading for 25 minutes..."
                  className="w-full bg-white border border-[var(--stone)] rounded-lg px-4 py-3 text-[var(--charcoal)] placeholder-[var(--sage-500)] focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)]"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowFocusSetup(false)}
                  className="flex-1 bg-white hover:bg-[var(--sand)] text-[var(--charcoal)] border border-[var(--stone)] px-6 py-3 rounded-full transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={beginFocusSession}
                  disabled={!selectedTaskForFocus && !focusIntention.trim()}
                  className="flex-1 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-6 py-3 rounded-full transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Let's Focus!
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Support Level Info Modal */}
      {showSupportInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowSupportInfo(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--charcoal)]">
                Support Levels Explained
              </h2>
              <button
                onClick={() => setShowSupportInfo(false)}
                className="text-[var(--clay-600)] hover:text-[var(--clay-800)]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-[var(--sand)] rounded-lg p-4 border-l-4 border-[var(--clay-500)]">
                <h3 className="text-lg font-bold text-[var(--charcoal)] mb-2">🎯 Level 1: Minimal</h3>
                <p className="text-[var(--clay-700)] mb-2">
                  <strong>Best for:</strong> When you're feeling confident and just need high-level guidance
                </p>
                <p className="text-sm text-[var(--clay-600)] italic">
                  Example: "Break it into 3 main steps. You've got this!"
                </p>
              </div>

              <div className="bg-[var(--sand)] rounded-lg p-4 border-l-4 border-[var(--clay-500)]">
                <h3 className="text-lg font-bold text-[var(--charcoal)] mb-2">👍 Level 2: Low</h3>
                <p className="text-[var(--clay-700)] mb-2">
                  <strong>Best for:</strong> When you want some structure but prefer independence
                </p>
                <p className="text-sm text-[var(--clay-600)] italic">
                  Example: "Start with X, then Y. Let me know if you need help!"
                </p>
              </div>

              <div className="bg-[var(--sage-100)] rounded-lg p-4 border-l-4 border-[var(--sage-600)]">
                <h3 className="text-lg font-bold text-[var(--charcoal)] mb-2">⚖️ Level 3: Balanced (Default)</h3>
                <p className="text-[var(--clay-700)] mb-2">
                  <strong>Best for:</strong> A good mix of guidance and independence
                </p>
                <p className="text-sm text-[var(--clay-600)] italic">
                  Example: "Let's break this down: 1) X, 2) Y. How does that feel?"
                </p>
              </div>

              <div className="bg-[var(--sand)] rounded-lg p-4 border-l-4 border-[var(--clay-500)]">
                <h3 className="text-lg font-bold text-[var(--charcoal)] mb-2">🤝 Level 4: High</h3>
                <p className="text-[var(--clay-700)] mb-2">
                  <strong>Best for:</strong> When you need detailed steps and frequent check-ins
                </p>
                <p className="text-sm text-[var(--clay-600)] italic">
                  Example: "First, do X. This might take 5 minutes. Then Y. I'll check in after each step!"
                </p>
              </div>

              <div className="bg-[var(--sand)] rounded-lg p-4 border-l-4 border-[var(--clay-500)]">
                <h3 className="text-lg font-bold text-[var(--charcoal)] mb-2">💛 Level 5: Maximum</h3>
                <p className="text-[var(--clay-700)] mb-2">
                  <strong>Best for:</strong> When you're overwhelmed and need hand-holding through everything
                </p>
                <p className="text-sm text-[var(--clay-600)] italic">
                  Example: "Let's do this together! Step 1: Open the app. Done? Great! Step 2: Click here..."
                </p>
              </div>

              <div className="bg-[var(--sage-100)] rounded-lg p-4 mt-6">
                <p className="text-sm text-[var(--sage-800)]">
                  <strong>💡 Tip:</strong> You can change this anytime based on how you're feeling. There's no "right" level - just what works for you today!
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </div>
    </>
  );
}

// Reusable Section Component
function Section({
  title,
  icon: Icon,
  isVisible,
  onToggle,
  children,
}: {
  title: string;
  icon: any;
  isVisible: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[var(--stone)] overflow-hidden shadow-sm"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--sand)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-[var(--clay-600)]" />
          <h2 className="text-xl font-semibold text-[var(--charcoal)]">{title}</h2>
        </div>
        {isVisible ? (
          <ChevronUp className="w-5 h-5 text-[var(--clay-600)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--clay-600)]" />
        )}
      </button>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
