# Embedding System Documentation

## Overview

Navia uses **Pinecone Inference API** for generating embeddings, eliminating the need for OpenAI.

---

## 🎯 Embedding Model

**Model**: `multilingual-e5-large`
**Dimensions**: 1024
**Provider**: Pinecone Inference API
**Endpoint**: `https://api.pinecone.io/embed`

### Why This Model?

1. **No External Dependencies**: Built into Pinecone
2. **Multilingual Support**: Handles various languages
3. **Good Performance**: Balanced speed and accuracy
4. **Cost Effective**: Included with Pinecone subscription

---

## 📦 Usage

### Basic Embedding Generation

```typescript
import { generateEmbedding } from '@/lib/embeddings/client';

// Generate single embedding
const embedding = await generateEmbedding("Help me create a budget");
// Returns: number[] (1024 dimensions)
```

### Batch Embedding Generation

```typescript
import { generateEmbeddings } from '@/lib/embeddings/client';

// Generate multiple embeddings at once
const texts = [
  "Create a budget",
  "Find a job",
  "Organize my tasks"
];

const embeddings = await generateEmbeddings(texts);
// Returns: number[][] (array of 1024-dimensional vectors)
```

---

## 🔧 Implementation

### Client Code (`lib/embeddings/client.ts`)

```typescript
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.pinecone.io/embed', {
    method: 'POST',
    headers: {
      'Api-Key': process.env.PINECONE_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'multilingual-e5-large',
      inputs: [{ text }],
    }),
  });

  const data = await response.json();
  return data.data[0].values;
}
```

---

## 📍 Where Embeddings Are Used

### 1. User Profile Storage
**File**: `app/api/onboarding/route.ts`

```typescript
const profileText = `User Profile: ${name}...`;
const embedding = await generateEmbedding(profileText);
await storeUserProfile(userId, profileData, embedding);
```

### 2. Chat History
**File**: `lib/pinecone/chat-history.ts`

```typescript
const textToEmbed = `User: ${message}\nAssistant: ${response}`;
const embedding = await generateEmbedding(textToEmbed);
// Store in Pinecone for semantic search
```

### 3. RAG (Knowledge Retrieval)
**File**: `lib/pinecone/rag.ts`

```typescript
// Store knowledge source
const embedding = await generateEmbedding(content);
await storeKnowledgeSource(content, metadata, embedding);

// Query relevant knowledge
const queryEmbedding = await generateEmbedding(userQuery);
const relevantSources = await retrieveContext(queryEmbedding, filters);
```

### 4. Task Storage
**File**: `app/api/tasks/route.ts`

```typescript
const taskText = `${task.title} ${task.description}`;
const embedding = await generateEmbedding(taskText);
await storeTask(userId, task, embedding);
```

### 5. Peer Matching
**File**: `lib/pinecone/peers.ts`

```typescript
const profileText = `${interests} ${goals} ${challenges}`;
const embedding = await generateEmbedding(profileText);
const matches = await findSimilarPeers(embedding);
```

---

## 🏗️ Pinecone Index Setup

### Required Configuration

```bash
# Pinecone Console Settings:
- Index Name: navia-index
- Dimensions: 1024
- Metric: cosine
- Cloud: AWS
- Region: us-east-1
```

### Create Index via CLI

```bash
# Using Pinecone CLI
pinecone index create \
  --name navia-index \
  --dimension 1024 \
  --metric cosine \
  --environment us-east-1-aws
```

---

## 🧪 Testing Embeddings

### Test 1: Direct API Call

```bash
curl -X POST https://api.pinecone.io/embed \
  -H "Api-Key: $PINECONE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "multilingual-e5-large",
    "inputs": [
      {"text": "How do I create a budget?"},
      {"text": "What are good finance apps?"}
    ]
  }'
```

**Expected Response:**
```json
{
  "model": "multilingual-e5-large",
  "data": [
    {
      "values": [0.123, -0.456, ...], // 1024 numbers
      "index": 0
    },
    {
      "values": [0.789, -0.234, ...], // 1024 numbers
      "index": 1
    }
  ]
}
```

### Test 2: Via Backend API

