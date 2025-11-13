'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';

interface TaskStep {
  stepNumber: number;
  action: string;
  duration: string;
  isComplex: boolean;
  subSteps: string[];
  completed?: boolean;
  subStepsCompleted?: boolean[];
  expanded?: boolean;
}

interface InteractiveBreakdownProps {
  taskName: string;
  breakdown: {
    why: string;
    mainSteps: TaskStep[];
    totalSteps: number;
    totalSubSteps: number;
    encouragement: string;
    energyNote?: string;
  };
  onComplete: () => void;
}

export default function InteractiveBreakdown({
  taskName,
  breakdown,
  onComplete,
}: InteractiveBreakdownProps) {
  const [steps, setSteps] = useState<TaskStep[]>(
    breakdown.mainSteps.map(step => ({
      ...step,
      completed: false,
      subStepsCompleted: step.subSteps.map(() => false),
      expanded: false,
    }))
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentStep = steps[currentStepIndex];
  const completedMainSteps = steps.filter(s => s.completed).length;
  const isLastStep = currentStepIndex === steps.length - 1;
  const allDone = completedMainSteps === steps.length;

  // Calculate total completed sub-steps
  const completedSubSteps = steps.reduce((total, step) => {
    return total + (step.subStepsCompleted?.filter(Boolean).length || 0);
  }, 0);

  const toggleSubSteps = (index: number) => {
    const newSteps = [...steps];
    newSteps[index].expanded = !newSteps[index].expanded;
    setSteps(newSteps);
  };

  const handleSubStepComplete = (mainStepIndex: number, subStepIndex: number) => {
    const newSteps = [...steps];
    if (newSteps[mainStepIndex].subStepsCompleted) {
      newSteps[mainStepIndex].subStepsCompleted![subStepIndex] = true;
      
      // Check if all sub-steps are completed
      const allSubStepsComplete = newSteps[mainStepIndex].subStepsCompleted!.every(Boolean);
      if (allSubStepsComplete) {
        newSteps[mainStepIndex].completed = true;
        
        // Move to next main step if not the last one
        if (mainStepIndex === currentStepIndex && !isLastStep) {
          setCurrentStepIndex(prev => prev + 1);
        } else if (mainStepIndex === currentStepIndex && isLastStep) {
          setShowCelebration(true);
          setTimeout(() => {
            onComplete();
          }, 3000);
        }
      }
      setSteps(newSteps);
    }
  };

  const handleMainStepComplete = () => {
    const newSteps = [...steps];
    newSteps[currentStepIndex].completed = true;
    setSteps(newSteps);

    if (isLastStep) {
      setShowCelebration(true);
      setTimeout(() => {
        onComplete();
      }, 3000);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  // Get encouragement message based on progress
  const getEncouragementMessage = () => {
    if (currentStepIndex === 0) {
      return "Starting is the hardest part. You've got this! 💛";
    } else if (currentStepIndex === 1) {
      return "You started! That was the hardest part - breaking the inertia. Now momentum is on your side.";
    } else if (currentStepIndex === 2) {
      return "Look at you go! You're building momentum now 🌟";
    } else if (currentStepIndex === 3) {
      return "You're doing amazing! Each step makes the next one easier 💛";
    } else if (currentStepIndex >= 4 && currentStepIndex < steps.length / 2) {
      return "You're in the flow now! This is what momentum feels like ✨";
    } else if (currentStepIndex === Math.floor(steps.length / 2)) {
      return "Halfway there! You're crushing this! 🎉";
    } else if (currentStepIndex > steps.length / 2 && currentStepIndex < steps.length - 2) {
      return "More than halfway! Your momentum is unstoppable now 🚀";
    } else if (currentStepIndex === steps.length - 2) {
      return "Almost there! Just one more after this! 🌟";
    } else if (currentStepIndex === steps.length - 1) {
      return "Final step! You're about to finish something you started! 🏆";
    }
    return "You're doing great! Keep that momentum going 💛";
  };

  return (
    <div className="flex gap-8 w-full max-w-5xl relative items-stretch">
      {/* Close Button - Top Right */}
      <button
        onClick={onComplete}
        className="absolute -top-4 -right-4 z-50 bg-[var(--charcoal)] hover:bg-[var(--charcoal)]/80 text-white rounded-full p-3 transition-all shadow-lg hover:shadow-xl"
        aria-label="Close breakdown"
        title="Close"
      >
        <X className="w-6 h-6" strokeWidth={2.5} />
      </button>
      {/* Left: Current Step */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <AnimatePresence mode="wait">
          {!allDone ? (
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              {/* Progress */}
              <p className="text-lg text-[var(--sage-600)]">
                Main Step {currentStepIndex + 1} of {steps.length}
              </p>

              {/* Current Step */}
              <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border-2 border-[var(--clay-300)] shadow-lg">
                <p className="text-3xl text-[var(--charcoal)] leading-relaxed mb-2" style={{ fontFamily: 'var(--font-dm-sans)' }}>
                  {currentStep?.action}
                </p>
                <p className="text-lg text-[var(--sage-600)]">
                  ⏱️ {currentStep?.duration}
                </p>
              </div>

              {/* Sub-steps if complex */}
              {currentStep?.isComplex && currentStep.subSteps.length > 0 && (
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border-2 border-[var(--sage-300)]">
                  <div className="mb-4">
                    <p className="text-base font-bold text-[var(--charcoal)]">Break it down:</p>
                    <p className="text-sm text-[var(--sage-700)] font-medium mt-1">Check off each micro-step as you go 💛</p>
                  </div>
                  <div className="space-y-2">
                    {currentStep.subSteps.map((subStep, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                          currentStep.subStepsCompleted?.[idx]
                            ? 'bg-[var(--sage-100)] border border-[var(--sage-400)]'
                            : 'bg-white/50 border border-[var(--sage-200)]'
                        }`}
                      >
                        <button
                          onClick={() => handleSubStepComplete(currentStepIndex, idx)}
                          disabled={currentStep.subStepsCompleted?.[idx]}
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all border-2 ${
                            currentStep.subStepsCompleted?.[idx]
                              ? 'bg-[var(--sage-600)] border-[var(--sage-600)] cursor-default'
                              : 'bg-white border-[var(--clay-400)] hover:border-[var(--clay-600)] hover:bg-[var(--clay-50)] cursor-pointer shadow-sm hover:shadow-md'
                          }`}
                        >
                          {currentStep.subStepsCompleted?.[idx] && (
                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                          )}
                        </button>
                        <p className={`text-base flex-1 font-medium ${
                          currentStep.subStepsCompleted?.[idx]
                            ? 'line-through text-[var(--sage-600)]'
                            : 'text-[var(--charcoal)]'
                        }`}>
                          {subStep}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Done Button */}
              <motion.button
                onClick={handleMainStepComplete}
                disabled={currentStep?.isComplex && !currentStep.subStepsCompleted?.every(Boolean)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-12 py-6 rounded-full text-2xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 ${
                  currentStep?.isComplex && !currentStep.subStepsCompleted?.every(Boolean)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[var(--clay-500)] to-[var(--clay-600)] text-white'
                }`}
              >
                <Check className="w-8 h-8" strokeWidth={3} />
                {currentStep?.isComplex ? 'All Done!' : 'Done!'}
              </motion.button>

              {/* Navia Encouragement Popup - Compact */}
              <AnimatePresence>
                {currentStepIndex > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="bg-gradient-to-br from-[var(--clay-100)] to-[var(--sage-100)] backdrop-blur-sm rounded-2xl p-4 border-2 border-[var(--clay-300)] shadow-xl max-w-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.15, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="text-4xl flex-shrink-0"
                      >
                        🔮
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-bold text-[var(--charcoal)] leading-snug" style={{ fontFamily: 'var(--font-fraunces)' }}>
                          {getEncouragementMessage()}
                        </p>
                        <p className="text-sm text-[var(--sage-700)] font-medium mt-1">
                          Keep going - you're doing amazing! 💛
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-10 relative w-full"
            >
              {/* Confetti Effect - MORE AND BIGGER */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(40)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -50, x: Math.random() * 800 - 400, opacity: 1, scale: 1 }}
                    animate={{ 
                      y: 800, 
                      x: Math.random() * 800 - 400 + (Math.random() - 0.5) * 200,
                      rotate: Math.random() * 720,
                      opacity: 0,
                      scale: 0.5
                    }}
                    transition={{ 
                      duration: 3 + Math.random() * 2, 
                      delay: Math.random() * 0.8,
                      repeat: Infinity,
                      repeatDelay: 0.5
                    }}
                    className="absolute text-5xl"
                    style={{ left: '50%' }}
                  >
                    {['🎉', '✨', '💛', '🌟', '⭐', '🎊', '💫', '🏆'][i % 8]}
                  </motion.div>
                ))}
              </div>

              {/* Navia Orb - BIGGER */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-[12rem] leading-none"
              >
                🔮
              </motion.div>

              {/* Celebration Message - BIGGER */}
              <div className="space-y-6 px-8">
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-7xl font-bold text-[var(--charcoal)] leading-tight" 
                  style={{ fontFamily: 'var(--font-fraunces)' }}
                >
                  {breakdown.encouragement}
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl text-[var(--sage-700)] font-bold"
                >
                  From starting to finishing - that's REAL progress! 🌟
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-2xl text-[var(--charcoal)] font-medium italic"
                >
                  Breaking inertia is the hardest part. You did it! 💛
                </motion.p>
              </div>

              {/* Stats - BIGGER */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="bg-white/60 backdrop-blur-md rounded-3xl p-10 border-3 border-[var(--sage-400)] inline-block shadow-2xl"
              >
                <p className="text-xl font-bold text-[var(--charcoal)] mb-6">You Completed:</p>
                <div className="flex gap-12">
                  <div>
                    <p className="text-6xl font-bold text-[var(--clay-600)] mb-2">{breakdown.totalSteps}</p>
                    <p className="text-lg text-[var(--sage-700)] font-semibold">Main Steps</p>
                  </div>
                  <div className="w-px bg-[var(--sage-300)]"></div>
                  <div>
                    <p className="text-6xl font-bold text-[var(--sage-600)] mb-2">{breakdown.totalSubSteps}</p>
                    <p className="text-lg text-[var(--sage-700)] font-semibold">Sub-Steps</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Step Tracker */}
      <div className="w-[620px] bg-white/30 backdrop-blur-sm rounded-3xl p-6 border-2 border-[var(--sage-300)] shadow-lg flex flex-col">
        {/* Header - Fixed */}
        <div className="text-center pb-4 border-b-2 border-[var(--sage-300)] flex-shrink-0">
          <h3 className="text-2xl font-bold text-[var(--charcoal)] mb-2" style={{ fontFamily: 'var(--font-fraunces)' }}>
            {taskName}
          </h3>
          <p className="text-sm text-[var(--sage-700)] font-medium">
            {breakdown.why}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="flex-1 bg-[var(--sage-200)] rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedMainSteps / steps.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-[var(--clay-500)] to-[var(--sage-600)] rounded-full"
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm font-bold text-[var(--charcoal)]">
              {completedMainSteps}/{steps.length}
            </span>
          </div>
          {breakdown.energyNote && (
            <p className="text-xs text-[var(--sage-700)] mt-2 font-medium">
              💛 {breakdown.energyNote}
            </p>
          )}
        </div>

        {/* Steps List - Scrollable */}
        <div 
          className="space-y-2 mt-4 pr-2 custom-scrollbar"
          style={{
            maxHeight: 'calc(85vh - 200px)',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--sage-400) transparent'
          }}
        >
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: var(--sage-400);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: var(--sage-500);
            }
          `}</style>
            {steps.map((step, index) => (
              <div key={index}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                    step.completed
                      ? 'bg-[var(--sage-100)] border-2 border-[var(--sage-400)]'
                      : index === currentStepIndex
                      ? 'bg-[var(--clay-100)] border-2 border-[var(--clay-500)] shadow-md'
                      : 'bg-white/50 border-2 border-transparent'
                  }`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-[var(--sage-600)]'
                      : index === currentStepIndex
                      ? 'bg-[var(--clay-500)] animate-pulse'
                      : 'bg-[var(--sage-300)]'
                  }`}>
                    {step.completed ? (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    ) : (
                      <span className="text-xs text-white font-bold">{step.stepNumber}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-base leading-relaxed font-semibold ${
                      step.completed
                        ? 'line-through text-[var(--sage-600)]'
                        : index === currentStepIndex
                        ? 'text-[var(--charcoal)] font-bold'
                        : 'text-[var(--charcoal)]'
                    }`}>
                      {step.action}
                    </p>
                    <p className="text-xs text-[var(--sage-600)] mt-1 font-medium">
                      ⏱️ {step.duration}
                    </p>
                  </div>
                  {step.isComplex && step.subSteps.length > 0 && (
                    <button
                      onClick={() => toggleSubSteps(index)}
                      className="flex-shrink-0 text-[var(--sage-600)] hover:text-[var(--charcoal)] hover:bg-[var(--sage-100)] rounded-lg p-1 transition-all"
                      title={step.expanded ? "Hide sub-steps" : `Show ${step.subSteps.length} sub-steps`}
                    >
                      {step.expanded ? (
                        <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
                      ) : (
                        <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
                      )}
                    </button>
                  )}
                </motion.div>

                {/* Expanded Sub-steps */}
                {step.isComplex && step.expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-10 mt-2 space-y-1"
                  >
                    {step.subSteps.map((subStep, subIdx) => (
                      <div
                        key={subIdx}
                        className={`flex items-start gap-2 p-2 rounded-lg text-sm font-medium ${
                          step.subStepsCompleted?.[subIdx]
                            ? 'text-[var(--sage-600)] line-through'
                            : 'text-[var(--charcoal)]'
                        }`}
                      >
                        <span className="text-[var(--sage-600)] font-bold">•</span>
                        <span>{subStep}</span>
                      </div>
                    ))}
                    <p className="text-xs text-[var(--sage-700)] pl-4 mt-2 font-semibold">
                      {step.subStepsCompleted?.filter(Boolean).length || 0}/{step.subSteps.length} complete
                    </p>
                  </motion.div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
