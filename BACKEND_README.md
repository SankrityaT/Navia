# NAVIA - BACKEND IMPLEMENTATION GUIDE

## Overview
Backend handles API routes, Pinecone vector DB operations, and OpenAI integration for AI-powered task management.

## Tech Stack
- **Runtime**: Next.js API Routes (Edge/Node)
- **Vector DB**: Pinecone (user data, tasks, profiles)
- **AI**: OpenAI GPT-4 (embeddings + chat)
- **Auth**: Clerk (user management)

## Project Structure
```
app/api/
├── onboarding/route.ts         # Save user profile (DONE)
├── dashboard/
│   └── energy/route.ts         # Save daily energy (DONE)
└── tasks/route.ts              # CRUD for tasks (DONE)

lib/
├── pinecone/
│   ├── client.ts               # Pinecone initialization (DONE)
│   └── operations.ts           # Vector operations (NEEDS WORK)
├── openai/
│   └── client.ts               # OpenAI client (DONE)
└── types.ts                    # TypeScript types (DONE)
```

## Critical Tasks to Implement

### 1. Pinecone Setup
**Status**: Client initialized, needs configuration

#### Create Pinecone Index
```bash
# In Pinecone console:
# 1. Create index named "navia-users"
# 2. Dimensions: 1536 (OpenAI ada-002 embeddings)
# 3. Metric: cosine
# 4. Pod type: s1 (starter) or p1 (production)
```

#### Configure Metadata Filtering
Add these metadata fields to support queries:
- `user_id` (string) - Filter by user
- `type` (string) - "task" | "profile" | "energy" | "goal"
- `status` (string) - "not_started" | "in_progress" | "completed"
- `priority` (string) - "low" | "medium" | "high"
- `category` (string) - "career" | "finance" | "daily_life" | "social"
- `date` (string) - ISO date for time-based queries
- `time_estimate` (number) - Task duration in minutes

### 2. Pinecone Operations (lib/pinecone/operations.ts)
**Status**: Skeleton complete, needs implementation

#### Fix `updateTaskStatus` Function
```typescript
// TODO: Implement this properly
export async function updateTaskStatus(taskId: string, status: string) {
  const index = getIndex();
  
  // 1. Fetch existing vector and metadata
  const fetchResponse = await index.fetch([taskId]);
  const existing = fetchResponse.records[taskId];
  
  if (!existing) throw new Error('Task not found');
  
  // 2. Update metadata
  const updatedMetadata = {
    ...existing.metadata,
    status,
  };
  
  // 3. Upsert with same vector
  await index.upsert([{
    id: taskId,
    values: existing.values,
    metadata: updatedMetadata as any,
  }]);
}
```

#### Add Batch Operations
```typescript
// For performance when dealing with multiple tasks
export async function batchStoreTasks(tasks: Task[], embeddings: number[][]) {
  const index = getIndex();
  const vectors = tasks.map((task, i) => ({
    id: task.task_id,
    values: embeddings[i],
    metadata: { type: 'task', ...task } as any,
  }));
  await index.upsert(vectors);
}
```

#### Add Error Handling
- Wrap all operations in try-catch
- Implement retry logic for transient failures
- Log errors properly
- Return meaningful error messages

### 3. OpenAI Integration (lib/openai/client.ts)
**Status**: Basic functions complete, needs enhancement

#### Implement Function Calling for Task Breakdown
```typescript
// Example: Break down "Find a job" into subtasks
const functions = [
  {
    name: 'create_task_breakdown',
    description: 'Break down a complex task into smaller subtasks',
    parameters: {
      type: 'object',
      properties: {
        subtasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              time_estimate: { type: 'number' },
              priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            },
          },
        },
      },
    },
  },
];
```

#### Add Streaming Support
```typescript
export async function streamChatCompletion(
  messages: Array<{ role: string; content: string }>,
  onChunk: (text: string) => void
) {
  const client = getOpenAIClient();
  const stream = await client.chat.completions.create({
    model: 'gpt-4',
    messages: messages as any,
    stream: true,
  });
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) onChunk(content);
  }
}
```

#### Implement Rate Limiting
- Track API calls per user
- Implement exponential backoff
- Cache embeddings when possible

### 4. API Routes

#### `/api/onboarding` (app/api/onboarding/route.ts)
**Status**: Basic implementation done
- [ ] Add input validation (zod schema)
- [ ] Handle duplicate onboarding attempts
- [ ] Return proper error codes
- [ ] Add logging