```typescript
// In a test file or API route
import { generateEmbedding } from '@/lib/embeddings/client';

const embedding = await generateEmbedding("test query");
console.log('Dimensions:', embedding.length); // Should be 1024
console.log('Sample values:', embedding.slice(0, 5));
```

---

## ⚡ Performance

### Latency Benchmarks

| Operation | Time |
|-----------|------|
| Single embedding | ~300ms |
| Batch (10 texts) | ~500ms |
| Pinecone query | ~100ms |
| End-to-end RAG | ~400ms |

### Best Practices

1. **Batch When Possible**: Use `generateEmbeddings()` for multiple texts
2. **Cache Results**: Store embeddings in Pinecone, don't regenerate
3. **Async Processing**: Run embedding generation in parallel when possible
4. **Error Handling**: Always wrap in try-catch

---

## 🔒 Security

### API Key Management

```typescript
// ✅ Good: Use environment variables
const apiKey = process.env.PINECONE_API_KEY;

// ❌ Bad: Hardcode keys
const apiKey = 'your-key-here';
```

### Rate Limiting

Pinecone Inference API has rate limits:
- **Free Tier**: 1000 requests/day
- **Starter**: 10,000 requests/day
- **Enterprise**: Custom limits

---

## 🐛 Troubleshooting

### Error: "Pinecone embedding error: 401"
**Cause**: Invalid API key

**Fix**:
```bash
# Verify environment variable
echo $PINECONE_API_KEY

# Check .env file
cat .env | grep PINECONE_API_KEY
```

### Error: "Dimension mismatch"
**Cause**: Index has wrong dimensions (e.g., 1536 instead of 1024)

**Fix**: Create new index with 1024 dimensions

### Error: "Rate limit exceeded"
**Cause**: Too many embedding requests

**Fix**: 
- Implement caching
- Upgrade Pinecone plan
- Batch requests

---

## 📊 Monitoring

### Log Embedding Performance

```typescript
const startTime = Date.now();
const embedding = await generateEmbedding(text);
const duration = Date.now() - startTime;

console.log(`Embedding generated in ${duration}ms`);
```

### Track Errors

```typescript
try {
  const embedding = await generateEmbedding(text);
} catch (error) {
  console.error('Embedding failed:', {
    text: text.substring(0, 100),
    error: error.message,
    timestamp: new Date().toISOString(),
  });
  throw error;
}
```

---

## 🔄 Comparison with OpenAI

| Feature | OpenAI (Old) | Pinecone (New) |
|---------|-------------|----------------|
| Model | text-embedding-3-small | multilingual-e5-large |
| Dimensions | 1536 | 1024 |
| Latency | ~500ms | ~300ms |
| Cost | $0.00002/1k tokens | Included with Pinecone |
| Setup | Separate API key | Same as Pinecone |
| Languages | Primarily English | Multilingual |

---

## 🚀 Advanced Usage

### Semantic Similarity

```typescript
import { generateEmbedding } from '@/lib/embeddings/client';

const query = "budget apps";
const candidates = [
  "Best budgeting applications",
  "Career planning tools",
  "Task management software"
];

// Generate embeddings
const queryEmb = await generateEmbedding(query);
const candidateEmbs = await generateEmbeddings(candidates);

// Calculate cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magA * magB);
}

const similarities = candidateEmbs.map((emb, i) => ({
  text: candidates[i],
  similarity: cosineSimilarity(queryEmb, emb)
}));

console.log(similarities);
// Expected: "Best budgeting applications" has highest similarity
```

---

## 📚 Resources

- [Pinecone Inference Docs](https://docs.pinecone.io/guides/inference/understanding-inference)
- [Embedding Models](https://docs.pinecone.io/guides/inference/models)
- [Best Practices](https://docs.pinecone.io/guides/inference/best-practices)

---

## ✅ Summary

Navia's embedding system:
- Uses **Pinecone Inference API** (multilingual-e5-large)
- Generates **1024-dimensional vectors**
- Powers **RAG, chat history, user profiles, tasks, and peer matching**
- **Fast** (~300ms) and **cost-effective**
- **No OpenAI required**

All embeddings are stored in Pinecone for semantic search and retrieval! 🎯

