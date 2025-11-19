'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import NaviaAvatar from '@/components/ai/NaviaAvatar';
import { MessageCircle, Mic, Send, Volume2, Loader2 } from 'lucide-react';

type OnboardingMode = 'initial' | 'name' | 'chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function OnboardingV2() {
  const router = useRouter();
  const { user } = useUser();
  const [mode, setMode] = useState<OnboardingMode>('initial');
  const [userName, setUserName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [canFinish, setCanFinish] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [showSkipOption, setShowSkipOption] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPreparingToSpeak, setIsPreparingToSpeak] = useState(false);
  const [checkingInvite, setCheckingInvite] = useState(true);
  const textRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check invite status before allowing onboarding
  useEffect(() => {
    const checkInviteStatus = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) {
        return;
      }

      try {
        const response = await fetch('/api/check-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.primaryEmailAddress.emailAddress }),
        });

        const data = await response.json();

        if (!data.allowed) {
          // Not invited - redirect to invite-only page
          router.push('/invite-only');
          return;
        }

        // Invited - allow onboarding to proceed
        setCheckingInvite(false);
      } catch (error) {
        console.error('Error checking invite status:', error);
        // On error, redirect to invite-only to be safe
        router.push('/invite-only');
      }
    };

    checkInviteStatus();
  }, [user, router]);

  // Start onboarding
  useEffect(() => {
    if (checkingInvite) return;
    
    setTimeout(() => {
      typeText("Hi! I'm Navia 💛\n\nWhat should I call you?");
      setMode('name');
      // Show skip option after 10 seconds if user hasn't engaged
      setTimeout(() => setShowSkipOption(true), 10000);
    }, 1500);
  }, [checkingInvite]);

  // Log canFinish state changes
  useEffect(() => {
    if (canFinish) {
      console.log('🟢 Finish button is NOW VISIBLE (canFinish=true, questionCount=' + questionCount + ')');
    } else {
      console.log('⏳ Finish button hidden (canFinish=false, questionCount=' + questionCount + ')');
    }
  }, [canFinish, questionCount]);

  // Smooth typing effect
  const typeText = async (text: string) => {
    setIsTyping(true);
    setCurrentText('');
    
    for (let i = 0; i < text.length; i++) {
      setCurrentText(text.slice(0, i + 1));
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    setIsTyping(false);
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const name = nameInput.trim();
    console.log('👤 Name submitted:', name);
    setUserName(name);
    setUserResponses([name]);
    
    // Go straight to chat mode with first question
    setMode('chat');
    setQuestionCount(1); // Start at question 1
    console.log('💬 Switching to chat mode, starting at question 1');
    
    const firstQuestion = `Thanks, ${name}! Just so I can support you better, do you identify as having ADHD, autism, both, or something else?`;
    
    // Initialize conversation history
    setConversationHistory([
      { role: 'user', content: name },
      { role: 'assistant', content: firstQuestion }
    ]);
    console.log('📝 Conversation history initialized');
    
    await typeText(firstQuestion);
  };

  // Removed handleChatChoice and handleVoiceChoice - going straight to chat after name

  // Play text using Hume TTS
  const playTTS = async (text: string) => {
    try {
      console.log('🔊 Preparing to speak...');
      setIsPreparingToSpeak(true);
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
        setIsPreparingToSpeak(false);
        setIsPlayingAudio(false);
        return;
      }

      const data = await response.json();
      
      if (!data.success || !data.audio) {
        setIsPreparingToSpeak(false);
        setIsPlayingAudio(false);
        return;
      }

      console.log('🔊 Audio ready, playing...');
      setIsPreparingToSpeak(false);

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
        console.log('🔊 Audio finished');
        setIsPlayingAudio(false);
      };
      await audioRef.current.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsPreparingToSpeak(false);
      setIsPlayingAudio(false);
    }
  };

  // Handle voice recording with live speech recognition
  const startVoiceRecording = async () => {
    try {
      console.log('🎤 Starting voice recording...');
      
      // Check if speech recognition is available
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in your browser. Please use Chrome.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Allow continuous recording
      recognition.interimResults = true; // Show interim results
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;

      recognition.onstart = () => {
        console.log('🎤 Speech recognition started - speak now!');
        setIsRecording(true);
      };

      let finalTranscript = '';
      
      recognition.onresult = async (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            console.log('✅ Final transcript:', finalTranscript);
          } else {
            interimTranscript += transcript;
            console.log('⏳ Interim:', interimTranscript);
          }
        }
        
        // Show interim results in UI
        if (interimTranscript) {
          setCurrentText(`Listening: "${interimTranscript}..."`);
        }
      };
      
      recognition.onend = async () => {
        console.log('🎤 Speech recognition ended');
        setIsRecording(false);
        
        if (finalTranscript.trim()) {
          console.log('📝 Processing final transcript:', finalTranscript);
          await processTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'no-speech') {
          typeText("I didn't hear anything. Could you try again?");
        }
      };

      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Could not start speech recognition. Please check permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current && isRecording) {
      console.log('🛑 Stopping speech recognition...');
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process transcript and get AI response
  const processTranscript = async (transcript: string) => {
    console.log('🎤 Processing transcript:', transcript);
    setIsLoading(true);

    try {
      if (!transcript || transcript.trim().length === 0) {
        console.log('❌ Empty transcript');
        await typeText("I didn't catch that. Could you try again?");
        playTTS("I didn't catch that. Could you try again?");
        setIsLoading(false);
        return;
      }

      const newResponses = [...userResponses, transcript];
      setUserResponses(newResponses);
      setQuestionCount(prev => prev + 1);
      console.log('📝 User responses:', newResponses);
      console.log('📊 Question count:', questionCount + 1);

      // Detect emotions from text
      try {
        const emotionResponse = await fetch('/api/emotion-detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: transcript }),
        });
        
        if (emotionResponse.ok) {
          const emotions = await emotionResponse.json();
          setCurrentEmotion(emotions.topEmotion);
        }
      } catch (error) {
        console.log('Emotion detection unavailable');
      }

      // Build proper conversation history with all previous exchanges
      const messages = [...conversationHistory, { role: 'user', content: transcript }];

      // Get AI response
      const response = await fetch('/api/onboarding-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      setIsTyping(true);
      setCurrentText('');

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              aiResponse += parsed.content;
              setCurrentText(aiResponse);
            } catch (e) {
              // Ignore
            }
          }
        }
      }

      setIsTyping(false);

      // Store conversation history
      const newHistory = [...conversationHistory, 
        { role: 'user' as const, content: transcript },
        { role: 'assistant' as const, content: aiResponse }
      ];
      setConversationHistory(newHistory);

      // Enable finish button after 4 questions minimum
      if (questionCount + 1 >= 4 && !canFinish) {
        console.log('✅ [VOICE] Enabling finish button (4+ questions answered)');
        setCanFinish(true);
      }

      // Wait for COMPLETE response, then play audio
      console.log('📝 Full response received:', aiResponse);
      playTTS(aiResponse);

      // Check if AI is asking if user wants to continue or go to dashboard
      const lowerResponse = aiResponse.toLowerCase();
      const offeringChoice = 
        lowerResponse.includes('dashboard') && 
        (lowerResponse.includes('continue') || lowerResponse.includes('ready') || lowerResponse.includes('dive in'));
      
      if (offeringChoice) {
        setCanFinish(true);
      }

      // Check if AI is explicitly finishing (VOICE MODE)
      console.log('🔍 [VOICE] Checking completion. Response:', lowerResponse.substring(0, 100));
      const wantsToFinish = 
        lowerResponse.includes('setting up your dashboard') ||
        lowerResponse.includes("let's do this together") ||
        lowerResponse.includes('perfect! i\'m setting up') ||
        lowerResponse.includes('see you in your dashboard') ||
        lowerResponse.includes('perfect! see you');
      
      console.log('🔍 [VOICE] wantsToFinish:', wantsToFinish);
      
      if (wantsToFinish) {
        console.log('✅ [VOICE] AI indicated completion, saving and redirecting...');
        await saveUserContext();
        setTimeout(() => {
          console.log('🚀 [VOICE] Redirecting to dashboard...');
          router.push('/dashboard-new');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Voice processing error:', error);
      await typeText("I'm having trouble connecting. Let's try that again!");
      playTTS("I'm having trouble connecting. Let's try that again!");
    } finally {
      console.log('✅ Resetting isLoading to false');
      setIsLoading(false);
    }
  };


  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const userMessage = chatInput.trim();
    console.log('💬 User message:', userMessage);
    setChatInput('');
    setUserResponses([...userResponses, userMessage]);
    setQuestionCount(prev => prev + 1);
    setIsLoading(true);
    console.log('📊 Question count:', questionCount + 1);
    console.log('📝 Current conversation history length:', conversationHistory.length);

    // Detect emotions
    try {
      const emotionResponse = await fetch('/api/emotion-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage }),
      });
      
      if (emotionResponse.ok) {
        const emotions = await emotionResponse.json();
        setCurrentEmotion(emotions.topEmotion);
      }
    } catch (error) {
      console.log('Emotion detection unavailable');
    }

    // Get AI response
    try {
      // Build proper conversation history with all previous exchanges
      const messages = [...conversationHistory, { role: 'user', content: userMessage }];
      
      const response = await fetch('/api/onboarding-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      setIsTyping(true);
      setCurrentText('');

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              aiResponse += parsed.content;
              setCurrentText(aiResponse);
            } catch (e) {
              // Ignore
            }
          }
        }
      }

      setIsTyping(false);

      // Store conversation history
      const newHistory = [...conversationHistory,
        { role: 'user' as const, content: userMessage },
        { role: 'assistant' as const, content: aiResponse }
      ];
      setConversationHistory(newHistory);

      // Enable finish button after 4 questions minimum
      if (questionCount + 1 >= 4 && !canFinish) {
        console.log('✅ [CHAT] Enabling finish button (4+ questions answered)');
        setCanFinish(true);
      }

      // Check if AI is asking if user wants to continue or go to dashboard
      const lowerResponse = aiResponse.toLowerCase();
      const offeringChoice = 
        lowerResponse.includes('dashboard') && 
        (lowerResponse.includes('continue') || lowerResponse.includes('ready') || lowerResponse.includes('dive in'));
      
      if (offeringChoice) {
        setCanFinish(true);
      }

      // Check if AI is explicitly finishing (CHAT MODE)
      console.log('🔍 [CHAT] Checking completion. Response:', lowerResponse.substring(0, 100));
      const wantsToFinish = 
        lowerResponse.includes('setting up your dashboard') ||
        lowerResponse.includes("let's do this together") ||
        lowerResponse.includes('perfect! i\'m setting up') ||
        lowerResponse.includes('see you in your dashboard') ||
        lowerResponse.includes('perfect! see you');
      
      console.log('🔍 [CHAT] wantsToFinish:', wantsToFinish);
      
      if (wantsToFinish) {
        console.log('✅ [CHAT] AI indicated completion, saving and redirecting...');
        await saveUserContext();
        setTimeout(() => {
          console.log('🚀 [CHAT] Redirecting to dashboard...');
          router.push('/dashboard-new');
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      await typeText("I'm having trouble connecting. Let's try that again!");
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserContext = async () => {
    try {
      console.log('💾 Saving onboarding context...');
      const response = await fetch('/api/save-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          responses: userResponses,
          preferredMode: mode,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save onboarding');
      }
      
      console.log('✅ Onboarding context saved');
      return true;
    } catch (error) {
      console.error('Failed to save context:', error);
      // Continue to dashboard anyway - don't block user
      return false;
    }
  };

  const handleFinishOnboarding = async () => {
    console.log('🎉 ========================================');
    console.log('🎉 USER CLICKED FINISH BUTTON');
    console.log('🎉 ========================================');
    console.log('💾 Saving user context...');
    await saveUserContext();
    console.log('✅ Context saved, setting tutorial flag...');
    localStorage.setItem('navia-show-tutorial', 'true');
    console.log('🚀 Pushing to /dashboard-new...');
    router.push('/dashboard-new');
    console.log('✅ Router.push called');
  };

  // Show loading screen while checking invite
  if (checkingInvite) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--clay-500)] mb-4" />
        <p className="text-[var(--charcoal)]/70 text-lg">Checking access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] flex flex-col items-center justify-center p-4 sm:p-8 overflow-x-hidden relative">
      {/* Progress Indicator - Top of screen */}
      {mode === 'chat' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl border-2 border-[var(--sage-400)] shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${
                      i <= questionCount
                        ? 'bg-[var(--sage-600)] scale-110'
                        : 'bg-[var(--sage-200)]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-[var(--sage-700)]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                Question {questionCount} of 4-5
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Skip option removed from top-right - only showing in chat input area */}

      <div className="w-full max-w-4xl flex flex-col items-center space-y-6">
        {/* Large Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-shrink-0"
        >
          <NaviaAvatar isSpeaking={isTyping} isThinking={isLoading} size="lg" />
        </motion.div>

        {/* Title */}
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--charcoal)] text-center" 
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          Navia
        </h1>

        {/* Emotion indicator */}
        {currentEmotion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-[var(--sage-600)]"
          >
            Sensing: {currentEmotion}
          </motion.div>
        )}

        {/* Preparing to speak indicator */}
        {isPreparingToSpeak && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[var(--sage-600)] text-sm flex items-center gap-2 justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-[var(--sage-600)] rounded-full"
            />
            Preparing to speak...
          </motion.div>
        )}

        {/* Navia Thinking - Shows while AI is processing */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gradient-to-b from-[var(--cream)] to-[var(--sand)]/50 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center"
              >
                {/* Navia Avatar with Breathing Animation */}
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1.08, 1],
                  }}
                  transition={{
                    duration: 6, // Slower, calmer breathing
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="mb-6"
                >
                  <NaviaAvatar size="xl" isThinking={true} />
                </motion.div>
                
                {/* Simple Status Text */}
                <motion.p 
                  className="text-lg sm:text-xl text-[var(--sage-700)]" 
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                  animate={{
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Thinking...
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typing Indicator - Shows when Navia is typing */}
        {isTyping && !currentText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-2xl min-h-[100px] flex flex-col items-center justify-center px-4"
          >
            <div className="bg-[var(--sand)]/80 backdrop-blur-sm px-6 sm:px-8 py-5 sm:py-6 rounded-3xl border border-[var(--clay-300)]/30 shadow-lg">
              <div className="flex gap-2 items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  className="w-3 h-3 bg-[var(--clay-500)] rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-3 h-3 bg-[var(--clay-500)] rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-3 h-3 bg-[var(--clay-500)] rounded-full"
                />
              </div>
              <p className="text-sm text-[var(--sage-600)] mt-3 text-center" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                Navia is typing...
              </p>
            </div>
          </motion.div>
        )}

        {/* Streaming Text - No bubbles, just text */}
        {!isLoading && currentText && (
          <motion.div
            ref={textRef}
            className="w-full max-w-2xl min-h-[100px] px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p 
              className="text-lg sm:text-xl md:text-2xl text-center text-[var(--charcoal)] leading-relaxed whitespace-pre-line break-words"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              {currentText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-0.5 h-5 sm:h-6 bg-[var(--clay-500)] ml-1 align-middle"
                />
              )}
            </p>
          </motion.div>
        )}

        {/* Name Input */}
        {mode === 'name' && !isTyping && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleNameSubmit}
            className="w-full max-w-xl px-4"
          >
            <div className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name..."
                autoFocus
                className="flex-1 bg-white border-2 border-[var(--clay-400)] rounded-full px-4 sm:px-8 py-3 sm:py-4 text-base sm:text-xl text-center text-[var(--charcoal)] placeholder-[var(--sage-500)] focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)] shadow-sm"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              />
              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="bg-[var(--clay-500)] text-white rounded-full px-4 sm:px-8 py-3 sm:py-4 hover:bg-[var(--clay-600)] transition-all disabled:opacity-50 shadow-md flex-shrink-0"
              >
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </motion.form>
        )}

        {/* Choice buttons removed - going straight to chat */}

        {/* Chat Input */}
        {mode === 'chat' && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl space-y-3 px-4"
          >
            <form onSubmit={handleChatSubmit} className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                autoFocus
                className="flex-1 bg-white border-2 border-[var(--clay-400)] rounded-full px-4 sm:px-8 py-3 sm:py-4 text-base sm:text-lg text-[var(--charcoal)] placeholder-[var(--sage-500)] focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)] disabled:opacity-50 shadow-sm"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              />
              <button
                type="submit"
                disabled={isLoading || !chatInput.trim()}
                className="bg-[var(--clay-500)] text-white rounded-full p-3 sm:p-4 hover:bg-[var(--clay-600)] transition-all disabled:opacity-50 shadow-md flex-shrink-0"
              >
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </form>
            {canFinish && (
              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    console.log('🔘 Finish button clicked!');
                    handleFinishOnboarding();
                  }}
                  className="bg-[var(--clay-500)] text-white px-6 py-2 rounded-full text-sm hover:bg-[var(--clay-600)] transition-all shadow-md"
                >
                  I'm ready → Go to Dashboard
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Voice mode removed for simplicity - keeping it text-based */}
      </div>
    </div>
  );
}