#### `/api/dashboard/energy` (app/api/dashboard/energy/route.ts)
**Status**: Basic implementation done
- [ ] Validate energy level range
- [ ] Check for duplicate entries (same user + date)
- [ ] Return historical energy data on GET

#### `/api/tasks` (app/api/tasks/route.ts)
**Status**: CRUD skeleton done, needs work
- [ ] Implement proper query filtering
- [ ] Add pagination for large result sets
- [ ] Validate task data on POST
- [ ] Implement task dependencies logic
- [ ] Add bulk operations endpoints
- [ ] Implement task search by text

### 5. AI Personas (NEW - Not in skeleton)
Create different AI personas for different goals:

```typescript
// lib/openai/personas.ts
export const CAREER_PERSONA = {
  system_prompt: `You are a career coach for neurodivergent young adults...`,
  functions: [/* task breakdown, resume help, etc */],
};

export const FINANCE_PERSONA = {
  system_prompt: `You are a financial advisor specializing in...`,
  functions: [/* budget creation, expense tracking, etc */],
};
```

### 6. Query Optimization

#### Dashboard Queries
```typescript
// Get today's priority tasks
const today = new Date().toISOString().split('T')[0];
const priorityTasks = await queryTasks(
  userId,
  await generateEmbedding("today's high priority tasks"),
  {
    date: { $eq: today },
    priority: { $in: ['high', 'medium'] },
    status: { $ne: 'completed' },
  },
  3
);

// Get quick wins (< 10 min)
const quickWins = await queryTasks(
  userId,
  await generateEmbedding("quick tasks under 10 minutes"),
  {
    time_estimate: { $lt: 10 },
    status: { $eq: 'not_started' },
  },
  3
);
```

#### Progress Calculation
```typescript
// Count completed vs total tasks per goal
export async function getGoalProgress(userId: string, category: string) {
  const allTasks = await queryTasks(
    userId,
    await generateEmbedding(`${category} tasks`),
    { category: { $eq: category } },
    100
  );
  
  const completed = allTasks.filter(t => t.metadata?.status === 'completed').length;
  return { completed, total: allTasks.length };
}
```

## Environment Variables Required
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Pinecone
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-east-1-aws (or your region)
PINECONE_INDEX_NAME=navia-users

# OpenAI
OPENAI_API_KEY=sk-...
```

## Data Flow Example

### Creating a Task
1. User submits task via frontend
2. POST /api/tasks receives data
3. Validate task data
4. Generate embedding: `await generateEmbedding(task.title + task.category)`
5. Store in Pinecone: `await storeTask(task, embedding)`
6. Return success to frontend

### Querying Tasks
1. Frontend requests tasks with filters
2. GET /api/tasks?status=in_progress&category=career
3. Generate query embedding
4. Query Pinecone with filters
5. Return matched tasks (sorted by relevance)

### Updating Task Status (Drag & Drop)
1. User drags task to "Completed" column
2. Frontend calls PATCH /api/tasks
3. Fetch existing task from Pinecone
4. Update status in metadata
5. Upsert back to Pinecone
6. Return success

## Performance Considerations
- **Embeddings**: Cache frequently used embeddings
- **Batch Operations**: Use batch upsert for multiple tasks
- **Pagination**: Limit query results to 50 max
- **Indexing**: Ensure metadata fields are indexed in Pinecone
- **Rate Limits**: Implement request throttling

## Error Handling Patterns
```typescript
try {
  // Operation
} catch (error) {
  console.error('Operation failed:', error);
  
  if (error instanceof PineconeError) {
    return NextResponse.json(
      { error: 'Database error' },
      { status: 503 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## Testing Checklist
- [ ] Pinecone index created and configured
- [ ] All environment variables set
- [ ] Onboarding saves to both Clerk and Pinecone
- [ ] Tasks can be created, read, updated, deleted
- [ ] Embeddings generate correctly
- [ ] Metadata filtering works
- [ ] Energy levels save properly
- [ ] API returns proper error codes
- [ ] No API key leaks in responses

## Monitoring & Logging
- Log all Pinecone operations
- Track OpenAI token usage
- Monitor API response times
- Set up error alerting

## Security Notes
- Never expose API keys to frontend
- Validate all user inputs
- Check user authentication on every API route
- Sanitize data before storing
- Use Clerk's user_id for all queries (prevent data leaks)

## Next Steps After Skeleton
1. Set up Pinecone index
2. Test embedding generation
3. Implement updateTaskStatus properly
4. Add comprehensive error handling
5. Create AI personas for different goals
6. Implement chat/conversation storage
7. Add task dependency logic
8. Build recommendation engine
