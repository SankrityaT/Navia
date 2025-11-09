# Greeting Detection Fix

## Problem
When users sent simple greetings like "Hi" or "Hello", the system was incorrectly showing the "Yes, create a plan" button, which doesn't make sense for greetings.

## Root Cause
The LLM was being overly eager and interpreting even simple greetings as tasks that might benefit from breakdown, causing `needsBreakdown: true` to be returned.

## Solution

### 1. Added Greeting Detection Function
**File:** `lib/agents/breakdown.ts`

Created `isSimpleGreetingOrSocial()` function that detects:
- Common greetings: "hi", "hello", "hey", "good morning", etc.
- Social interactions: "thanks", "ok", "bye", etc.
- Very short queries (< 15 characters) that aren't "how" questions

```typescript
export function isSimpleGreetingOrSocial(query: string): boolean {
  const lowerQuery = query.toLowerCase().trim();
  
  // Very short queries (likely greetings)
  if (lowerQuery.length < 15 && !lowerQuery.includes('how')) {
    return true;
  }
  
  // Common greetings and social phrases
  const greetings = [
    'hi', 'hello', 'hey', 'thanks', 'ok', 'bye', etc.
  ];
  
  // Check if query starts with greeting
  return greetings.some(greeting => 
    lowerQuery === greeting || 
    lowerQuery.startsWith(greeting + ' ')
  );
}
```

### 2. Updated All Agents
**Files:** `lib/agents/daily-task.ts`, `lib/agents/finance.ts`, `lib/agents/career.ts`

All three agents now:
1. Check if query is a greeting first
2. Skip breakdown generation for greetings
3. Force `needsBreakdown: false` for greetings

```typescript
// Check if query is a greeting
const isGreeting = isSimpleGreetingOrSocial(query);

// Don't generate breakdown for greetings
const explicitBreakdownRequest = !isGreeting && explicitlyRequestsBreakdown(query);

// Force needsBreakdown to false for greetings
const finalNeedsBreakdown = isGreeting 
  ? false  // NEVER suggest breakdown for greetings
  : breakdown && breakdown.length > 0 
    ? false  // Breakdown already provided
    : (aiResponse.metadata?.needsBreakdown ?? false); // Use LLM's decision
```

### 3. Updated Prompts
**File:** `lib/agents/prompts.ts`

Added explicit instruction to LLM:
```
SET needsBreakdown: FALSE when:
- **Greetings or social interactions** ("Hi", "Hello", "How are you", "Thanks", etc.) - NEVER suggest breakdown
- Very short queries (< 15 characters) that aren't questions
```

## Priority Order for needsBreakdown

The system now follows this priority:

1. **Is it a greeting?** → `needsBreakdown: false` ⛔
2. **Breakdown already generated?** → `needsBreakdown: false` (already provided)
3. **Otherwise** → Trust LLM's decision

## Examples That Now Work Correctly

### ✅ Greetings (No Button)
- "Hi"
- "Hello"
- "Hey"
- "Good morning"
- "Thanks"
- "Ok"
- "Got it"

### ✅ Real Questions (LLM Decides)
- "How do I create a budget?" → Button shown
- "I need to find a job" → Button shown
- "What is compound interest?" → No button

### ✅ Explicit Requests (Immediate Breakdown)
- "Create a plan for finding a job" → Breakdown immediately
- "Break down how to budget" → Breakdown immediately

## Testing
Try these queries to verify:
1. "Hello" → Should just greet back, no button
2. "Hi there" → Should just greet back, no button
3. "Thanks!" → Should acknowledge, no button
4. "How do I budget?" → Should answer + show button
5. "Create a plan to find a job" → Should show breakdown immediately

## Console Logs
Watch for:
```
🤖 Daily Task LLM decision: {
  query: "Hello",
  isGreeting: true,  // ← New field
  finalNeedsBreakdown: false,
  ...
}
```

## Benefits
✅ No more inappropriate button suggestions for greetings
✅ Natural conversation flow
✅ Cleaner user experience
✅ Two-layer protection: code check + LLM instruction

## Files Modified
- ✅ `lib/agents/breakdown.ts` - Added greeting detection
- ✅ `lib/agents/daily-task.ts` - Use greeting check
- ✅ `lib/agents/finance.ts` - Use greeting check
- ✅ `lib/agents/career.ts` - Use greeting check
- ✅ `lib/agents/prompts.ts` - Explicit LLM instruction

