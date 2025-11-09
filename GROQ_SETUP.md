# GROQ AI + PINECONE SETUP FOR NAVIA

## Why Groq?
✅ **10x faster** than OpenAI GPT-4
✅ **Much cheaper** (often free tier available)
✅ **Same API format** as OpenAI (easy swap)
✅ **Great for hackathons** - fast responses, low cost

## Architecture
- **Groq**: Chat completions (personas, function calling)
- **OpenAI**: Embeddings only (Groq doesn't do embeddings yet)
- **Pinecone**: Vector storage and retrieval

---

## Step 1: Set Up Groq (2 minutes)

### Get Groq API Key
1. Go to https://console.groq.com/
2. Sign up (free)
3. Go to "API Keys"
4. Create new key
5. Copy the key

### Add to .env.local
```env
# Groq AI (for chat)
GROQ_API_KEY=gsk_your_groq_key_here

# OpenAI (for embeddings only)
OPENAI_API_KEY=sk_your_openai_key_here

# Pinecone (for vector storage)
PINECONE_API_KEY=your_pinecone_key_here
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=navia-users
```

---

## Step 2: Set Up Pinecone Index (5 minutes)

### Create Index for Navia
1. Go to https://www.pinecone.io/
2. Sign up (free tier: 100K vectors)
3. Click "Create Index"
4. Configure:

```
Name: navia-users
Dimensions: 1024
Metric: cosine
Pod Type: s1.x1 (starter)
```

### Why These Settings?
- **1024 dimensions**: Pinecone's `llama-text-embed-v2` output size (faster than OpenAI!)
- **cosine metric**: Best for semantic similarity
- **s1.x1**: Free tier, perfect for hackathon

### Using Pinecone's Inference API
✅ **No OpenAI needed** - Pinecone handles embeddings
✅ **Faster** - Integrated with Pinecone
✅ **Free** - Included with Pinecone account
✅ **1024 dims** - Smaller vectors = faster queries

### What Gets Stored in Pinecone?

#### 1. User Profiles
```json
{
  "id": "profile_user123",
  "values": [0.123, 0.456, ...], // 1024 dimensions
  "metadata": {
    "user_id": "user123",
    "type": "profile",
    "name": "Sarah",
    "ef_profile": ["task_initiation", "time_management"],
    "current_goals": ["job_searching", "managing_finances"],
    "graduation_date": "2024-05",
    "university": "Stanford"
  }
}
```

#### 2. Tasks
```json
{
  "id": "task_456",
  "values": [0.789, 0.012, ...],
  "metadata": {
    "user_id": "user123",
    "type": "task",
    "title": "Update resume",
    "status": "in_progress",
    "priority": "high",
    "category": "career",
    "time_estimate": 45,
    "created_at": "2025-11-08",
    "created_by": "career_persona"
  }
}
```

#### 3. Chat Messages (for context)
```json
{
  "id": "chat_789",
  "values": [0.345, 0.678, ...],
  "metadata": {
    "user_id": "user123",
    "type": "chat_message",
    "persona": "career",
    "message": "I need help with my resume",
    "timestamp": "2025-11-08T10:30:00Z"
  }
}
```

#### 4. Peer Profiles
```json
{
  "id": "peer_user456",
  "values": [0.901, 0.234, ...],
  "metadata": {
    "user_id": "user456",
    "type": "peer_profile",
    "name": "Alex",
    "neurotype": ["ADHD", "anxiety"],
    "current_struggles": ["job_searching", "time_management"],
    "career_field": "software_engineering",
    "interests": ["coding", "gaming"],
    "months_post_grad": 6
  }
}
```

#### 5. Knowledge Base (resources)
```json
{
  "id": "resource_101",
  "values": [0.567, 0.890, ...],
  "metadata": {
    "type": "resource",
    "category": "career",
    "title": "Resume Template for ADHD Job Seekers",
    "url": "https://example.com/resume-template",
    "description": "Clean, ATS-friendly resume format",
    "format": "template"
  }
}
```

---

## Step 3: Install Groq SDK

```bash
npm install groq-sdk
```

---

## Step 4: Create Groq Client

Create `lib/groq/client.ts`:

```typescript
import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

export const getGroqClient = () => {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });
  }
  return groqClient;
};

// Chat completion with Groq
export async function groqChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = 'llama-3.1-70b-versatile' // Fast and smart
) {
  const client = getGroqClient();
  
  const response = await client.chat.completions.create({
    model,
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return response.choices[0];
}

// Streaming chat (super fast with Groq!)
export async function groqStreamChat(
  messages: Array<{ role: string; content: string }>,
  onChunk: (text: string) => void
) {
  const client = getGroqClient();
  
  const stream = await client.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: messages as any,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) onChunk(content);
  }
}
```

---

## Step 5: Update Chat API to Use Groq

Update `app/api/chat/route.ts`:

```typescript
import { groqChatCompletion } from '@/lib/groq/client';
import { generateEmbedding } from '@/lib/openai/client'; // Still use OpenAI for embeddings

// ... existing code ...

// Replace OpenAI chat call with Groq
const response = await groqChatCompletion([
  { role: 'system', content: systemPrompt },
  { role: 'user', content: message },
]);
```

---

## Step 6: Pinecone Query Examples

### Query 1: Get User's Tasks
```typescript
import { getIndex } from '@/lib/pinecone/client';
import { generateEmbedding } from '@/lib/openai/client';

const index = getIndex();

// Create query embedding
const queryEmbedding = await generateEmbedding("today's high priority tasks");

// Query Pinecone
const results = await index.query({
  vector: queryEmbedding,
  filter: {
    user_id: { $eq: userId },
    type: { $eq: 'task' },
    status: { $ne: 'completed' },
    priority: { $in: ['high', 'medium'] }
  },
  topK: 10,
  includeMetadata: true
});
```

### Query 2: Find Similar Peers
```typescript
// User's profile embedding
const userProfileText = `${struggles.join(' ')} ${interests.join(' ')}`;
const embedding = await generateEmbedding(userProfileText);

// Find similar peers
const matches = await index.query({
  vector: embedding,
  filter: {
    type: { $eq: 'peer_profile' },
    user_id: { $ne: userId } // Exclude self
  },
  topK: 10,
  includeMetadata: true
});
```

### Query 3: Get Chat Context
```typescript
// Get recent chat history for context
const chatEmbedding = await generateEmbedding(userMessage);

const context = await index.query({
  vector: chatEmbedding,
  filter: {
    user_id: { $eq: userId },
    type: { $eq: 'chat_message' }
  },
  topK: 5,
  includeMetadata: true
});
```

---

## Groq Models Available

### For Chat (Choose One)
- **llama-3.1-70b-versatile** (Recommended) - Best balance
- **llama-3.1-8b-instant** - Fastest, good for simple tasks
- **mixtral-8x7b-32768** - Long context window

### Model Comparison
| Model | Speed | Intelligence | Context | Best For |
|-------|-------|--------------|---------|----------|
| llama-3.1-70b | Fast | High | 8K | Navia personas |
| llama-3.1-8b | Fastest | Good | 8K | Quick responses |
| mixtral-8x7b | Fast | High | 32K | Long conversations |

---

## Cost Comparison

### Groq (Free Tier)
- 30 requests/minute
- Enough for hackathon testing
- **Cost: $0** for testing

### OpenAI (Embeddings Only)
- text-embedding-ada-002: $0.0001 per 1K tokens
- ~1000 embeddings = $0.10
- **Cost: ~$1-2** for hackathon

### Pinecone (Free Tier)
- 100K vectors
- 1 index
- **Cost: $0** for hackathon

**Total: ~$1-2 for entire hackathon!**

---

## Testing the Setup

### 1. Test Groq Connection
```bash
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-70b-versatile",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### 2. Test Pinecone Connection
```bash
curl -X GET "https://navia-users-<project-id>.svc.<environment>.pinecone.io/describe_index_stats" \
  -H "Api-Key: $PINECONE_API_KEY"
```

### 3. Test Full Flow
1. Complete onboarding → stores in Pinecone
2. Go to `/chat` → Groq responds
3. Ask to break down task → creates tasks in Pinecone
4. Go to `/tasks` → see tasks from Pinecone

---

## Advantages of Groq + Pinecone

✅ **Speed**: Groq is 10x faster than GPT-4
✅ **Cost**: Almost free for hackathon
✅ **Scalability**: Pinecone handles millions of vectors
✅ **Flexibility**: Easy to swap models
✅ **Semantic Search**: Pinecone finds relevant context
✅ **Personalization**: User-specific vector storage

---

## Next Steps

1. ✅ Get Groq API key
2. ✅ Create Pinecone index
3. ✅ Install groq-sdk: `npm install groq-sdk`
4. ✅ Create `lib/groq/client.ts`
5. ✅ Update chat API to use Groq
6. ✅ Test onboarding → Pinecone storage
7. ✅ Test chat → Groq responses
8. ✅ Test peer matching → Pinecone similarity

Ready to implement? Let me know!
