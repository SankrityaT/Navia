'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import NaviaAvatar from '@/components/ai/NaviaAvatar';
import { MessageCircle, Mic, Send, Volume2 } from 'lucide-react';

type OnboardingMode = 'initial' | 'name' | 'choice' | 'chat' | 'voice';

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
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPreparingToSpeak, setIsPreparingToSpeak] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Start onboarding
  useEffect(() => {
    setTimeout(() => {
      typeText("Hi! I'm Navia 💛\n\nWhat should I call you?");
      setMode('name');
    }, 1500);
  }, []);

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

    setUserName(nameInput.trim());
    setUserResponses([nameInput.trim()]);
    
    await typeText(`Nice to meet you, ${nameInput.trim()}! 😊\n\nHow would you like to continue?`);
    setMode('choice');
  };

  const handleChatChoice = async () => {
    setMode('chat');
    await typeText(`Great! Let's chat. What do you need most help with right now?`);
  };

  const handleVoiceChoice = async () => {
    setMode('voice');
    await typeText(`Perfect! I'll speak to you. Click the microphone when you're ready to talk.`);
    
    // Play welcome audio
    await playTTS(`Perfect! I'll speak to you. Click the microphone when you're ready to talk.`);
  };

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

      // Build full conversation history
      const conversationMessages = [];
      
      // Add all previous exchanges
      for (let i = 0; i < newResponses.length - 1; i++) {
        conversationMessages.push({ role: 'user', content: newResponses[i] });
        // Add a placeholder for AI responses (we don't store them, but AI needs context)
        if (i === 0) {
          conversationMessages.push({ role: 'assistant', content: `Thanks, ${userName}! What do you need most help with right now?` });
        } else if (i === 1) {
          conversationMessages.push({ role: 'assistant', content: `I hear you. What time of day feels hardest for you?` });
        } else if (i === 2) {
          conversationMessages.push({ role: 'assistant', content: `That makes sense. What would help you feel most successful?` });
        }
      }
      
      // Add current response
      conversationMessages.push({ role: 'user', content: transcript });

      // Get AI response
      const response = await fetch('/api/onboarding-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationMessages,
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

      // Wait for COMPLETE response, then play audio
      console.log('📝 Full response received:', aiResponse);
      playTTS(aiResponse);

      // Enable finish button after 3 questions minimum
      if (questionCount + 1 >= 3) {
        setCanFinish(true);
      }

      // Auto-complete after 6 questions to prevent infinite loop
      if (questionCount + 1 >= 6) {
        console.log('✅ Auto-completing onboarding after 6 questions');
        await saveUserContext();
        setTimeout(() => {
          router.push('/dashboard-new');
        }, 3000);
        return;
      }

      // Check if AI is explicitly finishing
      const lowerResponse = aiResponse.toLowerCase();
      const wantsToFinish = 
        lowerResponse.includes('setting up your dashboard') ||
        lowerResponse.includes("let's do this together") ||
        lowerResponse.includes('perfect! i\'m setting up');
      
      if (wantsToFinish) {
        await saveUserContext();
        setTimeout(() => {
          router.push('/dashboard-new');
        }, 3000);
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
    setChatInput('');
    setUserResponses([...userResponses, userMessage]);
    setQuestionCount(prev => prev + 1);
    setIsLoading(true);
    console.log('📊 Question count:', questionCount + 1);

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
      const response = await fetch('/api/onboarding-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: `My name is ${userName}` },
            { role: 'user', content: userMessage },
          ],
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

      // Enable finish button after 3 questions minimum
      if (questionCount + 1 >= 3) {
        setCanFinish(true);
      }

      // Auto-complete after 6 questions to prevent infinite loop
      if (questionCount + 1 >= 6) {
        console.log('✅ Auto-completing onboarding after 6 questions');
        await saveUserContext();
        setTimeout(() => {
          router.push('/dashboard-new');
        }, 3000);
        return;
      }

      // Check if AI is explicitly finishing
      const lowerResponse = aiResponse.toLowerCase();
      const wantsToFinish = 
        lowerResponse.includes('setting up your dashboard') ||
        lowerResponse.includes("let's do this together") ||
        lowerResponse.includes('perfect! i\'m setting up');
      
      if (wantsToFinish) {
        await saveUserContext();
        setTimeout(() => {
          router.push('/dashboard-new');
        }, 3000);
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
      // Save to Supabase and Pinecone
      await fetch('/api/save-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          responses: userResponses,
          preferredMode: mode,
        }),
      });
      console.log('✅ Onboarding context saved');
    } catch (error) {
      console.error('Failed to save context:', error);
    }
  };

  const handleFinishOnboarding = async () => {
    console.log('🎉 User manually finishing onboarding');
    await saveUserContext();
    router.push('/dashboard-new');
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Large Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <NaviaAvatar isSpeaking={isTyping} isThinking={isLoading} size="lg" />
        </motion.div>

        {/* Title */}
        <h1 
          className="text-6xl font-bold text-[var(--charcoal)] text-center mb-4" 
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          Navia
        </h1>

        {/* Emotion indicator */}
        {currentEmotion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm text-[var(--sage-600)] mb-6"
          >
            Sensing: {currentEmotion}
          </motion.div>
        )}

        {/* Preparing to speak indicator */}
        {isPreparingToSpeak && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[var(--sage-600)] text-sm mb-4 flex items-center gap-2 justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-[var(--sage-600)] rounded-full"
            />
            Preparing to speak...
          </motion.div>
        )}

        {/* Loading Screen - Shows while AI is thinking */}
        {isLoading && !isTyping && !currentText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-2xl mb-8 min-h-[120px] flex flex-col items-center justify-center"
          >
            <div className="flex gap-2 mb-4">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-3 h-3 bg-[var(--clay-500)] rounded-full"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="w-3 h-3 bg-[var(--clay-500)] rounded-full"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="w-3 h-3 bg-[var(--clay-500)] rounded-full"
              />
            </div>
            <p className="text-lg text-[var(--sage-600)]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              Thinking...
            </p>
          </motion.div>
        )}

        {/* Streaming Text - No bubbles, just text */}
        {!isLoading && (
          <motion.div
            ref={textRef}
            className="w-full max-w-2xl mb-8 min-h-[120px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p 
              className="text-2xl text-center text-[var(--charcoal)] leading-relaxed whitespace-pre-line"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              {currentText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-1 h-6 bg-[var(--clay-500)] ml-1"
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
            className="w-full max-w-xl"
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name..."
                autoFocus
                className="flex-1 bg-white border-2 border-[var(--clay-400)] rounded-full px-8 py-4 text-xl text-center text-[var(--charcoal)] placeholder-[var(--sage-500)] focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)] shadow-sm"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              />
              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="bg-[var(--clay-500)] text-white rounded-full px-8 py-4 hover:bg-[var(--clay-600)] transition-all disabled:opacity-50 shadow-md"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </motion.form>
        )}

        {/* Choice Buttons */}
        {mode === 'choice' && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-6"
          >
            <button
              onClick={handleChatChoice}
              className="flex flex-col items-center gap-4 bg-white hover:bg-[var(--sand)] border-2 border-[var(--clay-400)] rounded-3xl p-8 transition-all shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="w-16 h-16 text-[var(--clay-500)]" />
              <span className="text-xl font-semibold text-[var(--charcoal)]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                Chat with me
              </span>
            </button>

            <button
              onClick={handleVoiceChoice}
              className="flex flex-col items-center gap-4 bg-white hover:bg-[var(--sand)] border-2 border-[var(--sage-600)] rounded-3xl p-8 transition-all shadow-lg hover:shadow-xl"
            >
              <Volume2 className="w-16 h-16 text-[var(--sage-600)]" />
              <span className="text-xl font-semibold text-[var(--charcoal)]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                Talk with me
              </span>
            </button>
          </motion.div>
        )}

        {/* Chat Input */}
        {mode === 'chat' && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl space-y-3"
          >
            <form onSubmit={handleChatSubmit} className="flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                autoFocus
                className="flex-1 bg-white border-2 border-[var(--clay-400)] rounded-full px-8 py-4 text-lg text-[var(--charcoal)] placeholder-[var(--sage-500)] focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)] disabled:opacity-50 shadow-sm"
                style={{ fontFamily: 'var(--font-dm-sans)' }}
              />
              <button
                type="submit"
                disabled={isLoading || !chatInput.trim()}
                className="bg-[var(--clay-500)] text-white rounded-full p-4 hover:bg-[var(--clay-600)] transition-all disabled:opacity-50 shadow-md"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setMode('voice')}
                className="text-[var(--sage-600)] hover:text-[var(--sage-700)] text-sm flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Switch to voice
              </button>
              {canFinish && (
                <button
                  onClick={handleFinishOnboarding}
                  className="bg-[var(--clay-500)] text-white px-6 py-2 rounded-full text-sm hover:bg-[var(--clay-600)] transition-all shadow-md"
                >
                  Finish & Go to Dashboard
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Voice Mode */}
        {mode === 'voice' && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <button
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              disabled={isLoading}
              className={`${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-[var(--sage-600)] hover:bg-[var(--sage-700)]'
              } text-white rounded-full p-12 shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50`}
            >
              <Mic className="w-20 h-20" />
            </button>
            <p className="text-lg text-[var(--sage-600)]" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              {isRecording ? '🎤 Listening... Click to stop' : 'Click to start talking'}
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setMode('chat')}
                className="text-[var(--clay-600)] hover:text-[var(--clay-700)] text-sm flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Switch to chat
              </button>
              {canFinish && (
                <button
                  onClick={handleFinishOnboarding}
                  className="bg-[var(--clay-500)] text-white px-6 py-2 rounded-full text-sm hover:bg-[var(--clay-600)] transition-all shadow-md"
                >
                  Finish & Go to Dashboard
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
