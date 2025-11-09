# Chat Storage Test Guide 🧪

## Quick Verification Checklist

Use this guide to verify that chat messages are being stored correctly in Supabase.

---

## ✅ Test 1: Send a Chat Message

### Steps:
1. Start your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Navigate to the chat interface (logged in as a user)

3. Send a test message, for example:
   ```
   How do I create a budget?
   ```

4. Check the browser console - you should see:
   ```
   ✅ Chat stored in both Supabase and Pinecone for user user_xxx
   ```

---

## ✅ Test 2: Verify Supabase Storage

### Option A: Via Supabase Dashboard
1. Open your Supabase project dashboard
2. Go to **Table Editor** → `chat_messages`
3. You should see your chat message with:
   - ✅ `user_id`: Your Clerk user ID
   - ✅ `message`: "How do I create a budget?"
   - ✅ `response`: The AI's response
   - ✅ `category`: "finance" (or appropriate category)
   - ✅ `persona`: "orchestrator"
   - ✅ `metadata`: JSON with complexity, hadBreakdown, etc.
   - ✅ `pinecone_id`: Reference to Pinecone vector
   - ✅ `created_at`: Timestamp

### Option B: Via API Endpoint
```bash
# In your browser or curl:
curl http://localhost:3000/api/chat/history?limit=10
```

Expected response:
```json
{
  "success": true,
  "chatHistory": [
    {
      "id": "uuid-here",
      "user_id": "user_xxx",
      "message": "How do I create a budget?",
      "response": "Creating a budget involves...",
      "category": "finance",
      "persona": "orchestrator",
      "metadata": {
        "complexity": 3,
        "hadBreakdown": true,
        "domains": ["finance"]
      },
      "pinecone_id": "chat_user_xxx_1234567890",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "stats": {
    "totalChats": 1,
    "byCategory": {
      "finance": 1,
      "career": 0,
      "daily_task": 0
    }
  },
  "count": 1
}
```

---

## ✅ Test 3: Verify Dual Storage (Supabase + Pinecone)

### Check Supabase:
```sql
-- In Supabase SQL Editor
SELECT 
  id,
  user_id,
  message,
  category,
  pinecone_id,
  created_at
FROM chat_messages
ORDER BY created_at DESC
LIMIT 5;
```

### Check Pinecone:
```javascript
// In your browser console (if you have Pinecone client access)
// Or check server logs when retrieving context
```

Server logs should show:
```
🔍 Hybrid Retrieval Summary: {
  primaryDomain: 'finance',
  totalMessages: 1,
  semanticTop3: 1,
  chronologicalRest: 0,
  order: 'TOP 3 semantic (filtered) → rest chronological (filtered)'
}
```

---

## ✅ Test 4: Category Filtering

### Test finance category:
```bash
curl "http://localhost:3000/api/chat/history?category=finance"
```

### Test career category:
```bash
curl "http://localhost:3000/api/chat/history?category=career"
```

Should only return messages from that specific category.

---

## ✅ Test 5: Multiple Messages

Send several messages in different categories:

1. **Finance:** "How do I save money?"
2. **Career:** "Help me update my LinkedIn profile"
3. **Daily Task:** "I need to organize my room"

Then check:
```bash
curl "http://localhost:3000/api/chat/history?limit=50"
```

Verify:
- ✅ All 3 messages are stored
- ✅ Correct categories assigned
- ✅ Timestamps are sequential
- ✅ Statistics show correct counts

---

## ✅ Test 6: Chat History in AI Context

1. Send a follow-up question:
   ```
   "Tell me more about that"
   ```

2. Check server logs - should show:
   ```
   🧭 Orchestrator routing context: {
     totalHistory: X,
     semanticMessages: Y,
     recentMessages: Z
   }
   ```

3. Verify the AI understands context from previous messages

---

## 🐛 Troubleshooting

### Issue: No messages in Supabase
**Check:**
- ✅ Supabase environment variables are set correctly
- ✅ User profile exists in `user_profiles` table
- ✅ RLS policies are not blocking inserts
- ✅ Check server console for error messages

**Solution:**
```typescript
// Check if user profile exists first
const profile = await getUserProfile(userId);
if (!profile) {
  console.error('User profile not found - create one first via onboarding');
}
```

### Issue: Messages stored but not retrievable
**Check:**
- ✅ Row-level security policies
- ✅ User ID matches between storage and retrieval
- ✅ API endpoint authentication

**Debug:**
```sql
-- Temporarily disable RLS to test
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
-- Run your query
SELECT * FROM chat_messages;
-- Re-enable
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
```

### Issue: Pinecone ID not linking
**Check:**
- ✅ Timestamp generation is consistent
- ✅ `pinecone_id` format matches between stores

**Verify:**
```typescript
const timestamp = Date.now();
const pineconeId = `chat_${userId}_${timestamp}`;
console.log('Generated pinecone_id:', pineconeId);
```

---

## 📊 Expected Behavior

### ✅ Correct Flow:
```
User sends message
    ↓
AI processes query
    ↓
Generate response
    ↓
Store in Pinecone (with embedding) ✅
    ↓
Store in Supabase (primary DB) ✅
    ↓
Return response to frontend
    ↓
Console logs: "✅ Chat stored in both..."
```

### ❌ Incorrect Flow (Old):
```
User sends message
    ↓
AI processes query
    ↓
Generate response
    ↓
Store ONLY in Pinecone ❌
    ↓
Return response
```

---

## 🎯 Success Criteria

After running these tests, you should have:

- ✅ Messages visible in Supabase Table Editor
- ✅ Messages retrievable via `/api/chat/history`
- ✅ Statistics showing correct counts by category
- ✅ Pinecone IDs properly linked
- ✅ AI context includes past messages
- ✅ Category filtering works
- ✅ Console logs confirm dual storage
- ✅ No RLS errors or permission issues

---

## 🚀 Next Steps

Once verified:
1. Send multiple test messages in different categories
2. Test category filtering
3. Verify chat history loads in frontend
4. Check statistics are accurate
5. Test with multiple users (different Clerk IDs)

**Status: Ready for Testing! 🎉**

