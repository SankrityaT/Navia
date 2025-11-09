# Navia Architecture Documentation

## Overview
Navia uses a hybrid data architecture combining **Clerk** (authentication), **Supabase** (relational data), and **Pinecone** (vector embeddings) to provide personalized AI assistance for neurodivergent young adults.

## Data Flow Architecture

### 1. User Onboarding Flow

```
User completes onboarding
    ↓
Save to Clerk (publicMetadata) ← Authentication & quick access
    ↓
Save to Supabase (user_profiles) ← Persistent storage & queries
    ↓
Generate embedding & save to Pinecone ← Semantic search & AI context
```

**Why this approach?**
- **Clerk**: Fast authentication checks, immediate metadata access
- **Supabase**: Relational queries, RLS policies, real-time subscriptions
- **Pinecone**: Semantic similarity search for AI context retrieval

### 2. Chat Message Flow

```
User sends message
    ↓
AI generates response
    ↓
Save to Supabase (chat_messages) ← Persistent history, easy retrieval
    ↓
Generate embedding & save to Pinecone ← Semantic search for context
```

**Benefits:**
- Supabase: Fast chronological retrieval, SQL queries, analytics
- Pinecone: Find semantically similar past conversations for AI context

### 3. AI Context Retrieval

When a user asks a question, the AI gets context from:

1. **User Profile** (from Supabase)
   - Neurotypes, EF challenges, goals
   - Quick structured data access

2. **Recent Chat History** (from Supabase)
   - Last 5-10 messages for conversation continuity
   - Fast chronological retrieval

3. **Relevant Past Conversations** (from Pinecone)
   - Semantically similar discussions
   - Vector similarity search

4. **User Profile Embedding** (from Pinecone)
   - Deep understanding of user's needs
   - Contextual personalization

## Database Schemas

### Supabase Tables

#### user_profiles
```sql
- clerk_user_id (TEXT, UNIQUE)
- name (TEXT)
- email (TEXT)
- graduation_timeline (TEXT)
- neurotypes (JSONB)
- other_neurotype (TEXT)
- ef_challenges (JSONB)
- current_goal (TEXT)
- job_field (TEXT)
- onboarded (BOOLEAN)
- onboarded_at (TIMESTAMP)
```

#### chat_messages
```sql
- id (UUID)
- user_id (TEXT, FK to user_profiles)
- message (TEXT)
- response (TEXT)
- category (TEXT: 'finance' | 'career' | 'daily_task')
- persona (TEXT)
- metadata (JSONB)
- pinecone_id (TEXT) -- Links to Pinecone vector
- created_at (TIMESTAMP)
```

#### tasks
```sql
- id (UUID)
- user_id (TEXT, FK to user_profiles)
- title (TEXT)
- status (TEXT)
- priority (TEXT)
- time_estimate (INTEGER)
- category (TEXT)
- parent_task_id (UUID, self-referencing)
- created_by (TEXT)
- due_date (TIMESTAMP)
- completed_at (TIMESTAMP)
- details (TEXT)
- tips (TEXT)
```

### Pinecone Vectors

#### Profile Vectors
```
ID: profile_{userId}
Metadata:
  - user_id
  - type: 'profile'
  - name
  - graduation_date
  - university
  - ef_challenges (comma-separated)
  - goals (comma-separated)
  - Individual flags: ef_{challenge}, goal_{goal}
```

#### Chat Vectors
```
ID: chat_{userId}_{timestamp}
Metadata:
  - userId
  - category
  - persona
  - timestamp
  - messagePreview
  - responsePreview
  - fullMessage
  - fullResponse
```

## API Routes

### `/api/onboarding` (POST)
1. Validates onboarding data
2. Updates Clerk publicMetadata
3. Saves to Supabase user_profiles
4. Generates embedding and saves to Pinecone
5. Returns success

### `/api/profile` (GET)
- Retrieves user profile from Supabase
- Returns onboarding status

### `/api/chat` (POST)
1. Receives user message
2. Retrieves context:
   - User profile from Supabase
   - Recent chat history from Supabase
   - Relevant past conversations from Pinecone
3. Sends to AI orchestrator
4. Saves response to both:
   - Supabase (for persistence)
   - Pinecone (for semantic search)
5. Returns AI response

## Benefits of Hybrid Architecture

### Supabase Advantages
✅ Fast relational queries
✅ Row Level Security (RLS)
✅ Real-time subscriptions
✅ Easy analytics and reporting
✅ Structured data with foreign keys
✅ Transaction support

### Pinecone Advantages
✅ Semantic similarity search
✅ Vector embeddings for AI context
✅ Find related conversations
✅ Personalized recommendations
✅ Efficient high-dimensional search

### Combined Benefits
- **Performance**: Supabase for fast structured queries, Pinecone for semantic search
- **Reliability**: Supabase as source of truth, Pinecone for enhanced AI features
- **Scalability**: Each system optimized for its use case
- **Flexibility**: Can query either system based on needs

## User Count Issue Fix

The "0 users" issue was caused by:
1. Profile check was only looking at Pinecone
2. Onboarding wasn't saving to Supabase
3. No fallback to Clerk metadata

**Solution:**
- Primary profile storage in Supabase
- Profile API checks Supabase first
- Onboarding saves to all three systems
- Dashboard checks Supabase for user count

## Chat History Context

### Before
- Only Pinecone storage
- Hard to retrieve chronologically
- No structured queries

### After
- Supabase: Easy chronological retrieval, SQL queries
- Pinecone: Semantic search for relevant context
- AI gets both recent history AND semantically similar past conversations

## Future Enhancements

1. **Caching Layer**
   - Redis for frequently accessed profiles
   - Reduce database calls

2. **Analytics**
   - Supabase for user engagement metrics
   - Track onboarding completion rates
   - Monitor chat categories

3. **Real-time Features**
   - Supabase real-time for peer messaging
   - Live task updates

4. **Advanced AI Context**
   - Combine multiple Pinecone queries
   - User behavior patterns
   - Personalized task recommendations

## Setup Instructions

1. **Supabase Setup**
   ```bash
   # Run the schema in Supabase SQL Editor
   psql -f SUPABASE_SCHEMA.sql
   ```

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_INDEX_NAME=your_index_name
   ```

3. **Pinecone Setup**
   - Create index with 1024 dimensions
   - Use cosine similarity metric

## Troubleshooting

### Profile not showing after onboarding
- Check Supabase user_profiles table
- Verify RLS policies allow user access
- Check Clerk publicMetadata

### Chat history not saving
- Verify both Supabase and Pinecone credentials
- Check API route logs for errors
- Ensure user_id matches across systems

### 0 users showing
- Run SQL query: `SELECT COUNT(*) FROM user_profiles WHERE onboarded = true`
- Check RLS policies
- Verify Supabase connection
