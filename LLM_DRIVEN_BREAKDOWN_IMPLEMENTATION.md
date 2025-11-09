# LLM-Driven Task Breakdown Implementation

## Overview

The system now uses **intelligent LLM-driven decision-making** to determine when to show the "Yes, create a plan" button vs. when to directly create tasks vs. when to just answer normally.

**Key Principle**: The LLM decides everything. No hardcoding.

---

## How It Works

### 3 Scenarios

#### 1️⃣ **User Explicitly Asks for Tasks** → Create Tasks Immediately
**Triggers:**
- User says: "create a plan", "make a plan", "break it down", "step by step", "walk me through"
- `explicitlyRequestsBreakdown()` function returns `true`

**What Happens:**
- Backend immediately generates breakdown
- Returns tasks in the response
- No button shown (tasks already provided)
- `needsBreakdown: false` in metadata

**Example:**
- User: "Create a plan for finding a job"
- Response: "I've created a step-by-step plan below..."
  - Step 1: Update your resume
  - Step 2: Research target companies
  - Step 3: ...

---

#### 2️⃣ **User Asks Question That Could Benefit from Tasks** → Show Button
**Triggers:**
- LLM analyzes the query and determines it's multi-step
- Examples: "How do I budget?", "I need to find a job", "I'm overwhelmed with finances"

**What Happens:**
- LLM answers the question normally
- LLM sets `needsBreakdown: true` in metadata
- Frontend shows "Yes, create a plan" button
- When user clicks "Yes":
  - Query is resent with explicit request: "{original query} - create a plan for this"
  - Goes to Scenario 1 (creates breakdown)

**Example:**
- User: "How do I create a budget?"
- Response: "Creating a budget is an important step for managing your finances. Here's what you need to know..."
  - [Button: "✅ Yes, create a plan" | "No, thanks"]
- User clicks "Yes" → Gets step-by-step breakdown

---

#### 3️⃣ **Simple Question** → Just Answer, No Button
**Triggers:**
- Simple informational queries
- Single-action tasks
- Questions that don't need breakdown

**What Happens:**
- LLM answers the question
- LLM sets `needsBreakdown: false` in metadata
- No button shown
- Just a normal conversation

**Example:**
- User: "What is a 401k?"
- Response: "A 401k is a retirement savings plan..."

---

## LLM Decision-Making

### The LLM Decides Based On:

**SET `needsBreakdown: true` WHEN:**
- Task involves multiple steps (e.g., "create a budget", "find a job")
- User seems overwhelmed ("don't know where to start", "struggling")
- Answer involves a process that could be broken into steps
- Complexity >= 5 and actionable steps would help
- User asks "how to" do something multi-step

**SET `needsBreakdown: false` WHEN:**
- Simple factual questions ("What is X?")
- Single-action tasks ("Send one email")
- User just wants information, not action plan
- Emotional support or validation
- Complexity < 4 and straightforward

---

## Code Flow

### 1. User Sends Query

```typescript
// ChatInterface.tsx
handleSend(query)
  → POST /api/query
```

### 2. Backend Processes

```typescript
// /api/query/route.ts
orchestrateQuery(userId, query, userContext)
  → detectIntent(query)  // Determines which agent
  → Agent processes query
```

### 3. Agent Processes Query

```typescript
// e.g., daily-task.ts, finance.ts, career.ts

// Check if EXPLICIT breakdown request
if (explicitlyRequestsBreakdown(query)) {
  // Generate breakdown immediately
  breakdown = await generateBreakdown(...)
}

// Pass to LLM with context
const response = await groqStructuredOutput([...])

// LLM returns:
{
  "summary": "Answer to their question",
  "breakdown": ["Step 1", "Step 2", ...] // Only if pre-generated
  "metadata": {
    "needsBreakdown": true/false // LLM decides!
  }
}
```

### 4. Orchestrator Combines Results

```typescript
// orchestrator.ts

// Check if any agent suggests breakdown but didn't generate one
const needsBreakdown = responses.some(
  (r) => r.metadata?.needsBreakdown === true && !r.breakdown
)

return {
  summary: "Combined response",
  breakdown: breakdown || undefined,
  metadata: {
    needsBreakdown // Frontend uses this!
  }
}
```

### 5. Frontend Shows UI

```typescript
// ChatInterface.tsx

// Show button if LLM suggests breakdown but none was generated
{message.role === 'assistant' && 
 metadata?.needsBreakdown && 
 !message.breakdown && (
  <div>
    <button onClick={() => handleBreakdownResponse(true, originalQuery)}>
      ✅ Yes, create a plan
    </button>
    <button onClick={() => handleBreakdownResponse(false, originalQuery)}>
      No, thanks
    </button>
  </div>
)}

// Show breakdown if it exists
{message.breakdown && (
  <ol>
    {message.breakdown.map((step) => <li>{step}</li>)}
  </ol>
)}
```

### 6. User Clicks "Yes, create a plan"

