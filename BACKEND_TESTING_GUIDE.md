# Backend Testing Guide - Complete Walkthrough

This guide will walk you through testing all the backend functionality we've built for Navia.

---

## 🚀 Prerequisites

### 1. Environment Variables

Ensure your `.env.local` has all required keys:

```bash
# Check if file exists
cat .env.local

# Required variables:
GROQ_API_KEY=gsk_...                     # For LLaMA-4-Scout
PINECONE_API_KEY=...                     # For vector storage
PINECONE_INDEX_NAME=navia-index          # Your Pinecone index
OPENAI_API_KEY=sk-...                    # For embeddings
TAVILY_API_KEY=tvly-...                  # For web search
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_... # Auth
CLERK_SECRET_KEY=sk_...                  # Auth
```

### 2. Install Dependencies

```bash
cd /Users/jacobkuriakose/Desktop/Hackathon/Navia
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Server will start at: `http://localhost:3000`

---

## 📝 Getting Authentication Token

All API endpoints require authentication. You need a Clerk token.

### Option 1: Sign Up/Sign In Through Frontend

1. Go to `http://localhost:3000/sign-up`
2. Create account or sign in
3. Open browser DevTools → Application → Cookies
4. Copy `__session` cookie value

### Option 2: Use Clerk Dashboard (Testing)

1. Go to Clerk Dashboard → Users
2. Create test user
3. Get user ID (starts with `user_`)

For testing, we'll use curl with authentication header:

```bash
# Set your token as environment variable
export CLERK_TOKEN="your_session_token_here"
```

---

## 🧪 Testing Checklist

- [ ] Health Check
- [ ] User Profile (Onboarding)
- [ ] Multi-Agent Orchestrator
- [ ] Finance Agent
- [ ] Career Agent
- [ ] Daily Task Agent
- [ ] Breakdown Tool
- [ ] AI-Generated Tasks (Task Visualizer)
- [ ] Chat History
- [ ] External Tools (Tavily, Finance, Career)

---

## Test 1: Health Check ✅

**Test orchestrator is running:**

```bash
curl http://localhost:3000/api/query \
  -H "Authorization: Bearer $CLERK_TOKEN"
```

**Expected Response:**
```json
{
  "status": "healthy",
  "message": "Query orchestrator is running",
  "availableAgents": ["finance", "career", "daily_task"],
  "features": [
    "Multi-agent routing",
    "Intent detection",
    "Task breakdown",
    "RAG retrieval",
    "Chat history"
  ]
}
```

**✅ Pass if:** Status 200 and healthy message returned

---

## Test 2: User Onboarding & Profile 👤

### 2a. Save User Profile

```bash
curl -X POST http://localhost:3000/api/onboarding \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{
    "name": "Test User",
    "graduation_date": "2024-05",
    "university": "State University",
    "ef_profile": {
      "task_initiation": true,
      "time_management": true,
      "organization": false,
      "planning": false,
      "working_memory": true
    },
    "current_goals": {
      "job_searching": true,
      "managing_finances": true,
      "independent_living": false,
      "building_social_connections": false
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Onboarding complete! Your profile has been saved."
}
```

**Console Output:**
```
✅ User profile stored in Pinecone for Test User (user_...)
```

**✅ Pass if:** 
- Status 200
- Success message returned
- Console shows profile stored in Pinecone

### 2b. Retrieve User Profile

```bash
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer $CLERK_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "profile": {
    "userId": "user_...",
    "name": "Test User",
    "graduation_date": "2024-05",
    "university": "State University",
    "ef_challenges": ["task_initiation", "time_management", "working_memory"],
    "goals": ["job_searching", "managing_finances"],
    "timestamp": 1234567890
  }
}
```

**✅ Pass if:** Profile data matches what you submitted

---

## Test 3: Multi-Agent Orchestrator 🎯

The main orchestrator routes queries to appropriate agents.

