'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import NaviaAvatar from '@/components/ai/NaviaAvatar';
import VoiceInput from '@/components/ai/VoiceInput';
import ImmersiveFocusMode from '@/components/focus/ImmersiveFocusMode';
import DashboardBento from '@/components/dashboard/DashboardBento';
import Navbar from '@/components/layout/Navbar';
import NaviaAssistant from '@/components/ai/NaviaAssistant';
import DashboardTutorial from '@/components/tutorial/DashboardTutorial';
import { useTutorial } from '@/hooks/useTutorial';
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
  Mic,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface Task {
  id: string;
  task_id?: string; // Backend uses task_id
  title: string;
  completed: boolean;
  status?: string; // Backend uses status instead of completed
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
  const { showTutorial, completeTutorial, closeTutorial, startTutorial } = useTutorial();
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Log whenever tasks change
  useEffect(() => {
    console.log(' [DASHBOARD-NEW] Tasks state changed:', tasks);
    console.log(' [DASHBOARD-NEW] Task count:', tasks.length);
    if (tasks.length > 0) {
      console.log(' [DASHBOARD-NEW] Task details:', tasks.map(t => ({
        id: t.id,
        title: t.title,
        completed: t.completed
      })));
    }
  }, [tasks]);

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
  const [customFocusMinutes, setCustomFocusMinutes] = useState(25); // For user input
  const [timerActive, setTimerActive] = useState(false);
  const [isPausedInFocus, setIsPausedInFocus] = useState(false);

  // Restore focus session if returning from Spotify auth
  useEffect(() => {
    const savedFocusState = sessionStorage.getItem('focus_session_state');
    if (savedFocusState) {
      try {
        const state = JSON.parse(savedFocusState);
        setFocusMode(state.focusMode);
        setFocusTime(state.focusTime);
        setFocusIntention(state.focusIntention);
        setSelectedTaskForFocus(state.selectedTaskForFocus);
        setShowImmersiveFocus(state.showImmersiveFocus);
        setIsPausedInFocus(state.isPausedInFocus);
        setTimerActive(state.timerActive);
        sessionStorage.removeItem('focus_session_state');
        console.log('🔄 [DASHBOARD-NEW] Restored focus session after Spotify auth');
      } catch (error) {
        console.error('Failed to restore focus state:', error);
      }
    }
  }, []);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [supportLevel, setSupportLevel] = useState(3);
  const [isLoadingState, setIsLoadingState] = useState(true); // 1=minimal, 3=balanced, 5=maximum support
  const [showSupportInfo, setShowSupportInfo] = useState(false);
  const [showImmersiveFocus, setShowImmersiveFocus] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [naviaManualTrigger, setNaviaManualTrigger] = useState(false);
  const [naviaManualMessage, setNaviaManualMessage] = useState('');
  const [naviaCelebrationMode, setNaviaCelebrationMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        console.log('🔄 [DASHBOARD-NEW] Starting data load...');
        
        // Load user state
        const stateResponse = await fetch('/api/user-state');
        if (stateResponse.ok) {
          const data = await stateResponse.json();
          console.log('✅ [DASHBOARD-NEW] User state loaded:', data);
          setEnergyLevel(data.energyLevel);
          setSupportLevel(data.supportLevel);
        }

        // Load tasks
        console.log('📋 [DASHBOARD-NEW] Fetching tasks from /api/tasks...');
        const tasksResponse = await fetch('/api/tasks');
        console.log('📋 [DASHBOARD-NEW] Tasks response status:', tasksResponse.status);
        
        if (tasksResponse.ok) {
          const data = await tasksResponse.json();
          console.log('📦 [DASHBOARD-NEW] Raw tasks data:', data);
          console.log('📋 [DASHBOARD-NEW] Tasks array:', data.tasks);
          console.log('📋 [DASHBOARD-NEW] Number of tasks:', data.tasks?.length || 0);
          
          if (data.tasks && data.tasks.length > 0) {
            console.log('🎯 [DASHBOARD-NEW] First task:', data.tasks[0]);
            console.log('🎯 [DASHBOARD-NEW] Task titles:', data.tasks.map((t: any) => t.title || t.name || 'NO TITLE'));
          } else {
            console.warn('⚠️ [DASHBOARD-NEW] No tasks returned from API!');
          }
          
          setTasks(data.tasks || []);
          console.log('✅ [DASHBOARD-NEW] Tasks set to state');
        } else {
          console.error('❌ [DASHBOARD-NEW] Tasks response not OK:', tasksResponse.statusText);
        }
      } catch (error) {
        console.error('❌ [DASHBOARD-NEW] Error loading data:', error);
      } finally {
        setIsLoadingState(false);
        console.log('✅ [DASHBOARD-NEW] Data load complete');
      }
    };

    loadData();
  }, []);

  // Focus timer - ONLY runs when NOT in immersive mode (minimized state)
  useEffect(() => {
    // Don't run timer in dashboard if immersive mode is showing
    if (showImmersiveFocus) return;
    
    let interval: NodeJS.Timeout;
    if (timerActive && focusTime > 0 && !isPausedInFocus) {
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
  }, [timerActive, focusTime, showImmersiveFocus, isPausedInFocus]);

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

  const addTask = async (title?: string) => {
    const taskTitle = title || newTask.trim();
    if (!taskTitle) return;
    
    console.log('➕ [DASHBOARD-NEW] Adding task:', taskTitle);
    
    // Create task data (no ID - Supabase will generate UUID)
    const taskData = {
      title: taskTitle,
      completed: false,
      priority: 'medium',
      time_estimate: 30,
      category: 'daily_life',
    };
    
    if (!title) setNewTask('');
    
    // Save to backend first
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ [DASHBOARD-NEW] Failed to save task:', error);
        throw error;
      }
      
      const data = await response.json();
      console.log('✅ [DASHBOARD-NEW] Task saved:', data);
      
      // Add to UI with the real UUID from Supabase
      if (data.task) {
        setTasks(prevTasks => [...prevTasks, data.task]);
      }
    } catch (error) {
      console.error('❌ [DASHBOARD-NEW] Error saving task:', error);
    }
  };

  const toggleTask = async (id: string) => {
    // Find task by either id or task_id
    const task = tasks.find(t => t.id === id || t.task_id === id);
    if (!task) {
      console.error('❌ [DASHBOARD-NEW] Task not found for toggle:', id);
      return;
    }
    
    const actualId = task.task_id || task.id;
    
    const wasCompleted = task.completed;
    const nowCompleted = !wasCompleted;
    
    console.log('✅ [DASHBOARD-NEW] Toggling task:', actualId, wasCompleted, '->', nowCompleted);
    
    // Optimistic UI update - instant feedback
    setTasks(tasks.map((t) => 
      (t.id === id || t.task_id === id) ? { ...t, completed: nowCompleted } : t
    ));
    
    // If task just got completed, show Navia celebration (but not for un-completion)
    if (nowCompleted && !wasCompleted) {
      // Trigger Navia with a celebration message (celebration mode = no AI response, just show message)
      setNaviaManualMessage(`Great job completing "${task.title}"! 🎉 You're doing amazing. Want to talk about how it went, or ready to tackle another task?`);
      setNaviaCelebrationMode(true);
      setNaviaManualTrigger(true);
      setTimeout(() => {
        setNaviaManualTrigger(false);
        setNaviaCelebrationMode(false);
      }, 1000);
    }
    
    // Update backend
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          task_id: actualId, 
          status: nowCompleted ? 'completed' : 'not_started' 
        }),
      });
      
      if (!response.ok) {
        console.error('❌ [DASHBOARD-NEW] Failed to update task');
        // Revert on error
        setTasks(tasks.map((t) => 
          (t.id === id || t.task_id === id) ? { ...t, completed: wasCompleted } : t
        ));
      }
    } catch (error) {
      console.error('❌ [DASHBOARD-NEW] Error updating task:', error);
      // Revert on error
      setTasks(tasks.map((t) => 
        (t.id === id || t.task_id === id) ? { ...t, completed: wasCompleted } : t
      ));
    }
  };

  const deleteTask = async (taskId: string) => {
    console.log('🗑️ [DASHBOARD-NEW] Deleting task:', taskId);
    
    // Find task by either id or task_id
    const task = tasks.find(t => t.id === taskId || t.task_id === taskId);
    if (!task) {
      console.error('❌ [DASHBOARD-NEW] Task not found for delete:', taskId);
      return;
    }
    
    const actualId = task.task_id || task.id;
    
    // Optimistic update - remove immediately
    const taskToDelete = task;
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId && t.task_id !== taskId));
    
    try {
      const response = await fetch(`/api/tasks?id=${actualId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      console.log('✅ [DASHBOARD-NEW] Task deleted successfully');
    } catch (error) {
      console.error('❌ [DASHBOARD-NEW] Error deleting task:', error);
      // Revert optimistic update on error - add the task back
      if (taskToDelete) {
        setTasks(prevTasks => [...prevTasks, taskToDelete]);
      }
    }
  };

  const breakdownTask = async (taskId: string) => {
    console.log('🔨 [DASHBOARD-NEW] Breakdown requested for task ID:', taskId);
    console.log('🔨 [DASHBOARD-NEW] Available tasks:', tasks.map(t => ({ id: t.id, task_id: t.task_id, title: t.title })));
    
    // Find task by either id or task_id
    const task = tasks.find((t) => t.id === taskId || t.task_id === taskId);
    if (!task) {
      console.error('❌ [DASHBOARD-NEW] Task not found for breakdown:', taskId);
      console.error('❌ [DASHBOARD-NEW] Searched in tasks:', tasks.length);
      return;
    }

    console.log('🔨 [DASHBOARD-NEW] Breaking down task:', task.title);
    
    // Trigger Navia Assistant with breakdown request
    const breakdownPrompt = `Can you help me break down "${task.title}" into tiny, manageable steps? Make each step super small and easy to start. I need this to feel less overwhelming.`;
    
    setNaviaManualMessage(breakdownPrompt);
    setNaviaManualTrigger(true);
    
    console.log('✅ [DASHBOARD-NEW] Navia triggered for breakdown with prompt:', breakdownPrompt);
    
    setTimeout(() => setNaviaManualTrigger(false), 1000);
  };

  // Focus timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime((prev) => prev - 1);
      }, 1000);
    } else if (focusTime === 0) {
      setTimerActive(false);
    }

    return () => clearInterval(interval);
  }, [timerActive, focusTime]);

  const startFocus = () => {
    console.log('🎯 [DASHBOARD-NEW] Starting focus - opening setup modal');
    // Show focus setup modal
    setShowFocusSetup(true);
  };
  
  const beginFocusSession = () => {
    console.log('🎯 [DASHBOARD-NEW] Beginning focus session');
    console.log('  - Selected task:', selectedTaskForFocus);
    console.log('  - Focus intention:', focusIntention);
    console.log('  - Focus time:', customFocusMinutes, 'minutes');
    
    // Set the focus time from user input
    setFocusTime(customFocusMinutes * 60);
    setShowFocusSetup(false);
    setFocusMode(true);
    setShowImmersiveFocus(true);
    setTimerActive(true);
    setIsPausedInFocus(false);
    
    console.log('✅ [DASHBOARD-NEW] Immersive focus mode activated');
  };
  
  const handleEndFocus = () => {
    console.log('🏁 [DASHBOARD-NEW] Ending focus session');
    setShowImmersiveFocus(false);
    setFocusMode(false);
    setTimerActive(false);
    setIsPausedInFocus(false);
    setFocusTime(25 * 60);
  };
  
  const handleMinimizeFocus = (isPaused: boolean, currentTime: number) => {
    console.log('📐 [DASHBOARD-NEW] Minimizing focus mode');
    console.log('  - Paused:', isPaused);
    console.log('  - Time remaining:', currentTime, 'seconds');
    
    setShowImmersiveFocus(false);
    setIsPausedInFocus(isPaused);
    setFocusTime(currentTime); // Sync the time
    
    // Keep focus mode active, just hide immersive view
  };

  const handlePauseFocus = () => {
    console.log('⏸️ [DASHBOARD-NEW] Toggling focus pause');
    setIsPausedInFocus(!isPausedInFocus);
    setTimerActive(!isPausedInFocus); // Toggle timer
  };

  const handleEndFocusFromBento = () => {
    console.log('🏁 [DASHBOARD-NEW] Ending focus from bento');
    handleEndFocus();
  };

  const handleAddTime = (minutes: number) => {
    console.log(`⏱️ [DASHBOARD-NEW] Adding ${minutes} minutes to focus session`);
    setFocusTime(prev => prev + (minutes * 60));
  };
  
  const handleEnergyChange = async (newLevel: number) => {
    const oldLevel = energyLevel;
    setEnergyLevel(newLevel);
    
    console.log('⚡ [DASHBOARD-NEW] Energy level changed:', oldLevel, '->', newLevel);
    
    // Save to backend
    try {
      await fetch('/api/user-state', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ energyLevel: newLevel }),
      });
    } catch (error) {
      console.error('Error saving energy level:', error);
    }
    
    // Proactive check-in when energy drops to ≤4
    if (newLevel <= 4 && oldLevel > 4) {
      console.log('💛 [DASHBOARD-NEW] Low energy detected - triggering Navia');
      // Use celebration mode to show message directly without AI generating a fake conversation
      setNaviaManualMessage("I noticed your energy is low. That's completely okay 💛 Want to talk about it, or should I help you find something gentle to focus on?");
      setNaviaCelebrationMode(true);
      setNaviaManualTrigger(true);
      setTimeout(() => {
        setNaviaManualTrigger(false);
        setNaviaCelebrationMode(false);
      }, 1000);
    }
  };

  const handleSupportChange = async (newLevel: number) => {
    setSupportLevel(newLevel);
    
    console.log('🤝 [DASHBOARD-NEW] Support level changed:', supportLevel, '->', newLevel);
    
    // Save to backend
    try {
      await fetch('/api/user-state', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supportLevel: newLevel }),
      });
      console.log('✅ [DASHBOARD-NEW] Support level saved to backend');
    } catch (error) {
      console.error('❌ [DASHBOARD-NEW] Error saving support level:', error);
    }
  };

  // Play text using Hume TTS
  const playTTS = async (text: string) => {
    try {
      console.log('🔊 Playing TTS...');
      setIsPlayingAudio(true);
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          instructions: 'Speak with a warm, soothing, friendly female voice. Sound caring and supportive.',
        }),
      });

      if (!response.ok) {
        setIsPlayingAudio(false);
        return;
      }

      const data = await response.json();
      
      if (!data.success || !data.audio) {
        setIsPlayingAudio(false);
        return;
      }

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))],
        { type: data.mimeType }
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlayingAudio(false);
      };
      await audioRef.current.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlayingAudio(false);
    }
  };

  // Handle voice recording with live speech recognition
  const startVoiceRecording = async () => {
    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in your browser. Please use Chrome.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      let finalTranscript = '';
      
      recognition.onresult = async (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Show interim results in input
        if (interimTranscript) {
          setInput(finalTranscript + interimTranscript);
        }
      };
      
      recognition.onend = async () => {
        setIsRecording(false);
        
        if (finalTranscript.trim()) {
          setInput(finalTranscript.trim());
          // Auto-send the message
          await sendQuickMessage(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Could not start speech recognition. Please check permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
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
              
              // Handle extracted tasks
              if (parsed.tasks && Array.isArray(parsed.tasks)) {
                console.log('📋 [DASHBOARD-NEW] Received tasks from chat:', parsed.tasks);
                // Add tasks to UI
                setTasks(prevTasks => [...prevTasks, ...parsed.tasks.map((t: any) => ({
                  id: t.task_id,
                  task_id: t.task_id,
                  title: t.title,
                  completed: false,
                  status: t.status || 'not_started',
                  priority: t.priority,
                  time_estimate: t.time_estimate,
                  category: t.category,
                }))]);
              }
              
              // Handle chat content
              if (parsed.content !== undefined && parsed.content !== null && parsed.content !== '') {
                assistantMessage += parsed.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = assistantMessage;
                  return newMessages;
                });
              } else if (parsed.content === undefined) {
                console.log('⚠️ [DASHBOARD-NEW] Received chunk with undefined content, skipping');
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
      
      // Play TTS if voice mode is enabled
      if (voiceMode && assistantMessage) {
        await playTTS(assistantMessage);
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
    
    {/* Main content with padding for floating navbar */}
    <div className="pt-40 pb-8">
      {/* Immersive Focus Mode Overlay */}
      <AnimatePresence>
        {showImmersiveFocus && (
          <ImmersiveFocusMode
          taskTitle={selectedTaskForFocus ? tasks.find(t => t.id === selectedTaskForFocus)?.title || focusIntention : focusIntention}
          initialTime={focusTime}
          initialPaused={isPausedInFocus}
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

    {/* New Bento Grid Dashboard */}
    <DashboardBento
      tasks={tasks}
      onToggleTask={toggleTask}
      onAddTask={addTask}
      onDeleteTask={deleteTask}
      onBreakdownTask={breakdownTask}
      onStartFocus={startFocus}
      onOpenNavia={() => {
        console.log('🎯 [DASHBOARD-NEW] Opening Navia from DashboardBento');
        setNaviaManualMessage("Hey! I'm here to help. What's on your mind? 💛");
        setNaviaManualTrigger(true);
        setTimeout(() => setNaviaManualTrigger(false), 1000);
      }}
      energyLevel={energyLevel}
      onEnergyChange={handleEnergyChange}
      supportLevel={supportLevel}
      onSupportChange={handleSupportChange}
      userName={user?.firstName || 'friend'}
      userId={user?.id || 'guest'}
      focusMode={focusMode}
      focusTime={focusTime}
      focusTask={selectedTaskForFocus ? tasks.find(t => t.id === selectedTaskForFocus)?.title || focusIntention : focusIntention}
      onMaximizeFocus={() => setShowImmersiveFocus(true)}
      onPauseFocus={handlePauseFocus}
      onEndFocus={handleEndFocusFromBento}
      onAddTime={handleAddTime}
      isPaused={isPausedInFocus}
    />

    {/* Focus Setup Modal */}
    <AnimatePresence>
      {showFocusSetup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowFocusSetup(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
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
              <div>
                <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
                  Choose a task:
                </label>
                {tasks.filter(t => !t.completed && t.status !== 'completed').length > 0 ? (
                  <select
                    value={selectedTaskForFocus}
                    onChange={(e) => {
                      setSelectedTaskForFocus(e.target.value);
                      setFocusIntention('');
                    }}
                    className="w-full bg-white border border-[var(--stone)] rounded-lg px-4 py-3 text-[var(--charcoal)] focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)]"
                  >
                    <option value="">Select a task...</option>
                    {tasks.filter(t => !t.completed && t.status !== 'completed').map(task => (
                      <option key={task.id} value={task.id}>{task.title}</option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full bg-[var(--sand)] border border-[var(--clay-200)] rounded-lg px-4 py-3 text-[var(--sage-600)] text-sm italic">
                    No active tasks yet. Write your own focus intention below! 💛
                  </div>
                )}
              </div>
              
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
              
              {/* Time selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
                  How long do you want to focus?
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[15, 25, 45, 60].map(minutes => (
                    <button
                      key={minutes}
                      onClick={() => setCustomFocusMinutes(minutes)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        customFocusMinutes === minutes
                          ? 'bg-[var(--clay-500)] text-white shadow-md'
                          : 'bg-white border border-[var(--stone)] text-[var(--charcoal)] hover:border-[var(--clay-400)]'
                      }`}
                    >
                      {minutes}m
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customFocusMinutes}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setCustomFocusMinutes(1);
                      } else {
                        const num = parseInt(val);
                        if (!isNaN(num)) {
                          setCustomFocusMinutes(Math.max(1, Math.min(180, num)));
                        }
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure valid value on blur
                      if (e.target.value === '' || parseInt(e.target.value) < 1) {
                        setCustomFocusMinutes(1);
                      }
                    }}
                    className="flex-1 bg-white border border-[var(--stone)] rounded-lg px-4 py-2 text-[var(--charcoal)] focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)]"
                  />
                  <span className="text-sm text-[var(--clay-700)] font-medium">minutes</span>
                </div>
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
    </AnimatePresence>
    
    {/* OLD DASHBOARD - KEEPING FOR REFERENCE, WILL REMOVE AFTER TESTING */}
    <div className="min-h-screen bg-[var(--cream)] p-4 md:p-8" style={{display: 'none'}}>
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
                {tasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 px-6 text-center"
                  >
                    <div className="w-20 h-20 bg-[var(--sand)] rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-10 h-10 text-[var(--clay-400)]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--charcoal)] mb-2">
                      No tasks yet
                    </h3>
                    <p className="text-[var(--sage-600)] mb-6 max-w-sm">
                      Start your day by adding your first task below. I'll help you break it down if it feels overwhelming! 💛
                    </p>
                  </motion.div>
                ) : (
                  tasks.map((task) => (
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
                  ))
                )}

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
                    onClick={() => addTask()}
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

                {/* Input with voice mode toggle */}
                <div className="space-y-2">
                  <form onSubmit={sendMessage} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={isRecording ? "Listening..." : voiceMode ? "Speak or type..." : "Type a message..."}
                      disabled={isLoading || isRecording}
                      className="flex-1 bg-white border border-[var(--stone)] rounded-lg px-3 py-2 text-sm text-[var(--charcoal)] placeholder-[var(--sage-500)] focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)] disabled:opacity-50"
                    />
                    
                    {/* Voice mode toggle */}
                    <button
                      type="button"
                      onClick={() => setVoiceMode(!voiceMode)}
                      className={`${
                        voiceMode ? 'bg-[var(--sage-600)]' : 'bg-white border border-[var(--stone)]'
                      } ${voiceMode ? 'text-white' : 'text-[var(--charcoal)]'} rounded-lg p-2 hover:opacity-80 transition-all`}
                      title={voiceMode ? "Voice mode ON" : "Voice mode OFF"}
                    >
                      {voiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>

                    {/* Mic button or Send button */}
                    {voiceMode ? (
                      <button
                        type="button"
                        onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                        disabled={isLoading}
                        className={`${
                          isRecording ? 'bg-red-500 animate-pulse' : 'bg-[var(--clay-500)]'
                        } hover:opacity-90 text-white rounded-lg p-2 transition-all disabled:opacity-50`}
                        title={isRecording ? "Stop recording" : "Start recording"}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-lg p-2 transition-colors disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </form>
                  
                  {/* Voice mode indicator */}
                  {voiceMode && (
                    <p className="text-xs text-center text-[var(--sage-600)]">
                      {isRecording ? "🎤 Recording... Click mic to stop" : isPlayingAudio ? "🔊 Navia is speaking..." : "Click mic to speak"}
                    </p>
                  )}
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
      
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
      
      {/* Context-Aware Navia Assistant */}
      <NaviaAssistant
        energyLevel={energyLevel}
        focusMode={focusMode}
        context={{
          tasks: tasks.map((t) => ({ title: t.title, completed: t.completed })),
          energyLevel,
          supportLevel,
        }}
        manualTrigger={naviaManualTrigger}
        manualMessage={naviaManualMessage}
        celebrationMode={naviaCelebrationMode}
        onBreakdownRequest={(taskTitle) => {
          console.log('Breakdown requested for:', taskTitle);
          setNaviaManualTrigger(false);
        }}
      />

      {/* Dashboard Tutorial */}
      <DashboardTutorial
        isOpen={showTutorial}
        onClose={closeTutorial}
        onComplete={completeTutorial}
        variant="bento"
      />

      {/* Optional: Tutorial trigger button */}
      <button
        onClick={startTutorial}
        className="fixed bottom-6 right-6 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center gap-2 font-semibold"
        title="Show tutorial"
      >
        <span>❓</span>
        <span className="hidden sm:inline">Tutorial</span>
      </button>
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
