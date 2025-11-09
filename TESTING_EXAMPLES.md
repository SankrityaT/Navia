# Multi-Agent System Testing Examples

This document provides real-world test examples for the Navia multi-agent AI backend.

## 🧪 Test Categories

### 1. Finance Agent Tests

#### Test 1.1: Budget Creation

**Query:**
```
"Help me create a budget for this month"
```

**Expected Behavior:**
- Routes to: Finance Agent
- Breakdown: Yes (7+ steps)
- Resources: Budgeting apps (YNAB, Mint, PocketGuard)
- Complexity: 5-6/10

**Sample Response:**
```json
{
  "domain": "finance",
  "summary": "I'll help you create a budget that works for your brain...",
  "breakdown": [
    "Step 1: Gather last month's bank statements (5 min)",
    "Step 2: List all income sources...",
    "Step 3: Track expenses for one week...",
    ...
  ],
  "resources": [
    {"title": "YNAB", "type": "tool", ...},
    {"title": "Budget Template", "type": "template", ...}
  ]
}
```

#### Test 1.2: Student Benefits

**Query:**
```
"What financial aid is available for students with ADHD?"
```

**Expected Behavior:**
- Routes to: Finance Agent
- External search: Student benefits APIs
- Sources: Government websites (studentaid.gov, benefits.gov)
- Breakdown: No (informational query)

#### Test 1.3: Debt Management

**Query:**
```
"I have credit card debt and student loans, I'm overwhelmed. Break it down for me."
```

**Expected Behavior:**
- Routes to: Finance Agent
- Breakdown: Yes (triggered by "overwhelmed" and "break it down")
- Tone: Non-judgmental, supportive
- Complexity: 7-8/10

---

### 2. Career Agent Tests

#### Test 2.1: Job Search

**Query:**
```
"I need to find a job but don't know where to start"
```

**Expected Behavior:**
- Routes to: Career Agent
- Breakdown: Yes (job search is multi-step)
- Resources: LinkedIn, Indeed, job boards
- Supports: Resume templates, application tracking
- Complexity: 6-7/10

#### Test 2.2: Interview Prep

**Query:**
```
"How do I prepare for a software engineering interview?"
```

**Expected Behavior:**
- Routes to: Career Agent
- Breakdown: Yes
- Resources: Interview question banks, tech interview guides
- External search: Software engineering interview tips

#### Test 2.3: Workplace Accommodations

**Query:**
```
"What accommodations can I ask for at work for ADHD?"
```

**Expected Behavior:**
- Routes to: Career Agent
- Breakdown: No (informational)
- Resources: AskJAN.org, ADA.gov
- Sources: Workplace accommodation databases
- Specific examples: Flexible hours, quiet workspace, written instructions

#### Test 2.4: Resume Help

**Query:**
```
"My resume needs updating and I keep putting it off"
```

**Expected Behavior:**
- Routes to: Career Agent (possibly Daily Task for procrastination aspect)
- Breakdown: Yes (resume updating is multi-step)
- Acknowledgment of procrastination struggles
- Resources: ATS-friendly templates

---

### 3. Daily Task Agent Tests

#### Test 3.1: Task Initiation (Low Energy)

**Query:**
```
"I can't start anything today, I'm stuck"
```

**User Context:**
```json
{
  "energy_level": "low",
  "ef_profile": ["task_initiation", "overwhelm"]
}
```

**Expected Behavior:**
- Routes to: Daily Task Agent
- Tone: EXTRA supportive and gentle
- Breakdown: Micro-steps (3-5 very simple steps)
- Resources: 5-minute timer, body doubling
- Validates struggle: "Task initiation is genuinely hard..."

#### Test 3.2: Time Management

**Query:**
```
"I lose track of time and miss deadlines"
```

**Expected Behavior:**
- Routes to: Daily Task Agent
- Topic: Time blindness
- Resources: Visual timers, alarms, Tiimo app
- Strategies: Multiple timer types, environmental cues
- Breakdown: Setting up timer system

#### Test 3.3: Organization

**Query:**
```
"My room is a mess and I don't know how to organize it"
```

**Expected Behavior:**
- Routes to: Daily Task Agent
- Breakdown: Yes (room organization = multiple steps)
- Start point: One small area (desk corner, nightstand)
- Resources: Organization systems for ADHD
- Complexity: 5-6/10

#### Test 3.4: Focus Issues

**Query:**
```
"I can't focus on work, I keep getting distracted"
```

**Expected Behavior:**
- Routes to: Daily Task Agent
- Resources: Forest app, Focusmate, Pomodoro timers
- Strategies: Body doubling, environment changes, breaks
- Breakdown: Creating focus routine

---

### 4. Multi-Domain Tests

#### Test 4.1: Work-Life Balance

**Query:**
```
"How do I balance my job search with managing my finances?"
```

**Expected Behavior:**
- Routes to: Career + Finance Agents
- Combined response with sections for each domain
- Breakdown: Integrated steps from both domains
- Resources: Mix of career and finance tools
- Metadata: `multiAgent: true`

#### Test 4.2: Life Transition

**Query:**
```
"I just graduated and need to find a job, move out, and start budgeting"
```

