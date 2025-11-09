# Multi-Agent Breakdown Fix

## Problem Reported

User saw this in the chat interface:
```
💰 Task Management Guidance:
I've created a step-by-step plan below to help you

---

💼 Career Guidance:
I've created a step-by-step plan below to help you

---

💰 Finance Guidance:
I've created a step-by-step plan below to help you
```

**And then:** "Your Step-by-Step Plan (11 main steps)" 🚫

## Root Causes

### Issue 1: Combining ALL Agent Breakdowns
The orchestrator was doing `flatMap` on breakdowns from all agents:
```typescript
// OLD (BROKEN)
const allBreakdowns = responses
  .filter((r) => r.breakdown && r.breakdown.length > 0)
  .flatMap((r) => r.breakdown!);
// Result: 3-5 steps × 3 agents = 9-15 steps! 😱
```

### Issue 2: Duplicate "Step-by-Step Plan" Text
Each agent's summary included "I've created a step-by-step plan below", which got displayed separately when multiple agents responded, creating confusing duplicate headers.

## The Fix

### 1. **Take Breakdown from PRIMARY Agent Only**
```typescript
// NEW (FIXED)
const primaryBreakdown = responses.find((r) => r.breakdown && r.breakdown.length > 0)?.breakdown;
const primaryBreakdownTips = responses.find((r) => r.breakdown && r.breakdown.length > 0)?.breakdownTips;

return {
  ...
  breakdown: primaryBreakdown, // Only one breakdown!
  breakdownTips: primaryBreakdownTips,
  ...
};
```

**Result:** 3-5 steps total (not 11!)

### 2. **Strip Redundant Phrases from Multi-Agent Summaries**
```typescript
function combineMultiAgentResponses(responses: AIResponse[]): string {
  // Phrases to remove from individual summaries (they're redundant in multi-agent context)
  const redundantPhrases = [
    /I've created a step-by-step plan below.*?\.?$/gim,
    /I've created a step-by-step plan to help you.*?\.?$/gim,
    /I've created a plan below.*?\.?$/gim,
    /See the step-by-step plan below.*?\.?$/gim,
  ];

  const sections = responses
    .map((response) => {
      const label = domainLabels[response.domain];
      // Strip out mentions of "step-by-step plan"
      let cleanedSummary = response.summary;
      redundantPhrases.forEach(phrase => {
        cleanedSummary = cleanedSummary.replace(phrase, '').trim();
      });
      
      return `${label}:\n${cleanedSummary}`;
    })
    .join('\n\n---\n\n');
  
  return `${intro}\n\n${sections}`;
}
```

**Result:** No more duplicate "I've created a step-by-step plan" messages!

### 3. **Updated TypeScript Interfaces**
```typescript
export interface OrchestrationResult {
  success: boolean;
  responses: AIResponse[];
  combinedSummary?: string;
  breakdown?: BreakdownStep[];  // Hierarchical, from primary agent only
  breakdownTips?: string[];  // Tips from primary agent
  resources?: ResourceLink[];
  sources?: SourceReference[];
  metadata: { ... };
}
```

### 4. **Updated API Route**
```typescript
// ONLY add breakdown field if it exists (from PRIMARY agent only)
if (result.breakdown && result.breakdown.length > 0) {
  responseData.breakdown = result.breakdown;
  // Also include tips if they exist
  if (result.breakdownTips && result.breakdownTips.length > 0) {
    responseData.breakdownTips = result.breakdownTips;
  }
}
```

### 5. **Updated ChatInterface**
```typescript
// Pass breakdownTips to message
const assistantMessage = {
  ...
  breakdown: data.breakdown,
  breakdownTips: data.breakdownTips,
  ...
};
```

## What You'll See Now

### Multi-Agent Response (Moving Query)
```
I've analyzed your question from multiple perspectives. Here's comprehensive guidance:

✅ Task Management Guidance:
Moving is a big transition! Here's how to make it manageable...

---

💼 Career Guidance:
Consider updating your address with your employer and job search profiles...

---

💰 Finance Guidance:
Budget for moving costs including deposits, truck rental, and utilities...
```

**Then ONE unified breakdown:**
```
📋 Your Step-by-Step Plan (4 main steps)

1️⃣ Prep: Make a Moving Checklist
   ⏱ 10 min
   • List all rooms and what needs to be packed
   • Note items that need special care
   • Set a moving date

2️⃣ Start Packing Non-Essentials
   ⏱ 1-2 hours
   • Get boxes and tape
   • Pack seasonal items first
   • Label everything clearly

3️⃣ Arrange Moving Logistics
   ⏱ 30 min | ⚠️ CHALLENGING
   • Book moving truck or helpers
   • Notify landlord of move-out
   • Set up utilities at new place

4️⃣ Final Day Prep [OPTIONAL]
   ⏱ 1 hour
   • Pack overnight bag
   • Clean old place
   • Do final walkthrough

💡 Helpful Tips
→ You can do just step 1 today
→ Pack one room at a time
→ Ask friends for help - most people are happy to!
```

## Before vs After

| Before | After |
|--------|-------|
| 11 main steps | 3-5 main steps |
| Duplicate "step-by-step plan" text | Clean, single plan |
| Breakdown from all 3 agents combined | Breakdown from primary agent only |
| Overwhelming | Manageable |

## Files Changed

1. `lib/agents/orchestrator.ts` - Take primary breakdown only, strip redundant phrases
2. `lib/agents/types.ts` - Updated `OrchestrationResult` interface
3. `app/api/query/route.ts` - Pass breakdown and tips correctly
4. `components/chat/ChatInterface.tsx` - Display breakdown and tips

---

**Status:** ✅ **FIXED**

**Test it:** Ask a complex query like "I'm moving out soon and need help with everything" - you should now see clean guidance from multiple agents with ONE manageable breakdown (3-5 steps).

