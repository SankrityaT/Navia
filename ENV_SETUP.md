# Environment Variables Setup (Updated)

## Required API Keys

After OpenAI removal, you only need **3 API keys**:

```bash
# 1. Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# 2. Pinecone (Vector DB + Embeddings)
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_INDEX_NAME=navia-index
PINECONE_ENVIRONMENT=us-east-1-aws

# 3. Groq (LLM - Fast LLaMA inference)
GROQ_API_KEY=gsk_your_groq_api_key_here

# 4. Tavily (Optional - Web Search)
TAVILY_API_KEY=tvly-your_tavily_api_key_here
```

## ❌ Removed

```bash
# NO LONGER NEEDED:
OPENAI_API_KEY=sk-...  # ❌ Removed - Using Pinecone for embeddings
```

## How to Get API Keys

### 1. Clerk (Free)
1. Go to https://clerk.com
2. Create account → New application
3. Copy publishable and secret keys
4. Set redirect URLs in dashboard

### 2. Pinecone (Free tier available)
1. Go to https://www.pinecone.io
2. Create account → New project
3. Create index:
   - **Name**: `navia-index`
   - **Dimensions**: `1024`
   - **Metric**: `cosine`
   - **Cloud**: AWS
   - **Region**: us-east-1
4. Copy API key from dashboard

### 3. Groq (Free tier available)
1. Go to https://console.groq.com
2. Create account
3. Navigate to API Keys
4. Create new key → Copy

### 4. Tavily (Optional - Free tier available)
1. Go to https://tavily.com
2. Sign up
3. Get API key from dashboard

## Setup Steps

1. Copy environment template:
```bash
cp .env.example .env
```

2. Fill in your actual keys in `.env`

3. Verify setup:
```bash
# Check all required variables are set
env | grep -E 'CLERK|PINECONE|GROQ|TAVILY'
```

4. Test connection:
```bash
npm run dev
```

## Troubleshooting

### "Missing API key" error
- Check `.env` file exists
- Verify all required keys are present
- Restart dev server after adding keys

### "Invalid Pinecone dimensions"
- Your index must have **1024 dimensions**
- Check in Pinecone console: https://app.pinecone.io
- Create new index if needed

### "Groq rate limit"
- Free tier: 30 requests/minute
- Upgrade plan or wait
- Check status: https://console.groq.com

## Cost Estimate

| Service | Free Tier | Estimated Cost (1000 users) |
|---------|-----------|----------------------------|
| Clerk | 10,000 MAU | $0 (within free tier) |
| Pinecone | 1 index, 100K vectors | $0-$70/month |
| Groq | 30 req/min | $0-$50/month |
| Tavily | 1000 searches/month | $0 (within free tier) |

**Total**: $0-$120/month depending on usage

