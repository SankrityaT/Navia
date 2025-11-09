# PINECONE SETUP GUIDE

## Current Status
⚠️ **Pinecone is OPTIONAL for testing the app**

The app will work WITHOUT Pinecone - data saves to Clerk instead. But for full AI features, you'll need Pinecone.

## What Works Without Pinecone:
✅ Landing page
✅ Sign up / Sign in
✅ Onboarding (saves to Clerk)
✅ Dashboard (uses mock data)
✅ Task visualizer (uses mock data)
✅ All UI components

## What Needs Pinecone:
❌ Real task storage
❌ AI chat with personas
❌ Peer matching
❌ Task breakdown from chat
❌ Progress tracking with real data

---

## Setting Up Pinecone (5-10 minutes)

### Step 1: Create Pinecone Account
1. Go to https://www.pinecone.io/
2. Click "Start Free"
3. Sign up (free tier available)
4. Verify email

### Step 2: Create Index
1. In Pinecone dashboard, click "Create Index"
2. Fill in:
   - **Name**: `navia-users`
   - **Dimensions**: `1536` (for OpenAI embeddings)
   - **Metric**: `cosine`
   - **Pod Type**: `s1.x1` (starter - free tier)
3. Click "Create Index"
4. Wait 1-2 minutes for index to be ready

### Step 3: Get API Key
1. In Pinecone dashboard, go to "API Keys"
2. Copy your API key
3. Note your environment (e.g., `us-east-1-aws`)

### Step 4: Update .env.local
```env
PINECONE_API_KEY=your-actual-api-key-here
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=navia-users
```

### Step 5: Enable Pinecone in Code
Uncomment the Pinecone code in:
- `app/api/onboarding/route.ts` (lines 34-53)
- Other API routes as needed

### Step 6: Test
1. Restart dev server: `npm run dev`
2. Complete onboarding
3. Check Pinecone dashboard - you should see vectors

---

## Setting Up OpenAI (Required for AI Features)

### Step 1: Create OpenAI Account
1. Go to https://platform.openai.com/
2. Sign up
3. Add payment method (required for API access)

### Step 2: Get API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (you won't see it again!)

### Step 3: Update .env.local
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

### Step 4: Test
Try the chat feature at `/chat`

---

## Cost Estimates

### Pinecone (Free Tier)
- 1 index
- 100K vectors
- Enough for 100+ users testing

### OpenAI
- Embeddings: ~$0.0001 per 1K tokens
- GPT-4: ~$0.03 per 1K tokens
- For hackathon testing: ~$5-10 total

---

## Troubleshooting

### "Failed to connect to Pinecone"
- Check API key is correct
- Check environment matches your region
- Check index name is exactly `navia-users`
- Wait 2 minutes after creating index

### "OpenAI API error"
- Check API key is valid
- Check you have credits in account
- Check no extra spaces in .env.local

### "Dimension mismatch"
- Index must be 1536 dimensions
- Delete and recreate index if wrong

---

## For Hackathon: Quick Decision

### Option 1: Skip Pinecone (Fastest)
- App works with mock data
- Focus on UI/UX
- Add Pinecone later

### Option 2: Set Up Pinecone (10 min)
- Full AI features work
- Better demo
- More impressive

**Recommendation**: Start without Pinecone, add it when ready to demo AI features.

---

## Backend Team: Enabling Pinecone

Once Pinecone is set up, uncomment these files:

1. **app/api/onboarding/route.ts** - Lines 34-53
2. **app/api/tasks/route.ts** - Already has Pinecone calls
3. **app/api/chat/route.ts** - Already has OpenAI calls
4. **app/api/peers/route.ts** - Already has Pinecone calls

Then test each endpoint individually.