### 3a. Finance Query

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{
    "query": "Help me create a budget for this month and break it down step by step",
    "userContext": {
      "energy_level": "medium",
      "ef_profile": ["task_initiation", "time_management"]
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "query": "Help me create a budget...",
  "domains": ["finance"],
  "summary": "I'll help you create a neurodivergent-friendly budget...",
  "breakdown": [
    "Step 1: Gather last month's bank statements (5 min)",
    "Step 2: List all income sources (10 min)",
    "Step 3: Track expenses for one week",
    "..."
  ],
  "resources": [
    {"title": "YNAB", "url": "https://...", "type": "tool"},
    {"title": "Mint", "url": "https://...", "type": "tool"}
  ],
  "sources": [
    {"title": "Budgeting Guide", "url": "https://...", "excerpt": "..."}
  ],
  "taskIds": ["uuid-of-created-task"],
  "metadata": {
    "confidence": 0.85,
    "complexity": 6,
    "executionTime": 3500,
    "usedBreakdown": true
  }
}
```

**Console Output:**
```
Intent detected: finance (confidence: 0.95)
📝 AI Task stored: abc123-... (finance) for user user_...
📋 Orchestrator: Task created: abc123-... (finance)
```

**✅ Pass if:**
- Routes to finance domain
- Returns breakdown (7+ steps)
- Returns resources (budgeting tools)
- Creates task (taskIds in response)
- Console shows task created

### 3b. Career Query

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{
    "query": "I need help preparing for a software engineering interview"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "domains": ["career"],
  "summary": "I'll help you prepare systematically...",
  "breakdown": [
    "Step 1: Research the company...",
    "Step 2: Prepare answers to common questions...",
    "..."
  ],
  "resources": [
    {"title": "Interview Question Bank", "type": "article"},
    {"title": "STAR Method Guide", "type": "guide"}
  ],
  "taskIds": ["uuid"],
  "metadata": {
    "complexity": 7,
    "usedBreakdown": true
  }
}
```

**✅ Pass if:**
- Routes to career domain
- Returns interview-specific guidance
- Creates task

### 3c. Daily Task Query

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{
    "query": "I feel stuck and can'\''t start my tasks today",
    "userContext": {
      "energy_level": "low"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "domains": ["daily_task"],
  "summary": "I know task initiation can be really tough...",
  "breakdown": [
    "Step 1: Set a 2-minute timer and just write down ONE task",
    "Step 2: Take a break if needed",
    "Step 3: When ready, tackle just the first tiny part"
  ],
  "resources": [
    {"title": "5-Minute Rule Timer", "type": "tool"},
    {"title": "Goblin Tools", "type": "tool"}
  ],
  "metadata": {
    "complexity": 3,
    "energyLevel": "low"
  }
}
```

**✅ Pass if:**
- Routes to daily_task domain
- Tone is extra supportive (low energy)
- Suggests micro-steps
- Includes productivity tools

### 3d. Multi-Domain Query

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{
    "query": "I need to balance my job search with managing my tight budget"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "domains": ["career", "finance"],
  "summary": "Here's comprehensive guidance across both areas...",
  "breakdown": [
    "Career Steps:",
    "Step 1: ...",
    "Finance Steps:",
    "Step 1: ..."
  ],
  "taskIds": ["uuid1", "uuid2"],
  "metadata": {
    "multiAgent": true,
    "domainsInvolved": ["career", "finance"]
  }
}
```

**Console Output:**
```
Intent detected: career, finance (confidence: 0.88)
📋 Orchestrator: Task created: uuid1 (career)
📋 Orchestrator: Task created: uuid2 (finance)
```

**✅ Pass if:**
- Routes to both career AND finance
- Creates 2 separate tasks
- Combined response covers both domains

---

## Test 4: Individual Agent Endpoints 🤖

Test agents directly (bypasses orchestrator).

### 4a. Finance Agent Direct

```bash
curl -X POST http://localhost:3000/api/agent/finance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{
    "query": "What budgeting apps work well for ADHD?"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "domain": "finance",
  "summary": "Here are budgeting apps designed with neurodivergent users in mind...",
  "resources": [
    {"title": "YNAB", "description": "Zero-based budgeting...", "type": "tool"},
    {"title": "Mint", "description": "Automatic tracking...", "type": "tool"}
  ],
  "executionTime": 2500,
  "taskId": null
}
```

**✅ Pass if:**
- Returns finance-specific response
- Lists budgeting tools
- No task created (no breakdown)

### 4b. Career Agent Direct

```bash
curl -X POST http://localhost:3000/api/agent/career \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{
    "query": "What workplace accommodations can I request for ADHD?"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "domain": "career",
  "summary": "Under the ADA, you can request several accommodations...",
  "resources": [
    {"title": "AskJAN.org", "url": "https://askjan.org", "type": "guide"},
    {"title": "ADA.gov", "type": "guide"}
  ],
  "sources": [
    {"title": "Workplace Accommodations Guide", "excerpt": "..."}
  ]
}
```

**✅ Pass if:**
- Career-specific guidance
- References ADA and accommodation resources

### 4c. Daily Task Agent Direct

```bash
curl -X POST http://localhost:3000/api/agent/daily-task \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{
    "query": "How do I overcome time blindness?"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "domain": "daily_task",
  "summary": "Time blindness is a real challenge...",
  "resources": [
    {"title": "Visual Timer", "type": "tool"},
    {"title": "Tiimo App", "type": "tool"}
  ],
  "metadata": {
    "complexity": 4
  }
}
```

**✅ Pass if:**
- Daily task focus
- Suggests visual timers
- Supportive tone

---

## Test 5: Breakdown Tool 🔨

### 5a. Request Breakdown

```bash
curl -X POST http://localhost:3000/api/agent/breakdown \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{
    "task": "Apply for 3 jobs this week",
    "userContext": {
      "ef_profile": ["task_initiation", "time_management"]
    },
    "autoBreakdown": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "breakdown": [
    "Day 1: Find 3 job postings that match your skills (20 min)",
    "Day 2: Update resume with keywords from job 1 (30 min)",
    "Day 2: Submit application to job 1 (10 min)",
    "Day 3: Customize cover letter for job 2 (25 min)",
    "..."
  ],
  "needsBreakdown": true,
  "complexity": 6,
  "estimatedTime": "2-3 hours spread across week",
  "tips": [
    "Set a timer for 5 minutes to overcome task initiation",
    "Use visual timer to combat time blindness"
  ]
}
```

**✅ Pass if:**
- Returns 3-7 steps
- Steps are specific and actionable
- Includes time estimates
- Tips personalized to EF profile

### 5b. Check if Task Needs Breakdown (GET)

```bash
curl "http://localhost:3000/api/agent/breakdown?task=Send%20one%20email" \
  -H "Authorization: Bearer $CLERK_TOKEN"
```

**Expected Response:**
```json
{
  "needsBreakdown": false,
  "complexity": 2,
  "reasoning": "Single, straightforward task"
}
```

**✅ Pass if:**
- Simple task = no breakdown needed
- Complexity score is low (0-3)

---

## Test 6: Task Visualizer (AI-Generated Tasks) 📋

### 6a. Generate Tasks First

```bash
# Create some tasks by asking for help
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{"query": "Help me budget"}'

curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{"query": "Prepare me for interviews"}'

curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{"query": "Organize my room step by step"}'
```

**Console Output:**
```
📋 Finance task created: abc123-...
📋 Career task created: def456-...
📋 Daily task created: ghi789-...
```

### 6b. Get All AI-Generated Tasks

```bash
curl http://localhost:3000/api/tasks/ai-generated \
  -H "Authorization: Bearer $CLERK_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "task_id": "abc123-...",
      "domain": "finance",
      "title": "Budget",
      "breakdown": ["Step 1: ...", "Step 2: ..."],
      "status": "not_started",
      "created_at": "2024-11-09T...",
      "original_query": "Help me budget"
    },
    {
      "task_id": "def456-...",
      "domain": "career",
      "title": "Prepare for interviews",
      "breakdown": ["Step 1: ...", "Step 2: ..."],
      "status": "not_started"
    }
  ],
  "groupedByDomain": {
    "finance": [1 task],
    "career": [1 task],
    "daily_task": [1 task]
  },
  "total": 3
}
```

**✅ Pass if:**
- Returns all created tasks
- Grouped by domain
- Each has task_id (UUID)

### 6c. Get Finance Tasks Only

```bash
curl "http://localhost:3000/api/tasks/ai-generated?domain=finance" \
  -H "Authorization: Bearer $CLERK_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "task_id": "abc123-...",
      "domain": "finance",
      ...
    }
  ],
  "groupedByDomain": {
    "finance": [1 task],
    "career": [],
    "daily_task": []
  },
  "total": 1
}
```

**✅ Pass if:**
- Only finance tasks returned

### 6d. Get Specific Task Details

```bash
# Use task_id from previous response
curl "http://localhost:3000/api/tasks/ai-generated?task_id=abc123-..." \
  -H "Authorization: Bearer $CLERK_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "task": {
    "task_id": "abc123-...",
    "domain": "finance",
    "title": "Budget",
    "summary": "I'll help you create a budget...",
    "breakdown": [
      "Step 1: Gather bank statements (5 min)",
      "Step 2: List income sources (10 min)",
      "..."
    ],
    "resources": [
      {"title": "YNAB", "url": "...", "type": "tool"}
    ],
    "sources": [...],
    "metadata": {
      "complexity": 6,
      "tips": ["Start with one week...", ...]
    }
  }
}
```

**✅ Pass if:**
- Full task details returned
- Includes breakdown, resources, sources, tips

### 6e. Get Task Statistics

```bash
curl "http://localhost:3000/api/tasks/ai-generated?stats=true" \
  -H "Authorization: Bearer $CLERK_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "total": 3,
    "byDomain": {
      "finance": 1,
      "career": 1,
      "daily_task": 1
    },
    "byStatus": {
      "not_started": 3,
      "in_progress": 0,
      "completed": 0
    },
    "recent": [
      {...5 most recent tasks...}
    ]
  }
}
```

**✅ Pass if:**
- Accurate counts by domain and status

### 6f. Update Task Status

```bash
curl -X PATCH http://localhost:3000/api/tasks/ai-generated \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{
    "task_id": "abc123-...",
    "status": "in_progress"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task status updated to in_progress"
}
```

**Console Output:**
```
✅ Task abc123-... status updated to: in_progress
```

**✅ Pass if:**
- Status updated successfully
- Can verify with GET request

### 6g. Delete Task

```bash
curl -X DELETE "http://localhost:3000/api/tasks/ai-generated?task_id=abc123-..." \
  -H "Authorization: Bearer $CLERK_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Console Output:**
```
🗑️ Task abc123-... deleted
```

**✅ Pass if:**
- Task deleted
- No longer appears in GET requests

---

## Test 7: External Tools Integration 🔧

### 7a. Test Tavily Web Search

```bash
# Should trigger web search for real-time info
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{
    "query": "What are the best neurodivergent-friendly productivity apps in 2024?"
  }'
```

**Expected:**
- Response includes recent, up-to-date information
- Sources with URLs from web search

**✅ Pass if:**
- Real-time data returned
- Sources include recent articles

### 7b. Test Finance Tools

```bash
curl -X POST http://localhost:3000/api/agent/finance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{
    "query": "What are the best budgeting tools for someone with ADHD?"
  }'
```

**Expected:**
- Specific tool recommendations (YNAB, Mint, etc.)
- URLs and descriptions

**✅ Pass if:**
- Lists 3-5 budgeting tools
- Each has URL and description

### 7c. Test Career Tools

```bash
curl -X POST http://localhost:3000/api/agent/career \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{
    "query": "Find me ADA workplace accommodation resources"
  }'