```typescript
handleBreakdownResponse(true, originalQuery) {
  // Resend query with explicit request
  const explicitRequest = `${originalQuery} - create a plan for this`
  await handleSend(explicitRequest)
}
```

---

## Key Implementation Details

### `explicitlyRequestsBreakdown()` Function

**Location:** `lib/agents/breakdown.ts`

**Purpose:** Detect VERY explicit breakdown requests only

**Keywords Matched:**
- "create a plan", "make a plan", "build a plan"
- "give me a plan", "show me a plan"
- "break it down", "breakdown"
- "walk me through", "guide me through"
- "show me the steps", "give me the steps"

**Special Handling:**
- "how to" questions are NOT considered explicit requests
- They're answered normally with LLM deciding if breakdown is helpful
- Exception: "how to step by step" IS explicit

---

### Agent Prompts

**Location:** `lib/agents/prompts.ts`

**Key Instructions to LLM:**

```
CRITICAL DECISION-MAKING FOR "needsBreakdown":
YOU must intelligently decide when to set needsBreakdown: true.

SET needsBreakdown: TRUE when:
- Task involves multiple steps or actions
- User seems overwhelmed or stuck
- Answer involves a process that could be broken into steps
- Complexity >= 5 and actionable steps would help
- User asks "how to" do something multi-step

SET needsBreakdown: FALSE when:
- Simple factual questions
- Single-action tasks
- User just wants information, not action plan
- Emotional support or validation
- Complexity < 4 and straightforward

CRITICAL RULES:
- If breakdown was pre-generated: Include it, set needsBreakdown: false
- If NO breakdown: Answer fully, set needsBreakdown based on YOUR analysis
- DO NOT ask "Would you like me to break this down?" in summary
- The UI will show a button if needsBreakdown is true
```

---

## Benefits of This Approach

### ✅ **Intelligent, Not Hardcoded**
- LLM analyzes each query contextually
- Adapts to user's specific needs
- No rigid keyword matching for suggestions

### ✅ **Clean User Experience**
- No interrupting "Would you like..." questions in text
- Clean button UI for explicit choice
- Breakdown appears instantly when explicitly requested

### ✅ **Flexible**
- "How to" questions get full answers + optional breakdown
- Explicit requests get immediate breakdowns
- Simple questions don't clutter with unnecessary options

### ✅ **Respects User Intent**
- If user asks for plan → gets plan immediately
- If user asks question → gets answer + option for plan
- If user wants info → just gets info

---

## Testing Examples

### Test Case 1: Explicit Request
```
User: "Create a plan for job searching"
Expected: Immediate breakdown, no button
```

### Test Case 2: "How To" Question
```
User: "How do I create a budget?"
Expected: Full answer + button
```

### Test Case 3: Simple Question
```
User: "What is compound interest?"
Expected: Answer only, no button
```

### Test Case 4: Overwhelmed User
```
User: "I need to organize my finances but I don't know where to start"
Expected: Supportive answer + button
```

### Test Case 5: Multi-Step Task
```
User: "I want to apply for jobs"
Expected: Answer with guidance + button
```

### Test Case 6: Single Action
```
User: "Send an email to my professor"
Expected: Answer only, no button
```

---

## Files Modified

### Core Logic
- ✅ `lib/agents/breakdown.ts` - Stricter explicit request detection
- ✅ `lib/agents/prompts.ts` - Clear LLM decision-making instructions
- ✅ `lib/agents/orchestrator.ts` - Trust LLM's needsBreakdown flag
- ✅ `lib/agents/daily-task.ts` - Use LLM's decision
- ✅ `lib/agents/finance.ts` - Use LLM's decision
- ✅ `lib/agents/career.ts` - Use LLM's decision

### Frontend
- ✅ `components/chat/ChatInterface.tsx` - Button handling and resend logic

---

## Console Logging

**Watch for these logs to debug:**

```typescript
// Backend logs
🎯 Daily Task: User explicitly requested breakdown, generating...
🤖 Daily Task LLM decision: { llmNeedsBreakdown: true, ... }
🔍 Daily Task agent final response: { finalNeedsBreakdown: true, ... }
🎯 Orchestrator decision: { finalNeedsBreakdown: true, ... }

// Frontend logs
📨 Frontend received: { needsBreakdown: true, hasBreakdown: false }
```

---

## Summary

The system now operates on a **trust-the-LLM** principle:

1. **Explicit requests** → Instant breakdown (keyword detection)
2. **Implicit needs** → LLM decides + button shows (AI analysis)
3. **Simple queries** → Just answer (AI decides no breakdown needed)

**No hardcoding. The LLM is in control.**

---

## Future Improvements

1. **Learn from user behavior**: Track when users accept/decline breakdowns
2. **Adjust thresholds**: Fine-tune complexity scoring based on feedback
3. **User preferences**: Remember if user prefers breakdowns or not
4. **Contextual suggestions**: Consider chat history in breakdown decision

