'use client';

import { useState, useEffect } from 'react';

export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  useEffect(() => {
    // Check if tutorial has been completed before
    const completed = localStorage.getItem('navia-tutorial-completed');
    if (completed === 'true') {
      setTutorialCompleted(true);
    }

    // Check if we should show tutorial (coming from onboarding)
    const shouldShow = localStorage.getItem('navia-show-tutorial');
    if (shouldShow === 'true' && completed !== 'true') {
      setShowTutorial(true);
      localStorage.removeItem('navia-show-tutorial');
    }
  }, []);

  const startTutorial = () => {
    setShowTutorial(true);
  };

  const completeTutorial = () => {
    localStorage.setItem('navia-tutorial-completed', 'true');
    setTutorialCompleted(true);
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem('navia-tutorial-completed');
    setTutorialCompleted(false);
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  return {
    showTutorial,
    tutorialCompleted,
    startTutorial,
    completeTutorial,
    resetTutorial,
    closeTutorial,
  };
}
