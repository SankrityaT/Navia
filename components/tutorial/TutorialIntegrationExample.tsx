/**
 * Tutorial Integration Example
 * 
 * This file shows how to integrate the DashboardTutorial component
 * into your dashboard pages (DashboardNew or DashboardBento).
 * 
 * INTEGRATION STEPS:
 * 
 * 1. Import the necessary components and hooks:
 */

import DashboardTutorial from '@/components/tutorial/DashboardTutorial';
import { useTutorial } from '@/hooks/useTutorial';

/**
 * 2. In your dashboard component, add the tutorial hook:
 */

export default function YourDashboardPage() {
  const { showTutorial, completeTutorial, closeTutorial, startTutorial } = useTutorial();

  /**
   * 3. Add the DashboardTutorial component at the end of your JSX,
   *    before the closing div/fragment:
   */

  return (
    <div>
      {/* Your existing dashboard content */}
      
      {/* Tutorial Component - Add this at the end */}
      <DashboardTutorial
        isOpen={showTutorial}
        onClose={closeTutorial}
        onComplete={completeTutorial}
        variant="new" // Use "new" for DashboardNew or "bento" for DashboardBento
      />
    </div>
  );
}

/**
 * 4. OPTIONAL: Add a button to manually trigger the tutorial:
 */

function TutorialButton() {
  const { startTutorial, tutorialCompleted, resetTutorial } = useTutorial();

  return (
    <button
      onClick={() => {
        if (tutorialCompleted) {
          resetTutorial();
        }
        startTutorial();
      }}
      className="fixed bottom-4 right-4 bg-[var(--clay-500)] text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
    >
      {tutorialCompleted ? '🔄 Restart Tutorial' : '❓ Show Tutorial'}
    </button>
  );
}

/**
 * COMPLETE EXAMPLE FOR DASHBOARD-NEW:
 */

/*
'use client';

import { useState, useEffect } from 'react';
import DashboardTutorial from '@/components/tutorial/DashboardTutorial';
import { useTutorial } from '@/hooks/useTutorial';
// ... other imports

export default function DashboardNewPage() {
  const { showTutorial, completeTutorial, closeTutorial, startTutorial, tutorialCompleted } = useTutorial();
  
  // ... your existing state and logic

  return (
    <div className="min-h-screen">
      {/* Your existing dashboard content with data-tutorial attributes *\/}
      
      {/* Optional: Tutorial trigger button *\/}
      <button
        onClick={startTutorial}
        className="fixed bottom-4 right-4 bg-[var(--clay-500)] text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center gap-2"
      >
        <span>❓</span>
        <span>{tutorialCompleted ? 'Restart Tutorial' : 'Show Tutorial'}</span>
      </button>

      {/* Tutorial Component *\/}
      <DashboardTutorial
        isOpen={showTutorial}
        onClose={closeTutorial}
        onComplete={completeTutorial}
        variant="new"
      />
    </div>
  );
}
*/

/**
 * NOTES:
 * 
 * - The tutorial will automatically show after onboarding completion
 * - Users can skip the tutorial at any time
 * - Tutorial completion is saved in localStorage
 * - All dashboard sections have data-tutorial attributes for targeting
 * - The tutorial adapts to both "new" and "bento" dashboard variants
 * 
 * DATA-TUTORIAL ATTRIBUTES AVAILABLE:
 * 
 * DashboardNew:
 * - focus-section: Main task list
 * - goal-progress: Goal tracking card
 * - stats: Statistics card
 * - calm-space: Fidget breather
 * - ai-insight: AI motivational card
 * 
 * DashboardBento:
 * - navia-avatar: Central Navia avatar
 * - tasks: Task list section
 * - energy-level: Energy check-in
 * - support-level: Support preferences
 * - focus-mode: Focus session area
 */