**Expected Behavior:**
- Routes to: Career + Finance + Daily Task
- Three-section response
- Prioritization guidance
- Breakdown: Phased approach (career first, then housing + budget)
- Complexity: 9-10/10

#### Test 4.3: Work Stress + Organization

**Query:**
```
"My job search is stressing me out and I can't keep track of applications"
```

**Expected Behavior:**
- Routes to: Career + Daily Task
- Career: Application strategies
- Daily Task: Organization system for tracking
- Resources: Application trackers, stress management tools

---

### 5. Breakdown Tool Tests

#### Test 5.1: Direct Breakdown Request

**Query (to `/api/agent/breakdown`):**
```json
{
  "task": "Apply for 3 jobs this week",
  "userContext": {
    "ef_profile": ["task_initiation", "time_management"]
  }
}
```

**Expected Response:**
```json
{
  "breakdown": [
    "Day 1: Find 3 job postings that match your skills (20 min)",
    "Day 2: Update resume with keywords from job 1 (30 min)",
    "Day 2: Submit application to job 1 (10 min)",
    "Day 3: Customize cover letter for job 2 (25 min)",
    "Day 3: Submit application to job 2 (10 min)",
    "Day 4: Prepare materials for job 3 (30 min)",
    "Day 5: Submit application to job 3 and celebrate! (10 min)"
  ],
  "complexity": 6,
  "estimatedTime": "2-3 hours spread across week",
  "tips": [
    "Set a timer for 5 minutes to overcome task initiation",
    "Use visual timer to combat time blindness"
  ]
}
```

#### Test 5.2: Complexity Analysis

**Query (GET `/api/agent/breakdown?task=Send one email`):**

**Expected Response:**
```json
{
  "needsBreakdown": false,
  "complexity": 2,
  "reasoning": "Single, straightforward task"
}
```

---

### 6. Edge Cases & Error Handling

#### Test 6.1: Vague Query

**Query:**
```
"Help"
```

**Expected Behavior:**
- Routes to: Daily Task Agent (default)
- Response: Clarifying questions
- No breakdown
- Offers categories: "Are you looking for help with finances, career, or tasks?"

#### Test 6.2: Empty Query

**Query:**
```
""
```

**Expected Behavior:**
- HTTP 400 Bad Request
- Error: "Query is required"

#### Test 6.3: API Failure (No Internet)

**Query:**
```
"Find me budgeting resources"
```

**With Tavily API down:**

**Expected Behavior:**
- Agent still responds (uses RAG + fallback)
- Resources from Pinecone only
- Graceful degradation
- No external search results

#### Test 6.4: Unauthorized Request

**Query without auth token:**

**Expected Behavior:**
- HTTP 401 Unauthorized
- Error: "Unauthorized"

---

### 7. Context-Aware Tests

#### Test 7.1: Follow-up Question

**Initial Query:**
```
"How do I create a budget?"
```

**Follow-up Query (same user, 5 minutes later):**
```
"What about savings?"
```

**Expected Behavior:**
- Retrieves chat history
- Context-aware response referencing previous budget discussion
- Suggests: "Now that we've covered your budget, let's add a savings category..."

#### Test 7.2: Energy Level Adaptation

**Same query, different energy levels:**

**High Energy:**
```json
{
  "query": "Help me organize my tasks",
  "userContext": {"energy_level": "high"}
}
```
→ Detailed breakdown, multiple strategies

**Low Energy:**
```json
{
  "query": "Help me organize my tasks",
  "userContext": {"energy_level": "low"}
}
```
→ Simplified (3 steps max), emphasis on rest, gentle tone

---

### 8. Integration Test Script

Run this sequence to test full system:

```bash
# 1. Health check
curl http://localhost:3000/api/query

# 2. Finance test
curl -X POST http://localhost:3000/api/query \
  -d '{"query":"Help me budget"}'

# 3. Career test
curl -X POST http://localhost:3000/api/query \
  -d '{"query":"I need interview tips"}'

# 4. Daily task test
curl -X POST http://localhost:3000/api/query \
  -d '{"query":"I feel stuck and overwhelmed"}'

# 5. Multi-domain test
curl -X POST http://localhost:3000/api/query \
  -d '{"query":"Balance job search and finances"}'

# 6. Breakdown test
curl -X POST http://localhost:3000/api/agent/breakdown \
  -d '{"task":"Apply for jobs this week"}'
```

---

## ✅ Success Criteria

For each test, verify:

1. **Correct routing**: Query goes to appropriate agent(s)
2. **Breakdown logic**: Complex tasks get broken down
3. **Resource quality**: Relevant, helpful resources returned
4. **Tone consistency**: Neurodivergent-friendly, supportive language
5. **Context awareness**: Chat history influences responses
6. **Error handling**: Graceful failures, helpful error messages
7. **Performance**: Responses within 3-5 seconds
8. **Metadata**: Correct complexity scores, confidence levels

---

## 📊 Expected Metrics

- **Intent Detection Accuracy**: >85%
- **Response Time**: <5s average
- **Breakdown Trigger Accuracy**: >80%
- **Resource Relevance**: >75% helpful (user feedback)
- **Multi-Agent Coordination**: 100% success on appropriate queries

---

**Last Updated**: During implementation
**Next Review**: After first week of production use

