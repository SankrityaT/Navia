# Task Visualizer - Quick Reference

## ✅ What's Ready

The **Task Visualizer** backend is fully implemented and operational. When AI agents generate breakdowns, tasks are automatically created, stored, and retrievable by the frontend.

---

## 🚀 Quick Start

### For Frontend Developers

**Get all AI-generated tasks:**
```typescript
const response = await fetch('/api/tasks/ai-generated');
const { tasks, groupedByDomain } = await response.json();

// Use grouped data for tabs
const financeTasks = groupedByDomain.finance;    // Finance tab
const careerTasks = groupedByDomain.career;      // Career tab  
const dailyTasks = groupedByDomain.daily_task;   // Daily Task tab
```

**Get tasks for one domain:**
```typescript
const response = await fetch('/api/tasks/ai-generated?domain=finance');
const { tasks } = await response.json();
```

**Get specific task details:**
```typescript
const response = await fetch(`/api/tasks/ai-generated?task_id=${taskId}`);
const { task } = await response.json();

// Display:
// - task.title
// - task.summary
// - task.breakdown[] (steps)
// - task.resources[] (tools/links)
// - task.sources[] (references)
// - task.metadata.tips[]
```

**Update task status:**
```typescript
await fetch('/api/tasks/ai-generated', {
  method: 'PATCH',
  body: JSON.stringify({
    task_id: taskId,
    status: 'in_progress' // or 'completed'
  })
});
```

**Get statistics:**
```typescript
const response = await fetch('/api/tasks/ai-generated?stats=true');
const { stats } = await response.json();

// stats.total
// stats.byDomain.finance
// stats.byStatus.completed
```

---

## 📊 Task Data Structure

```typescript
{
  task_id: "a1b2c3d4-e5f6-...",     // UUID v4
  domain: "finance",                 // or "career", "daily_task"
  title: "Create a budget",
  summary: "I'll help you create a budget...",
  breakdown: [
    "Step 1: Gather bank statements (5 min)",
    "Step 2: List income sources (10 min)",
    ...
  ],
  status: "not_started",            // or "in_progress", "completed"
  complexity: 6,                     // 0-10
  created_at: "2024-11-09T10:30:00.000Z",
  created_by_agent: "finance_agent",
  original_query: "Help me create a budget",
  resources: [
    { title: "YNAB", url: "...", type: "tool" }
  ],
  sources: [
    { title: "Budgeting Guide", url: "...", excerpt: "..." }
  ],
  metadata: {
    confidence: 0.85,
    estimatedTime: "2-3 hours",
    tips: ["Start with just one week...", ...]
  }
}
```

---

## 🎨 UI Components Needed

### 1. TaskVisualizer (Main Component)
```tsx
<TaskVisualizer>
  <Tabs>
    <Tab label="💰 Finance" />
    <Tab label="💼 Career" />
    <Tab label="✅ Daily Tasks" />
  </Tabs>
</TaskVisualizer>
```

### 2. TaskList (Per Domain)
```tsx
<TaskList domain="finance">
  {financeTasks.map(task => (
    <TaskCard key={task.task_id} task={task} />
  ))}
</TaskList>
```

### 3. TaskCard
```tsx
<TaskCard>
  <Header>
    <Title>{task.title}</Title>
    <StatusBadge status={task.status} />
  </Header>
  <Summary>{task.summary}</Summary>
  <StepCount>{task.breakdown.length} steps</StepCount>
  <Actions>
    <ViewDetails onClick={() => openModal(task)} />
    <MarkInProgress onClick={() => updateStatus('in_progress')} />
    <MarkComplete onClick={() => updateStatus('completed')} />
  </Actions>
</TaskCard>
```

### 4. TaskDetailModal
```tsx
<Modal>
  <Title>{task.title}</Title>
  <Summary>{task.summary}</Summary>
  
  <Breakdown>
    {task.breakdown.map((step, i) => (
      <Step key={i}>{i + 1}. {step}</Step>
    ))}
  </Breakdown>
  
  <Resources>
    {task.resources.map(resource => (
      <ResourceLink href={resource.url}>
        {resource.title}
      </ResourceLink>
    ))}
  </Resources>
  
  <Tips>
    {task.metadata.tips?.map(tip => (
      <Tip>{tip}</Tip>
    ))}
  </Tips>
</Modal>
```

---

## 🔄 Automatic Task Creation

Tasks are **automatically created** when agents generate breakdowns:

```
User asks: "Help me budget"
    ↓
Finance Agent generates breakdown
    ↓
Backend auto-creates task
    ↓
Console: 📋 Finance task created: {uuid}
    ↓
Returns taskId to frontend
```

**No manual task creation needed!**

---

