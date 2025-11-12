'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles, Target, Zap, Heart, Focus, CheckCircle } from 'lucide-react';
import NaviaLogo from '@/components/branding/NaviaLogo';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  icon: React.ReactNode;
  highlightColor: string;
  action?: string;
}

interface DashboardTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  variant?: 'bento' | 'new';
}

export default function DashboardTutorial({ isOpen, onClose, onComplete, variant = 'new' }: DashboardTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Tutorial steps for DashboardNew
  const tutorialStepsNew: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Navia! 💛',
      description: "I'm here to help you manage tasks without feeling overwhelmed. Let me show you how each section works to support you.",
      targetSelector: '',
      position: 'center',
      icon: <Sparkles className="w-6 h-6" />,
      highlightColor: 'from-purple-400 to-purple-600',
    },
    {
      id: 'focus-section',
      title: "Today's Focus",
      description: "This is your main workspace. I've prioritized your tasks using AI based on urgency, energy needed, and your goals. Filter by career, finance, or daily life tasks.",
      targetSelector: '[data-tutorial="focus-section"]',
      position: 'bottom',
      icon: <Target className="w-6 h-6" />,
      highlightColor: 'from-clay-400 to-clay-600',
      action: 'Click on tasks to mark them complete',
    },
    {
      id: 'quick-wins',
      title: 'Smart Task Selection',
      description: "I analyze your tasks and show you the easiest ones to start with. These 'quick wins' help build momentum when you're feeling stuck or overwhelmed.",
      targetSelector: '[data-tutorial="quick-wins"]',
      position: 'top',
      icon: <Zap className="w-6 h-6" />,
      highlightColor: 'from-sage-400 to-sage-600',
      action: 'Start with these when energy is low',
    },
    {
      id: 'stats',
      title: 'Your Progress',
      description: "Track your daily completion rate and see how you're doing. Remember: progress over perfection. Every small step counts.",
      targetSelector: '[data-tutorial="stats"]',
      position: 'left',
      icon: <Zap className="w-6 h-6" />,
      highlightColor: 'from-blue-400 to-blue-600',
    },
    {
      id: 'calm-space',
      title: 'Calm Space',
      description: "Feeling overwhelmed? Use this breathing exercise to reset. It's designed for neurodivergent minds to help you refocus and reduce anxiety.",
      targetSelector: '[data-tutorial="calm-space"]',
      position: 'left',
      icon: <Heart className="w-6 h-6" />,
      highlightColor: 'from-pink-400 to-pink-600',
      action: 'Take a break whenever you need',
    },
    {
      id: 'ai-insight',
      title: 'AI Support',
      description: "I provide personalized encouragement and insights based on your progress. I'm here to support you, not pressure you.",
      targetSelector: '[data-tutorial="ai-insight"]',
      position: 'left',
      icon: <Sparkles className="w-6 h-6" />,
      highlightColor: 'from-purple-400 to-purple-600',
    },
    {
      id: 'goal-progress',
      title: 'Goal Tracking',
      description: "See your long-term progress with AI-powered predictions. I estimate completion times based on your actual pace, not unrealistic expectations.",
      targetSelector: '[data-tutorial="goal-progress"]',
      position: 'top',
      icon: <Target className="w-6 h-6" />,
      highlightColor: 'from-green-400 to-green-600',
    },
  ];

  // Tutorial steps for DashboardBento
  const tutorialStepsBento: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome! I am Navia 💛',
      description: "I am here to help you succeed. Let me show you how each section supports you where you are right now.",
      targetSelector: '',
      position: 'center',
      icon: <Sparkles className="w-6 h-6" />,
      highlightColor: 'from-purple-400 to-purple-600',
    },
    {
      id: 'navia-avatar',
      title: 'Click Me Anytime 💬',
      description: "See me here? Click on me whenever you need help! I can break down overwhelming tasks, provide encouragement, or just listen. I am always here for you.",
      targetSelector: '[data-tutorial="navia-avatar"]',
      position: 'bottom',
      icon: <Sparkles className="w-6 h-6" />,
      highlightColor: 'from-purple-400 to-purple-600',
      action: 'Click me when you need support',
    },
    {
      id: 'tasks',
      title: 'Your Task List 📝',
      description: "Add your tasks here and I will help you manage them. Feeling overwhelmed? Click 'Break down' and I will split it into smaller, manageable steps for you.",
      targetSelector: '[data-tutorial="tasks"]',
      position: 'right',
      icon: <CheckCircle className="w-6 h-6" />,
      highlightColor: 'from-clay-400 to-clay-600',
      action: 'I can break down any task for you',
    },
    {
      id: 'energy-level',
      title: 'How Are You Feeling? 💚',
      description: "Tell me your energy level today. I will adjust my support and suggestions based on how you are feeling. Low energy? That is completely okay - I will help you find easier tasks.",
      targetSelector: '[data-tutorial="energy-level"]',
      position: 'left',
      icon: <Heart className="w-6 h-6" />,
      highlightColor: 'from-sage-400 to-sage-600',
      action: 'Be honest - I adapt to you',
    },
    {
      id: 'support-level',
      title: 'How Much Support? 🤝',
      description: "Tell me how much guidance you need. Want detailed steps? I will give you maximum support. Prefer independence? I will step back. I adapt to you.",
      targetSelector: '[data-tutorial="support-level"]',
      position: 'right',
      icon: <Target className="w-6 h-6" />,
      highlightColor: 'from-blue-400 to-blue-600',
      action: 'Choose what works for you',
    },
    {
      id: 'focus-mode',
      title: 'Focus With Me 🎯',
      description: "When you are ready, start a focus session. I will stay with you the whole time with calming music. No pressure, just support.",
      targetSelector: '[data-tutorial="focus-mode"]',
      position: 'right',
      icon: <Focus className="w-6 h-6" />,
      highlightColor: 'from-pink-400 to-pink-600',
      action: 'Start when you are ready',
    },
    {
      id: 'complete',
      title: "You are All Set! 🎉",
      description: "Remember: You are not alone. I am here to help you succeed at your own pace. Progress over perfection, always. 💛",
      targetSelector: '',
      position: 'center',
      icon: <Sparkles className="w-6 h-6" />,
      highlightColor: 'from-green-400 to-green-600',
    },
  ];

  const steps = variant === 'bento' ? tutorialStepsBento : tutorialStepsNew;
  const currentStepData = steps[currentStep];

  // Update target element and position when step changes
  useEffect(() => {
    if (!isOpen || !currentStepData) return;

    if (currentStepData.targetSelector) {
      const element = document.querySelector(currentStepData.targetSelector) as HTMLElement;
      
      if (element) {
        setTargetElement(element);
        
        // Scroll element into view first
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Wait for scroll to complete before calculating position
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

          // Calculate tooltip position based on target position
          let top = 0;
          let left = 0;

          switch (currentStepData.position) {
            case 'top':
              top = rect.top + scrollTop - 20;
              left = rect.left + scrollLeft + rect.width / 2;
              break;
            case 'bottom':
              top = rect.bottom + scrollTop + 20;
              left = rect.left + scrollLeft + rect.width / 2;
              break;
            case 'left':
              top = rect.top + scrollTop + rect.height / 2;
              left = rect.left + scrollLeft - 20;
              break;
            case 'right':
              top = rect.top + scrollTop + rect.height / 2;
              left = rect.right + scrollLeft + 20;
              break;
          }

          // Constrain to viewport
          const maxTop = window.innerHeight + scrollTop - 400; // Leave room for card
          const maxLeft = window.innerWidth + scrollLeft - 400;
          
          top = Math.max(scrollTop + 100, Math.min(top, maxTop));
          left = Math.max(scrollLeft + 20, Math.min(left, maxLeft));

          setTooltipPosition({ top, left });
        }, 500);
      } else {
        setTargetElement(null);
      }
    } else {
      setTargetElement(null);
    }
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen || !currentStepData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark overlay that will be behind the cutout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 z-[9998]"
            onClick={handleSkip}
            style={{
              clipPath: targetElement
                ? `polygon(
                    0 0,
                    100% 0,
                    100% 100%,
                    0 100%,
                    0 0,
                    ${targetElement.getBoundingClientRect().left - 12}px ${targetElement.getBoundingClientRect().top - 12}px,
                    ${targetElement.getBoundingClientRect().left - 12}px ${targetElement.getBoundingClientRect().bottom + 12}px,
                    ${targetElement.getBoundingClientRect().right + 12}px ${targetElement.getBoundingClientRect().bottom + 12}px,
                    ${targetElement.getBoundingClientRect().right + 12}px ${targetElement.getBoundingClientRect().top - 12}px,
                    ${targetElement.getBoundingClientRect().left - 12}px ${targetElement.getBoundingClientRect().top - 12}px
                  )`
                : 'none',
            }}
          />

          {/* Highlight glow on target element - no border to avoid double frame */}
          {targetElement && (
            <>
              {/* Pulsing glow animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                exit={{ opacity: 0 }}
                className="fixed z-[10000] pointer-events-none"
                style={{
                  top: targetElement.getBoundingClientRect().top + window.pageYOffset,
                  left: targetElement.getBoundingClientRect().left + window.pageXOffset,
                  width: targetElement.offsetWidth,
                  height: targetElement.offsetHeight,
                  borderRadius: '1.5rem',
                  boxShadow: '0 0 0 4px rgba(196, 165, 116, 0.6), 0 0 40px 8px rgba(196, 165, 116, 0.4)',
                }}
              />
            </>
          )}

          {/* Tutorial Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed z-[10001] max-w-[90vw] sm:max-w-md ${
              currentStepData.position === 'center'
                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                : ''
            }`}
            style={
              currentStepData.position !== 'center'
                ? {
                    top: tooltipPosition.top,
                    left: tooltipPosition.left,
                    transform:
                      currentStepData.position === 'left'
                        ? 'translate(calc(-100% - 50px), -50%)'
                        : currentStepData.position === 'right'
                        ? 'translate(50px, -50%)'
                        : currentStepData.position === 'top'
                        ? 'translate(-50%, calc(-100% - 50px))'
                        : 'translate(-50%, 50px)',
                  }
                : {}
            }
          >
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-[var(--clay-200)] p-6 max-w-md w-[90vw] sm:w-full">
              {/* Close button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 text-[var(--charcoal)]/60 hover:text-[var(--charcoal)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Navia Logo */}
              <NaviaLogo size="md" className="mb-4" />

              {/* Content */}
              <h3 className="text-2xl font-bold text-[var(--charcoal)] mb-3" style={{ fontFamily: 'var(--font-fraunces)' }}>
                {currentStepData.title}
              </h3>
              <p className="text-[var(--charcoal)]/80 mb-4 leading-relaxed">{currentStepData.description}</p>

              {/* Action hint */}
              {currentStepData.action && (
                <div className="bg-[var(--sage-100)] border border-[var(--sage-300)] rounded-lg p-3 mb-4">
                  <p className="text-sm text-[var(--sage-800)] font-semibold">💡 {currentStepData.action}</p>
                </div>
              )}

              {/* Progress */}
              <div className="flex items-center gap-2 mb-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-gradient-to-r ' + currentStepData.highlightColor
                        : index < currentStep
                        ? 'bg-[var(--sage-400)]'
                        : 'bg-[var(--clay-200)]'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-4 py-2 text-[var(--charcoal)] hover:bg-[var(--sand)] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-semibold">Back</span>
                </button>

                <span className="text-sm text-[var(--charcoal)]/60 font-medium">
                  {currentStep + 1} of {steps.length}
                </span>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[var(--clay-500)] to-[var(--clay-600)] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  <span>{currentStep === steps.length - 1 ? "Let's Go!" : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Skip option */}
              {currentStep < steps.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="w-full mt-3 text-sm text-[var(--charcoal)]/60 hover:text-[var(--charcoal)] transition-colors"
                >
                  Skip tutorial
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
