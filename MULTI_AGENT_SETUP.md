# Multi-Agent AI Backend Setup Guide

## 🎯 Overview

This guide will help you set up and test the complete multi-agent AI backend for Navia.

## 📋 Prerequisites

1. **Node.js** (v18+)
2. **npm** or **yarn**
3. **API Keys** (see below)

## 🔑 Required API Keys

### 1. Clerk (Authentication)
- Sign up at [clerk.com](https://clerk.com)
- Create a new application
- Copy your publishable and secret keys

### 2. Groq (AI Model)
- Sign up at [console.groq.com](https://console.groq.com)
- Generate an API key
- Model used: `llama-3.3-70b-versatile` (llama-4-scout equivalent)

### 3. Pinecone (Vector Database)
- Sign up at [pinecone.io](https://www.pinecone.io)
- Create a new index with:
  - **Dimensions**: 1536 (for OpenAI embeddings)
  - **Metric**: cosine
  - **Name**: navia-index
- Copy your API key

### 4. OpenAI (Embeddings)
- Sign up at [platform.openai.com](https://platform.openai.com)
- Generate an API key
- Used for: text-embedding-3-small

### 5. Tavily (Web Search)
- Sign up at [tavily.com](https://tavily.com)
- Generate an API key
- Used for: real-time web search

## ⚙️ Installation

### 1. Clone and Install Dependencies

```bash
cd /path/to/Navia
npm install
```

Dependencies are already installed:
- `groq-sdk` - Groq AI client
- `@pinecone-database/pinecone` - Pinecone vector database
- `@tavily/core` - Tavily search API
- `axios` - HTTP requests
- `@clerk/nextjs` - Authentication
- `openai` - OpenAI embeddings

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Groq
GROQ_API_KEY=gsk_...

# Pinecone
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=navia-index

# OpenAI
OPENAI_API_KEY=sk-...

# Tavily
TAVILY_API_KEY=tvly-...
```

### 3. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## 🧪 Testing the Multi-Agent System

### Test 1: Orchestrator Health Check

```bash
curl -X GET http://localhost:3000/api/query \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

Expected response:
```json
{
  "status": "healthy",
  "availableAgents": ["finance", "career", "daily_task"],
  "features": ["Multi-agent routing", "Intent detection", ...]
}
```

### Test 2: Finance Agent

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "query": "Help me create a budget for this month",
    "userContext": {
      "energy_level": "medium",
      "ef_profile": ["time_management", "organization"]
    }
  }'
```

Expected:
- Domain: `finance`
- Breakdown: Multi-step budget creation process
- Resources: Budgeting apps and tools
- Sources: Finance-related articles

### Test 3: Career Agent

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "query": "I need help preparing for a job interview, please break it down step by step"
  }'
```

Expected:
- Domain: `career`
- Breakdown: Interview prep steps
- Resources: Interview tips, accommodation guides
- Sources: Career advice articles

### Test 4: Daily Task Agent

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "query": "I feel stuck and can\'t start my tasks today",
    "userContext": {
      "energy_level": "low",
      "ef_profile": ["task_initiation", "overwhelm"]
    }
  }'
```

Expected:
- Domain: `daily_task`
- Supportive, gentle response
- Breakdown: Micro-steps to start
- Resources: Productivity tools (Goblin Tools, timers)

### Test 5: Multi-Domain Query

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "query": "I need to balance my job search with managing my budget"
  }'
```

Expected:
- Domains: `["career", "finance"]`
- Combined summary from both agents
- Resources from both domains

### Test 6: Breakdown Tool (Standalone)

```bash
curl -X POST http://localhost:3000/api/agent/breakdown \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "task": "Apply for 5 jobs this week",
    "userContext": {
      "ef_profile": ["task_initiation", "time_management"]
    }
  }'
```

Expected:
- Breakdown: 3-7 clear steps
- Complexity score
- Personalized tips based on EF profile

## 🏗️ Architecture

### File Structure

```
lib/
├── agents/
│   ├── types.ts          # Shared TypeScript interfaces
│   ├── prompts.ts        # All agent system prompts
│   ├── orchestrator.ts   # Main routing logic
│   ├── finance.ts        # Finance agent
│   ├── career.ts         # Career agent
│   ├── daily-task.ts     # Daily task agent
│   └── breakdown.ts      # Breakdown tool
├── tools/
│   ├── tavily.ts         # Web search
│   ├── finance-tools.ts  # Finance APIs
│   └── career-tools.ts   # Career APIs
├── pinecone/
│   ├── client.ts         # Pinecone initialization
│   ├── chat-history.ts   # Conversation storage
│   └── rag.ts            # Knowledge retrieval
└── groq/
    └── client.ts         # Groq AI client

app/api/
├── query/
│   └── route.ts          # Main orchestrator endpoint
└── agent/
    ├── finance/route.ts
    ├── career/route.ts
    ├── daily-task/route.ts
    └── breakdown/route.ts
```

### Data Flow

1. **User Query** → `/api/query`
2. **Intent Detection** → Orchestrator analyzes query
3. **Agent Routing** → Routes to Finance, Career, or Daily Task agent(s)
4. **RAG Retrieval** → Each agent queries Pinecone for relevant context
5. **External Tools** → Agents fetch real-time data (Tavily, finance APIs, etc.)
6. **Breakdown Check** → If complex, triggers breakdown tool
7. **LLM Generation** → Groq generates response with all context
8. **Response Merging** → If multi-agent, combine responses
9. **Storage** → Save conversation to Pinecone for future context
10. **Return** → Send structured JSON response to frontend

## 🔍 Debugging

### Check Groq API

```bash
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer $GROQ_API_KEY"
```

### Check Pinecone Connection

```bash
# In Node.js console
node
> const { getPineconeClient } = require('./lib/pinecone/client.ts');
> const client = getPineconeClient();
> client.listIndexes();
```

### View Logs

```bash
npm run dev
# Check terminal for agent execution logs
```

## 📊 Response Format

All agents return structured JSON:

```typescript
{
  "success": true,
  "domain": "finance" | "career" | "daily_task",
  "summary": "Main AI response text",
  "breakdown": ["Step 1", "Step 2", ...],
  "resources": [
    {
      "title": "Resource Title",
      "url": "https://...",
      "description": "What this resource provides",
      "type": "article" | "tool" | "guide" | "template"
    }
  ],
  "sources": [
    {
      "title": "Source Title",
      "url": "https://...",
      "excerpt": "Relevant excerpt",
      "relevance": 0.95
    }
  ],
  "metadata": {
    "confidence": 0.85,
    "complexity": 6,
    "needsBreakdown": true,
    "executionTime": 2500
  }
}
```

## 🚀 Production Checklist

- [ ] All API keys configured
- [ ] Pinecone index created (1536 dimensions)
- [ ] Environment variables set
- [ ] Test all three agents
- [ ] Test multi-domain queries
- [ ] Test breakdown tool
- [ ] Verify chat history storage
- [ ] Verify RAG retrieval
- [ ] Check error handling
- [ ] Monitor API rate limits

## 🐛 Common Issues

### Issue: "Unauthorized" Error
**Solution**: Make sure you're logged in via Clerk and sending valid auth token

### Issue: "GROQ_API_KEY not found"
**Solution**: Check `.env.local` has `GROQ_API_KEY=gsk_...`

### Issue: "Pinecone index not found"
**Solution**: Create index in Pinecone console with correct name and dimensions (1536)

### Issue: "No results from RAG"
**Solution**: Pinecone index is empty - add some knowledge sources first (see below)

### Issue: Tavily search not working
**Solution**: Verify `TAVILY_API_KEY` is set correctly

## 📚 Adding Knowledge to Pinecone

To populate the knowledge base:

```typescript
// Example: Add a finance article
import { storeKnowledgeSource } from '@/lib/pinecone/rag';

await storeKnowledgeSource(
  "Budgeting basics: Track expenses, categorize spending, set limits...",
  {
    title: "Budgeting 101 for Young Adults",
    url: "https://example.com/budgeting-101",
    category: "finance",
    tags: ["budgeting", "money management", "young adults"],
    sourceType: "article"
  }
);
```

## 🎉 Success Indicators

You'll know everything works when:

1. ✅ Orchestrator routes queries to correct agents
2. ✅ Agents retrieve relevant sources from Pinecone
3. ✅ External tools (Tavily, finance APIs) return data
4. ✅ Breakdown tool triggers on complex tasks
5. ✅ Chat history is stored and retrieved
6. ✅ Multi-domain queries combine responses
7. ✅ All responses follow structured JSON format

## 📞 Support

If you encounter issues:
1. Check logs in terminal
2. Verify all API keys are valid
3. Test individual components (Groq, Pinecone, Tavily)
4. Review error messages in response JSON

---

**Built with ❤️ for neurodivergent users**