## 📋 API Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/tasks/ai-generated` | GET | Get all tasks or filter by domain | ✅ Yes |
| `/api/tasks/ai-generated?domain=finance` | GET | Get finance tasks only | ✅ Yes |
| `/api/tasks/ai-generated?task_id={id}` | GET | Get specific task | ✅ Yes |
| `/api/tasks/ai-generated?stats=true` | GET | Get statistics | ✅ Yes |
| `/api/tasks/ai-generated` | PATCH | Update task status | ✅ Yes |
| `/api/tasks/ai-generated?task_id={id}` | DELETE | Delete task | ✅ Yes |

---

## 🎯 Key Features for Frontend

### 1. Three-Tab Layout
- **Finance**: All finance-related tasks
- **Career**: Job search, interviews, resume tasks
- **Daily Task**: Organization, focus, routine tasks

### 2. Task Status Badges
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed

### 3. Quick Actions
- **View Details**: Open modal with full breakdown
- **Start Task**: Mark as in_progress
- **Complete**: Mark as completed
- **Delete**: Remove task

### 4. Task Details
- **Title**: Short description
- **Summary**: AI's full response
- **Breakdown**: Numbered steps
- **Resources**: Links to tools/apps
- **Sources**: Reference articles
- **Tips**: Helpful advice from AI
- **Complexity**: Visual indicator (e.g., 6/10 stars)
- **Created Date**: When task was generated

### 5. Statistics Display
- Total tasks
- Tasks by domain (Finance: 5, Career: 7, Daily: 3)
- Tasks by status (Not started: 8, In progress: 5, Completed: 2)
- Recent tasks

---

## 💡 Example User Flow

1. **User chats with AI**: "I need to prepare for a job interview"

2. **AI generates breakdown**:
   ```
   Step 1: Research the company (30 min)
   Step 2: Prepare answers to common questions (1 hour)
   Step 3: Practice mock interview (45 min)
   Step 4: Prepare questions to ask interviewer (20 min)
   Step 5: Choose professional outfit (15 min)
   ```

3. **Task auto-created** with UUID: `b2c3d4e5-...`

4. **User opens Task Visualizer** → **Career tab**

5. **Sees task card**:
   ```
   📋 Prepare for a job interview
   🟡 In Progress
   5 steps • Medium complexity
   Created: 2 hours ago
   [View Details] [Mark Complete]
   ```

6. **Clicks "View Details"** → Modal opens:
   ```
   Prepare for a job interview
   
   I'll help you prepare systematically...
   
   Steps:
   1. Research the company (30 min)
   2. Prepare answers to common questions (1 hour)
   ...
   
   Resources:
   🔗 Common Interview Questions Guide
   🔗 STAR Method Tutorial
   
   Tips:
   💡 Focus on 2-3 stories you can adapt
   💡 Practice out loud, not just in your head
   ```

7. **Clicks "Mark Complete"** → Status updated, card turns green

---

## 🧪 Testing

```bash
# 1. Generate tasks
curl -X POST http://localhost:3000/api/query \
  -d '{"query":"Help me budget and find a job"}'

# Console shows:
# 📋 Finance task created: {uuid1}
# 📋 Career task created: {uuid2}

# 2. Retrieve tasks
curl http://localhost:3000/api/tasks/ai-generated

# 3. Get statistics
curl "http://localhost:3000/api/tasks/ai-generated?stats=true"

# 4. Update status
curl -X PATCH http://localhost:3000/api/tasks/ai-generated \
  -d '{"task_id":"uuid1","status":"completed"}'
```

---

## 📦 Files to Reference

- **Full Documentation**: `TASK_VISUALIZER_IMPLEMENTATION.md`
- **Storage Logic**: `lib/tasks/ai-task-storage.ts`
- **API Route**: `app/api/tasks/ai-generated/route.ts`
- **Agent Integration**: `app/api/agent/{finance|career|daily-task}/route.ts`

---

## ⚠️ Important Notes

### Storage Type
- **In-memory (Map-based)**: Fast, simple
- **Resets on restart**: Tasks don't persist between deployments
- **Max 100 tasks/user**: Oldest auto-removed
- **Scales to Redis/DB**: Easy migration path

### Security
- **Clerk auth required**: All endpoints protected
- **User isolation**: Users only see their own tasks
- **No sensitive data**: Tasks are AI responses, not private info

### Performance
- **Fast retrieval**: <1ms for in-memory lookups
- **Filtered queries**: O(n) where n = tasks per user
- **No database**: No query overhead

---

## ✅ Implementation Complete

**Backend ready:**
- ✅ Automatic task capture from all 3 agents
- ✅ UUID v4 task IDs
- ✅ Domain tagging (finance, career, daily_task)
- ✅ In-memory storage with CRUD operations
- ✅ Status tracking (not_started, in_progress, completed)
- ✅ Rich metadata (resources, sources, tips)
- ✅ Statistics endpoint
- ✅ Full authentication

**Frontend TODO:**
- Create TaskVisualizer component
- Fetch and display tasks by domain
- Implement task detail modal
- Add status update buttons
- Show statistics dashboard

---

**All systems operational! The Task Visualizer backend is ready for frontend integration.** 🚀

