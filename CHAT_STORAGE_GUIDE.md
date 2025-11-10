# Chat Storage Architecture 💬

## Overview

Navia uses a **dual-storage approach** for chat messages:
- **Supabase** (PostgreSQL): Primary database for chat history storage
- **Pinecone** (Vector DB): Semantic search with embeddings

This architecture provides:
✅ Reliable relational storage in Supabase
✅ Fast semantic retrieval from Pinecone
✅ Easy frontend integration with SQL queries
✅ Row-level security and real-time capabilities

---

## 📊 Database Schema (Supabase)

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,                    -- User's question
  response TEXT NOT NULL,                    -- AI's response
  category TEXT NOT NULL CHECK (category IN ('finance', 'career', 'daily_task')),
  persona TEXT NOT NULL,                     -- Which agent handled it
  metadata JSONB,                            -- Additional context
  pinecone_id TEXT,                          -- Link to Pinecone vector
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, created_at DESC);
CREATE INDEX idx_chat_messages_category ON chat_messages(category);
```

---

## 🔄 Storage Flow

### When a user sends a message:

```
1. User sends query → /api/query
                ↓
2. AI Orchestrator processes query
                ↓
3. Generate AI response
                ↓
4. Store in BOTH databases:
   ├─ Pinecone: Store with embedding (semantic search)
   └─ Supabase: Store as primary record (SQL queries)
```

### Implementation in `/app/api/query/route.ts`:

```typescript
// 1. Store in Pinecone (with embedding for semantic search)
await storeChatMessage(
  userId,
  query,
  responseText,
  {
    category: primaryDomain,
    persona: 'orchestrator',
    complexity: result.metadata.complexity,
    hadBreakdown: result.metadata.usedBreakdown,
  }
);

// 2. Store in Supabase (as primary database)
await storeInSupabase({
  user_id: userId,
  message: query,
  response: responseText,
  category: primaryDomain,
  persona: 'orchestrator',
  metadata: {
    complexity: result.metadata.complexity,
    hadBreakdown: result.metadata.usedBreakdown,
    domains: result.metadata.domainsInvolved,
    executionTime: result.metadata.executionTime,
  },
  pinecone_id: pineconeId,  // Reference to Pinecone vector
});
```

---

## 📤 Retrieval Methods

### Method 1: Fetch from Supabase (for display)

**Use case:** Display chat history, show past conversations

```typescript
// API: GET /api/chat/history
const response = await fetch('/api/chat/history?limit=50&category=finance');
const { chatHistory } = await response.json();

// Returns:
[
  {
    id: "uuid-here",
    user_id: "user_2abc123",
    message: "How do I save money?",
    response: "Here are some tips...",
    category: "finance",
    persona: "orchestrator",
    metadata: { complexity: 3, hadBreakdown: false },
    pinecone_id: "chat_user_2abc123_1234567890",
    created_at: "2024-01-15T10:30:00Z"
  },
  // ... more messages
]
```

### Method 2: Semantic Search via Pinecone (for AI context)

**Use case:** Find relevant past conversations for current query

```typescript
// Used internally by AI agents
const semanticMatches = await retrieveRelevantContext(
  userId, 
  query, 
  primaryDomain, 
  3  // Top 3 most relevant
);
```

---

## 💡 Chat Message Format

### Supabase Storage Format

```typescript
interface ChatMessage {
  id: string;                    // UUID (auto-generated)
  user_id: string;               // Clerk user ID
  message: string;               // User's question/query
  response: string;              // AI's complete response
  category: 'finance' | 'career' | 'daily_task';
  persona: string;               // 'orchestrator', 'finance_agent', etc.
  metadata: {                    // JSONB field
    complexity?: number;         // 1-10 scale
    hadBreakdown?: boolean;      // Did we provide steps?
    domains?: string[];          // Which agents were involved
    executionTime?: number;      // Processing time in ms
    [key: string]: any;          // Extensible
  };
  pinecone_id?: string;          // Reference to Pinecone vector
  created_at: string;            // ISO timestamp
}
```

### Frontend Display Format

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  persona?: string;
  personaIcon?: string;
  timestamp: Date;
  breakdown?: string[];
  resources?: Array<{ title: string; url: string }>;
  sources?: Array<{ title: string; url: string; excerpt?: string }>;
}
```

### AI Context Format (for LLM)

```typescript
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  // ONLY 2 fields! Clean format for LLM
}
```

---

## 🔧 API Endpoints

### Store Chat (Automatic)
- **Endpoint:** Called internally after `/api/query`
- **Method:** Automatic during chat processing
- **Storage:** Both Supabase + Pinecone