```

**Expected:**
- AskJAN.org, ADA.gov links
- Specific accommodation examples

**✅ Pass if:**
- Returns official ADA resources
- Includes accommodation types

---

## 🐛 Common Issues & Solutions

### Issue 1: 401 Unauthorized

**Cause:** Invalid or missing auth token

**Solution:**
```bash
# Make sure you're signed in
# Get new session token from browser cookies
export CLERK_TOKEN="new_token_here"
```

### Issue 2: 500 Internal Server Error

**Check Console Logs:**
```bash
# Look for errors in terminal running npm run dev
```

**Common causes:**
- Missing API key in `.env.local`
- Pinecone index doesn't exist
- Model not available in Groq

**Solutions:**
```bash
# Check all env vars are set
cat .env.local | grep -v "^#"

# Test Groq API directly
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer $GROQ_API_KEY"

# Check Pinecone index exists
# Go to pinecone.io console
```

### Issue 3: Empty Responses or No Breakdown

**Cause:** LLM might not be generating JSON correctly

**Check:**
- Console logs for JSON parse errors
- Groq API status

**Solution:**
```bash
# Check Groq status
curl https://status.groq.com

# Verify model is available
# Try with simpler query first
```

### Issue 4: No Tasks Created

**Cause:** Agent didn't generate a breakdown

**Check:**
```bash
# Look for this in console:
# "📝 AI Task stored: ..."

