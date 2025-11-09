# Navia Setup Guide

## Quick Start

### 1. Run the Supabase Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `SUPABASE_SCHEMA.sql`
4. Paste and run the entire schema
5. Verify tables were created:
   - user_profiles
   - peer_connections
   - peer_messages
   - check_ins
   - tasks
   - chat_messages

### 2. Verify Environment Variables

Make sure your `.env.local` has:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... # Important for server-side operations

# Pinecone
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=navia
```

### 3. Test the Integration

Run these tests in order:

#### Test 1: Onboarding
```bash
# Start the dev server
npm run dev

# Go through onboarding at /onboarding
# After completion, check:
```

**Verify in Supabase:**
```sql
SELECT * FROM user_profiles WHERE clerk_user_id = 'your_clerk_user_id';
```

**Verify in Clerk:**
- Go to Clerk Dashboard → Users
- Check publicMetadata has onboarding data

**Verify in Pinecone:**
- Check vector count increased
- Profile vector ID: `profile_{userId}`

#### Test 2: Chat Messages
```bash
# Send a chat message at /chat
# Check storage:
```

**Verify in Supabase:**
```sql
SELECT * FROM chat_messages WHERE user_id = 'your_clerk_user_id' ORDER BY created_at DESC LIMIT 5;
```

**Verify in Pinecone:**
- Check for chat vectors: `chat_{userId}_{timestamp}`

#### Test 3: User Stats
```bash
# Call the stats API
curl http://localhost:3000/api/users/stats
```

Should return:
```json
{
  "success": true,
  "stats": {
    "totalUsers": 1,
    "onboardedUsers": 1,
    "recentSignups": 1
  }
}
```

## Troubleshooting

### Issue: "0 users" showing

**Check 1: Supabase Connection**
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM user_profiles;
```

If 0, onboarding didn't save to Supabase.

**Check 2: RLS Policies**
```sql
-- Check if RLS is blocking access
SELECT * FROM user_profiles;
```

If you get permission denied, RLS policies might be too strict.

**Fix:**
```sql
-- Temporarily disable RLS to test (DON'T DO IN PRODUCTION)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
```

**Check 3: Service Role Key**
Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`. This bypasses RLS.

### Issue: Onboarding not saving

**Check Console Logs:**
```bash
# Look for errors in terminal
✅ User profile saved to Supabase for [name] ([userId])
✅ User profile stored in Pinecone for user [userId]
```

**Common Errors:**

1. **"relation user_profiles does not exist"**
   - Schema not run in Supabase
   - Run `SUPABASE_SCHEMA.sql`

2. **"permission denied for table user_profiles"**
   - Service role key not set
   - Check `.env.local`

3. **"Invalid JWT"**
   - Clerk integration issue
   - Verify Clerk keys

### Issue: Chat not saving

**Check Both Systems:**

1. **Supabase:**
```sql
SELECT COUNT(*) FROM chat_messages;
```

2. **Pinecone:**
```bash
# Check vector count in Pinecone dashboard
```

**Common Issues:**
- Pinecone API key invalid
- Supabase service role key missing
- Network issues

### Issue: Profile shows "not onboarded" after completing onboarding

**Check Clerk:**
```javascript
// In browser console on /dashboard
fetch('/api/profile')
  .then(r => r.json())
  .then(console.log)
```

Should return:
```json
{
  "success": true,
  "profile": { ... },
  "onboarded": true
}
```

**If onboarded is false:**
1. Check Supabase: `SELECT onboarded FROM user_profiles WHERE clerk_user_id = '...'`
2. Check Clerk publicMetadata
3. Re-run onboarding

## Data Flow Verification

### Complete Flow Test

1. **Sign up** → Check Clerk dashboard for new user
2. **Complete onboarding** → Check all three systems:
   - Clerk: publicMetadata updated
   - Supabase: user_profiles row created
   - Pinecone: profile vector created
3. **Send chat message** → Check:
   - Supabase: chat_messages row created
   - Pinecone: chat vector created
4. **Check stats** → `/api/users/stats` returns correct count

## Clerk JWT Configuration

For Supabase RLS to work with Clerk, you need to configure JWT:

1. Go to Clerk Dashboard → JWT Templates
2. Create new template for Supabase
3. Add claim: `sub` → `{{user.id}}`
4. Copy JWT template name
5. Update Supabase RLS policies if needed

## Performance Optimization

### Caching Strategy

For production, consider:

1. **Redis for profiles**
```typescript
// Cache user profiles for 5 minutes
const cachedProfile = await redis.get(`profile:${userId}`);
if (cachedProfile) return JSON.parse(cachedProfile);

const profile = await getUserProfile(userId);
await redis.setex(`profile:${userId}`, 300, JSON.stringify(profile));
```

2. **Batch Pinecone queries**
```typescript
// Instead of multiple single queries
const profiles = await pinecone.fetch([
  `profile_${userId1}`,
  `profile_${userId2}`,
  `profile_${userId3}`,
]);
```

## Monitoring

### Key Metrics to Track

1. **Onboarding completion rate**
```sql
SELECT 
  COUNT(*) FILTER (WHERE onboarded = true) * 100.0 / COUNT(*) as completion_rate
FROM user_profiles;
```

2. **Chat activity**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as messages
FROM chat_messages
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 7;
```

3. **System health**
- Supabase: Check connection pool usage
- Pinecone: Monitor vector count and query latency
- Clerk: Check API rate limits

## Next Steps

1. ✅ Run Supabase schema
2. ✅ Verify environment variables
3. ✅ Test onboarding flow
4. ✅ Test chat flow
5. ✅ Verify user stats
6. 📊 Set up monitoring
7. 🚀 Deploy to production

## Support

If you encounter issues:
1. Check console logs (both browser and server)
2. Verify all environment variables
3. Test each system independently
4. Check the ARCHITECTURE.md for data flow details