### Retrieve Chat History
- **Endpoint:** `GET /api/chat/history`
- **Query params:**
  - `limit`: Number of messages (default: 50)
  - `category`: Filter by category (optional)
- **Response:**
  ```json
  {
    "success": true,
    "chatHistory": [...],
    "stats": {
      "totalChats": 45,
      "byCategory": {
        "finance": 15,
        "career": 20,
        "daily_task": 10
      },
      "recentActivity": [...]
    },
    "count": 45
  }
  ```

---

## 🎯 Benefits of Dual Storage

### Supabase (Primary Storage)
✅ **Reliable storage**: PostgreSQL with ACID compliance
✅ **SQL queries**: Easy filtering, sorting, pagination
✅ **Row-level security**: Automatic user isolation
✅ **Real-time subscriptions**: Future live chat updates
✅ **Relationships**: Foreign keys to user profiles
✅ **Backups**: Automatic Supabase backups

### Pinecone (Semantic Search)
✅ **Embedding storage**: Vector representations
✅ **Similarity search**: Find relevant past conversations
✅ **Fast retrieval**: Optimized for semantic queries
✅ **AI context**: Provide relevant history to LLM

---

## 🔐 Security

### Row Level Security (RLS)

```sql
-- Users can only see their own chat messages
CREATE POLICY "Users can view own chat messages" ON chat_messages
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can create own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');
```

### API Protection
- All endpoints require Clerk authentication
- User ID from auth token (not from request body)
- Automatic user isolation via RLS policies

---

## 📈 Retrieval Strategies

### Hybrid Retrieval (Current Implementation)

```typescript
// 1. Detect primary domain from query
const primaryDomain = await detectIntent(query);

// 2. Get top 3 semantic matches (filtered by domain)
const semanticMatches = await retrieveRelevantContext(
  userId, 
  query, 
  primaryDomain, 
  3
);

// 3. Get full chronological history (filtered by domain)
const fullHistory = await retrieveChatHistory(
  userId, 
  1000, 
  primaryDomain
);

// 4. Combine: Semantic first, then chronological
const conversationHistory = [
  ...semanticMatches.map(/* format */),
  ...chronologicalHistory.map(/* format */),
];
```

**Why this works:**
- ⭐ **Semantic matches** at the top (most relevant to current query)
- 📅 **Chronological history** follows (for temporal context)
- 🎯 **Domain filtering** keeps context focused
- 💡 **Deduplication** prevents showing same message twice

---

## 🚀 Usage Examples

### Store a Chat Message

```typescript
// Automatic in /api/query - no manual call needed
```

### Retrieve Chat History

```typescript
// In your React component
const fetchChatHistory = async () => {
  const response = await fetch('/api/chat/history?limit=100');
  const { chatHistory } = await response.json();
  
  // Transform for display
  const messages = chatHistory.flatMap(chat => [
    {
      id: `${chat.id}-user`,
      role: 'user',
      content: chat.message,
      timestamp: new Date(chat.created_at),
    },
    {
      id: `${chat.id}-assistant`,
      role: 'assistant',
      content: chat.response,
      persona: chat.category,
      timestamp: new Date(chat.created_at),
    },
  ]);
  
  setMessages(messages);
};
```

### Get Statistics

```typescript
const response = await fetch('/api/chat/history?limit=1000');
const { stats } = await response.json();

console.log(`Total chats: ${stats.totalChats}`);
console.log(`Finance: ${stats.byCategory.finance}`);
console.log(`Career: ${stats.byCategory.career}`);
```

---

## 🔄 Migration Path

If you have existing Pinecone-only data:

1. **Query Pinecone** for all user chat messages
2. **Insert into Supabase** with proper formatting
3. **Link Pinecone IDs** in the `pinecone_id` column
4. **Verify** data integrity

---

## 📝 Best Practices

1. ✅ **Always store in both databases** (Supabase + Pinecone)
2. ✅ **Use Supabase for display** (faster, more reliable)
3. ✅ **Use Pinecone for semantic search** (find relevant context)
4. ✅ **Include metadata** (helps with analytics and debugging)
5. ✅ **Filter by category** (keeps context focused)
6. ✅ **Limit query results** (pagination for large histories)

---

## 🎉 Summary

**Storage:** Supabase (primary) + Pinecone (semantic search)
**Format:** Clean JSONB with metadata for extensibility
**Security:** Row-level security + Clerk authentication
**Retrieval:** SQL queries for display, vector search for AI context
**Benefits:** Best of both worlds - reliability + intelligence

**Status: ✅ FULLY IMPLEMENTED**