# If not appearing:
# 1. Query must trigger breakdown
# 2. Complexity must be high enough
# 3. Add "break it down" to query
```

**Solution:**
```bash
# Use explicit breakdown request
curl -X POST http://localhost:3000/api/query \
  -d '{"query": "Help me budget and break it down step by step"}'
```

### Issue 5: Pinecone Errors

**Cause:** Index not configured correctly

**Solution:**
```bash
# Verify index settings in Pinecone console:
# - Dimensions: 1536
# - Metric: cosine
# - Name: matches PINECONE_INDEX_NAME in .env.local
```

---

## 📊 Quick Test Script

Save this as `test-backend.sh`:

```bash
#!/bin/bash

# Set your Clerk token
export CLERK_TOKEN="your_token_here"

echo "🧪 Testing Navia Backend..."
echo ""

echo "1. Health Check..."
curl -s http://localhost:3000/api/query \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '.status'

echo ""
echo "2. Finance Query..."
curl -s -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLERK_TOKEN" \
  -d '{"query":"Help me budget"}' | jq '.domains, .taskIds'

echo ""
echo "3. Get Tasks..."
curl -s http://localhost:3000/api/tasks/ai-generated \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '.total, .groupedByDomain | keys'

echo ""
echo "4. Get Stats..."
curl -s "http://localhost:3000/api/tasks/ai-generated?stats=true" \
  -H "Authorization: Bearer $CLERK_TOKEN" | jq '.stats'

