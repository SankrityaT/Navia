# 🔍 NAVIA MULTI-TAB DIAGNOSTIC

## Issues Reported:
1. ❌ Cannot type in input field
2. ❌ Bad/generic AI responses
3. ❌ Task breakdown button missing
4. ❌ Resources not showing properly
5. ❌ LLM not deciding when to show tasks

---

## COMPONENT CHECKLIST:

### ✅ **1. Frontend - ChatInterface.tsx**

**State Management:**
- [ ] `tabs` array properly initialized?
- [ ] `activeTabId` set correctly?
- [ ] `isLoading` not stuck on true?
- [ ] Default welcome message in new tabs?

**Input Field:**
- [ ] Disabled only when `isLoading`?
- [ ] `handleSend` function working?
- [ ] `sessionMessages` properly extracted from activeTab?

**Context Sending:**
- [ ] Sending `sessionMessages` (last 10 from tab)?
- [ ] Sending `session_id`?
- [ ] Sending `userContext`?

---

### ✅ **2. API Route - /api/query/route.ts**

**Context Building:**
- [ ] Receiving `sessionMessages` from frontend?
- [ ] Receiving `session_id`?
- [ ] Building hybrid context (session + semantic + chronological)?
- [ ] Passing `enhancedContext` to orchestrator with `recentHistory`?

**Hybrid Retrieval:**
```javascript
Should create:
{
  recentHistory: [
    ...sessionMessages (immediate),
    ...semanticMatches (relevant),
    ...chronologicalHistory (context)
  ],
  sessionMessageCount: X,
  semanticMatchCount: Y,
  fullHistoryCount: Z
}
```

---

### ✅ **3. Orchestrator - lib/agents/orchestrator.ts**

**Context Usage:**
- [ ] Using `userContext.recentHistory` (NOT fetching from Pinecone again)?
- [ ] Passing `chatHistory` to agents?
- [ ] Intent detection getting conversation context?

**CRITICAL FIX APPLIED:**
```javascript
// ❌ OLD (WRONG):
const chatHistory = await retrieveChatHistory(userId, 5);

// ✅ NEW (CORRECT):
const chatHistory = userContext?.recentHistory || [];
```

---

### ✅ **4. Finance Agent - lib/agents/finance.ts**

**Context Usage:**
- [ ] Receiving `userContext.recentHistory`?
- [ ] Building conversation context with session sections?
- [ ] Fetching external resources?
- [ ] RAG sources?

**LLM Prompt:**
- [ ] Has instructions for task breakdown decisions?
- [ ] Has `needsBreakdown` in response schema?
- [ ] Has `showResources` in response schema?

**Response Building:**
- [ ] Returns `resources` array?
- [ ] Returns `sources` array?
- [ ] Returns `breakdown` if needed?
- [ ] Returns `metadata.needsBreakdown`?

---

### ✅ **5. Response Flow Back to Frontend**

**Orchestrator Return:**
- [ ] Returns `resources` and `sources`?
- [ ] Returns `breakdown`?
- [ ] Returns `metadata` with flags?

**API Route Return:**
```javascript
Should return:
{
  success: true,
  summary: "...",
  resources: [...],  // Web resources
  sources: [...],    // RAG sources
  breakdown: [...],  // If provided
  metadata: {
    needsBreakdown: bool,
    showResources: bool,
    category: "..."
  }
}
```

**Frontend Display:**
- [ ] Shows resources in "📚 Helpful Resources" section?
- [ ] Shows sources in collapsible button?
- [ ] Shows breakdown if present?
- [ ] Shows "Break down into steps" button if `needsBreakdown && !breakdown`?

---

## KNOWN ISSUES TO FIX:

### 🐛 **Issue 1: Input Field Disabled**
**Symptom:** Cannot type
**Possible Causes:**
1. `isLoading` stuck on true
2. No active tab
3. Tab initialization failed

**Debug:**
```javascript
console.log('Debug state:', {
  tabs: tabs.length,
  activeTabId,
  activeTab: !!activeTab,
  isLoading,
});
```

---

### 🐛 **Issue 2: Generic Responses**
**Symptom:** "Building credit takes time..." instead of detailed response
**Possible Causes:**
1. Context not reaching agents
2. Agent prompt issues
3. Orchestrator re-fetching from Pinecone

**Debug:**
```javascript
// Frontend:
console.log('🚀 Sending:', { sessionMessages, session_id });

// API:
console.log('🔍 Hybrid context:', { conversationHistory.length });

// Orchestrator:
console.log('📦 Context to agents:', { chatHistory.length });

// Agent:
console.log('💰 Agent received:', { userContext.recentHistory.length });
```

---

### 🐛 **Issue 3: Task Breakdown Logic**
**Current State:** Button shows but logic might be broken
**Required:**
1. LLM prompt includes task decision instructions
2. Response schema has `needsBreakdown` field
3. Frontend shows button when `needsBreakdown && !breakdown`
4. Button handler requests breakdown

---

### 🐛 **Issue 4: Resources**
**Current State:** Some showing as "Untitled"
**Required:**
1. Web search returning proper resources
2. RAG sources filtered for quality
3. Both displayed in separate sections

---

## TESTING PROTOCOL:

### Test 1: Basic Chat
```
Input: "Hello"
Expected: Greeting response, no resources, no breakdown
Check: Can type? Response appropriate?
```

### Test 2: Finance Question
```
Input: "How do I build credit?"
Expected: Detailed response, resources, maybe breakdown button
Check: Context-aware? Resources shown? Breakdown logic?
```

### Test 3: Follow-up
```
Input 1: "My credit score is 720"
Input 2: "Is that good?"
Expected: Response referencing 720
Check: Session context working?
```

### Test 4: Task Request
```
Input: "Help me create a budget"
Expected: Either immediate breakdown OR button to request it
Check: LLM decision logic working?
```

---

## NEXT STEPS:

1. ✅ Add debug logging everywhere
2. ✅ Test basic input (can type?)
3. ✅ Test context flow (logs show proper chain?)
4. ✅ Fix any broken links in the chain
5. ✅ Verify LLM prompts intact
6. ✅ Test all features systematically

