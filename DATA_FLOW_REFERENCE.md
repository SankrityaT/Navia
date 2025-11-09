# Navia Data Flow Quick Reference

## System Overview

```
┌─────────┐     ┌──────────┐     ┌──────────┐
│  Clerk  │────▶│ Supabase │────▶│ Pinecone │
│  (Auth) │     │  (Data)  │     │(Vectors) │
└─────────┘     └──────────┘     └──────────┘
     │               │                  │
     │               │                  │
     ▼               ▼                  ▼
  Fast Auth    Structured Data   Semantic Search
  Metadata     RLS Policies      AI Context
```

## When to Use Each System

### Clerk
✅ Authentication
✅ User sessions
✅ Quick metadata access (publicMetadata)
✅ Email verification
❌ Don't use for: Large data, queries, analytics

### Supabase
✅ User profiles
✅ Chat history
✅ Tasks
✅ Relational queries
✅ Analytics
✅ Real-time subscriptions
❌ Don't use for: Semantic search, embeddings

### Pinecone
✅ Vector embeddings
✅ Semantic similarity search
✅ AI context retrieval
✅ Finding related conversations
❌ Don't use for: Structured queries, counting, filtering by exact values

## Data Storage Decision Tree

```
Need to store data?
│
├─ Is it authentication related?
│  └─ YES → Clerk
│
├─ Need semantic search?
│  └─ YES → Pinecone (+ Supabase for backup)
│
├─ Need structured queries/analytics?
│  └─ YES → Supabase
│
└─ Need both?
   └─ Store in both! (Supabase = source of truth)
```

## Common Operations

### 1. User Signs Up
```typescript
// Automatic
Clerk.signUp() 
  → Creates user in Clerk
  → Redirects to /onboarding
```

### 2. User Completes Onboarding
```typescript
POST /api/onboarding
  → Clerk: Update publicMetadata
  → Supabase: Insert user_profiles
  → Pinecone: Store profile embedding
```

### 3. User Sends Chat Message
```typescript
POST /api/chat
  → Get context from Supabase + Pinecone
  → Generate AI response
  → Supabase: Insert chat_messages
  → Pinecone: Store message embedding
```

### 4. Check if User is Onboarded
```typescript
GET /api/profile
  → Supabase: SELECT from user_profiles
  → Return onboarded status
```

### 5. Get User Count
```typescript
GET /api/users/stats
  → Supabase: COUNT(*) from user_profiles
  → Return statistics
```

### 6. Build AI Context
```typescript
buildAIContext(userId, query)
  → Supabase: Get user profile
  → Supabase: Get recent 5 messages
  → Pinecone: Semantic search for relevant past conversations
  → Combine all into context string
```

## Data Relationships

### User Profile
```
Clerk (user_id)
  ↓
Supabase (clerk_user_id) ← Primary storage
  ↓
Pinecone (profile_{userId}) ← Embedding
```

### Chat Message
```
User sends message
  ↓
Supabase (chat_messages) ← Persistent storage
  ↓
Pinecone (chat_{userId}_{timestamp}) ← Semantic search
  ↑
  └─ Linked via pinecone_id field
```

### Task
```
Supabase (tasks) ← Only in Supabase
  - No need for semantic search
  - Structured queries sufficient
```

## Query Patterns

### Get Recent Chat History
```typescript
// Use Supabase (fast chronological)
const messages = await supabase
  .from('chat_messages')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10);
```

### Find Similar Past Conversations
```typescript
// Use Pinecone (semantic search)
const embedding = await generateEmbedding(query);
const similar = await pinecone.query({
  vector: embedding,
  filter: { userId },
  topK: 5
});
```

### Get User Profile
```typescript
// Use Supabase (structured data)
const profile = await supabase
  .from('user_profiles')
  .select('*')
  .eq('clerk_user_id', userId)
  .single();
```

### Count Users
```typescript
// Use Supabase (aggregation)
const { count } = await supabase
  .from('user_profiles')
  .select('*', { count: 'exact', head: true })
  .eq('onboarded', true);
```

## Performance Tips

### ⚡ Fast Operations
- Supabase SELECT by primary key: < 10ms
- Supabase COUNT: < 50ms
- Pinecone semantic search: < 100ms
- Clerk auth check: < 50ms

### 🐌 Slow Operations (avoid)
- Pinecone for exact filtering: Use Supabase instead
- Supabase for semantic search: Use Pinecone instead
- Multiple sequential queries: Batch or parallelize

### 🚀 Optimization Strategies
```typescript
// ✅ Good: Parallel queries
const [profile, messages, similar] = await Promise.all([
  getUserProfile(userId),
  getRecentMessages(userId),
  findSimilarConversations(query)
]);

// ❌ Bad: Sequential queries
const profile = await getUserProfile(userId);
const messages = await getRecentMessages(userId);
const similar = await findSimilarConversations(query);
```

## Error Handling

### Graceful Degradation
```typescript
try {
  // Try Pinecone
  const context = await getPineconeContext(userId);
} catch (error) {
  // Fall back to Supabase only
  const context = await getSupabaseContext(userId);
}
```

### Non-Critical Failures
```typescript
// Onboarding should succeed even if Pinecone fails
try {
  await storePineconeEmbedding(profile);
} catch (error) {
  console.error('Pinecone error (non-critical):', error);
  // Continue - user is still onboarded
}
```

## Monitoring Checklist

Daily checks:
- [ ] Supabase connection pool usage
- [ ] Pinecone vector count
- [ ] Clerk API rate limits
- [ ] Error rates in logs

Weekly checks:
- [ ] User onboarding completion rate
- [ ] Chat message volume
- [ ] Database size growth
- [ ] Query performance

## Quick Troubleshooting

### Issue: User not found
1. Check Clerk: User exists?
2. Check Supabase: Profile created?
3. Check RLS: Policies allow access?

### Issue: Chat not saving
1. Check Supabase: Row inserted?
2. Check Pinecone: Vector created?
3. Check logs: Any errors?

### Issue: Slow responses
1. Check query patterns: Sequential or parallel?
2. Check indexes: Proper indexes on Supabase?
3. Check caching: Can we cache this?

## Environment Variables Checklist

```bash
# Clerk
✓ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
✓ CLERK_SECRET_KEY

# Supabase
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY  # Important!

# Pinecone
✓ PINECONE_API_KEY
✓ PINECONE_INDEX_NAME
```

## Key Files Reference

### Configuration
- `lib/supabase/client.ts` - Supabase clients
- `lib/pinecone/client.ts` - Pinecone client

### Operations
- `lib/supabase/operations.ts` - Supabase CRUD
- `lib/pinecone/operations.ts` - Pinecone vectors
- `lib/ai/context.ts` - AI context builder

### API Routes
- `app/api/onboarding/route.ts` - User onboarding
- `app/api/profile/route.ts` - Profile management
- `app/api/chat/route.ts` - Chat messages
- `app/api/users/stats/route.ts` - User statistics

### Schemas
- `SUPABASE_SCHEMA.sql` - Database schema

## Remember

1. **Supabase = Source of Truth**
   - Always save critical data here first
   - Pinecone is enhancement, not replacement

2. **Pinecone = AI Enhancement**
   - Use for semantic search only
   - Don't rely on it for core functionality

3. **Clerk = Authentication Only**
   - Keep metadata minimal
   - Use for quick access only

4. **Error Handling = Critical**
   - Always handle failures gracefully
   - Log errors but don't break user flow

5. **Performance = Parallel Queries**
   - Batch operations when possible
   - Use Promise.all() for independent queries