echo ""
echo "✅ Testing Complete!"
```

**Run it:**
```bash
chmod +x test-backend.sh
./test-backend.sh
```

---

## ✅ Complete Test Checklist

- [ ] Server starts without errors
- [ ] Health check returns healthy status
- [ ] User onboarding saves profile to Pinecone
- [ ] Profile retrieval works
- [ ] Finance query routes correctly and creates task
- [ ] Career query routes correctly and creates task
- [ ] Daily task query routes correctly and creates task
- [ ] Multi-domain query creates multiple tasks
- [ ] Breakdown tool generates steps
- [ ] All tasks appear in Task Visualizer API
- [ ] Tasks grouped by domain correctly
- [ ] Task status updates work
- [ ] Task deletion works
- [ ] Statistics show accurate counts
- [ ] Console logs show task creation messages
- [ ] External tools return real-time data

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Console shows: `📋 {Agent} task created: {uuid}`
2. ✅ API returns `taskIds` in responses
3. ✅ Tasks appear in `/api/tasks/ai-generated`
4. ✅ Breakdowns have 3-7 clear steps
5. ✅ Resources include real URLs
6. ✅ User profile stored in Pinecone
7. ✅ All agents return domain-specific guidance
8. ✅ No 500 errors in any endpoint

---

## 📞 Quick Debug Commands

```bash
# Check if server is running
curl http://localhost:3000

# Check Groq API
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer $GROQ_API_KEY"

# Check environment variables
env | grep -E 'GROQ|PINECONE|OPENAI|TAVILY|CLERK'

# Watch server logs
npm run dev
# Keep terminal open and watch for errors

# Test with verbose output
curl -v http://localhost:3000/api/query \
  -H "Authorization: Bearer $CLERK_TOKEN"
```

---

**All systems ready for testing!** Follow this guide to verify every backend feature. 🚀

