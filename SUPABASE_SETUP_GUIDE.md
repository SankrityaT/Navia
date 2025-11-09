# Supabase + Pinecone + Clerk Integration Guide

## Why We Need Both Databases

**Supabase (PostgreSQL)** = Source of truth for:
- User profiles
- Peer connections (status, goals)
- Messages (with real-time)
- Check-ins
- Tasks

**Pinecone (Vector DB)** = Only for:
- Finding peer matches (vector similarity search)
- Semantic search in chat history

## Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save your:
   - Project URL: `https://xxx.supabase.co`
   - Anon Key: `eyJhbGc...`
   - Service Role Key: `eyJhbGc...` (keep secret!)

### 2. Run Schema

1. Open Supabase SQL Editor
2. Copy entire `SUPABASE_SCHEMA.sql` file
3. Run it
4. Verify tables created: `user_profiles`, `peer_connections`, `peer_messages`, `check_ins`, `tasks`

### 3. Add Environment Variables

Add to `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Server-side only

# Existing (keep these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=...
GROQ_API_KEY=...
```

### 4. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 5. Create Supabase Client

Create `lib/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client (for API routes)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```

### 6. Sync Clerk with Supabase

When user signs up with Clerk, create profile in Supabase:

```typescript
// In onboarding API route
import { supabaseAdmin } from '@/lib/supabase/client';

const { data, error } = await supabaseAdmin
  .from('user_profiles')
  .insert({
    clerk_user_id: userId,
    name: onboardingData.name,
    graduation_date: onboardingData.graduation_date,
    university: onboardingData.university,
    // ... other fields
  });
```

### 7. How Data Flows

**Creating a Peer Connection:**
1. User clicks "Connect" on peer card
2. API stores in **Supabase** `peer_connections` table
3. API also stores peer profile in **Pinecone** (for future matching)

**Finding Peer Matches:**
1. User goes to `/peers`
2. API queries **Pinecone** for vector similarity
3. Returns top 10 matches

**Sending Messages:**
1. User sends message
2. API stores in **Supabase** `peer_messages` table
3. Real-time subscription updates other user's UI instantly

**Checking In:**
1. User submits check-in
2. API stores in **Supabase** `check_ins` table
3. Both users can see history

## Migration from Pinecone-Only

Current code stores connections in Pinecone. Need to migrate to Supabase:

**Before:**
```typescript
// lib/pinecone/connections.ts
await index.upsert([{ id: connectionId, metadata: connection }]);
```

**After:**
```typescript
// lib/supabase/connections.ts
await supabase.from('peer_connections').insert(connection);
```

## Real-Time Chat Setup

Enable real-time for instant messaging:

```typescript
// In PeerChatInterface component
import { supabase } from '@/lib/supabase/client';

useEffect(() => {
  const channel = supabase
    .channel(`connection:${connectionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'peer_messages',
        filter: `connection_id=eq.${connectionId}`,
      },
      (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [connectionId]);
```

## Security Notes

- **RLS is enabled** - Users can only see their own data
- **Clerk JWT** is used for authentication
- **Service Role Key** only used server-side for admin operations
- **Never expose Service Role Key** to client

## Testing

1. Sign up 2 test users in Clerk
2. Complete onboarding for both
3. Check Supabase dashboard - should see 2 rows in `user_profiles`
4. Create connection between them
5. Send messages - should see real-time updates
6. Submit check-ins - should see in `check_ins` table

## Next Steps

Once Supabase is set up, I'll help you:
1. Migrate connection APIs from Pinecone to Supabase
2. Add real-time chat subscriptions
3. Create dashboard queries for user stats
4. Set up proper error handling

Let me know when you've added the Supabase credentials and I'll update the API routes!
