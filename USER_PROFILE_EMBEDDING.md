# User Profile Embedding System

## Overview

The user profile embedding system stores comprehensive user data in Pinecone, enabling AI agents to provide personalized, context-aware responses based on each user's unique executive function challenges and goals.

---

## 🎯 What Gets Stored

### Data Stored in Pinecone

When a user completes onboarding, we store:

**Vector ID**: `profile_{userId}` (using Clerk's userId)

**Embedding**: 1536-dimensional vector from OpenAI text-embedding-3-small

**Metadata**:
- `user_id`: Clerk userId (for filtering)
- `type`: "profile" (for type filtering)
- `name`: User's name
- `graduation_date`: When they graduated
- `university`: Their university
- `ef_challenges`: Comma-separated list (e.g., "task_initiation, time_management")
- `goals`: Comma-separated list (e.g., "find_job, financial_stability")
- `timestamp`: When profile was created
- Individual flags: `ef_task_initiation: true`, `goal_find_job: true`, etc.

### Profile Text for Embedding

The embedding is generated from this comprehensive text:

```
User Profile: [Name]
Background: Graduated from [University] on [Date].
Executive Function Challenges: [task initiation, time management, etc.].
These challenges may affect task initiation, time management, organization, and daily planning.
Current Life Goals: [find job, save money, etc.].
User is a neurodivergent young adult navigating post-college life transitions.
They benefit from structured guidance, breakdown of complex tasks, and supportive, non-judgmental communication.
```

This rich text helps AI agents understand the user's full context semantically.

---

## 📝 Implementation Details

### Files Modified/Created

**Modified:**
1. `lib/openai/client.ts`
   - Updated `generateEmbedding()` to use text-embedding-3-small (1536 dims)
   - Added batch embedding support

2. `lib/pinecone/operations.ts`
   - Enhanced `storeUserProfile()` with proper typing
   - Added `getUserProfile()` for retrieval
   - Added `updateUserProfile()` for updates

3. `app/api/onboarding/route.ts`
   - Uncommented and enhanced profile storage
   - Added graceful error handling
   - Creates embedding and stores in Pinecone

**Created:**
4. `app/api/profile/route.ts`
   - GET: Retrieve user profile
   - PATCH: Update user profile

5. `lib/pinecone/user-context.ts`
   - Helper functions for agents to access user context
   - EF-specific recommendations
   - Context formatting for LLMs

---

## 🔄 Flow Diagram

```
User Completes Onboarding
    ↓
Extract EF challenges & goals
    ↓
Create profile text (rich, semantic)
    ↓
Generate embedding (OpenAI text-embedding-3-small)
    ↓
Store in Pinecone
    ├── Vector ID: profile_{userId}
    ├── Embedding: 1536-dim vector
    └── Metadata: name, ef_challenges, goals, etc.
    ↓
Update Clerk metadata (for quick access)
    ↓
Return success to frontend
```

---

## 🚀 Usage Examples

### 1. During Onboarding (Automatic)

When user submits onboarding form:

```typescript
// Happens automatically in /api/onboarding
POST /api/onboarding
{
  "name": "Alex",
  "graduation_date": "2024-05",
  "university": "State University",
  "ef_profile": {
    "task_initiation": true,
    "time_management": true,
    "organization": false
  },
  "current_goals": {
    "find_job": true,
    "financial_stability": true
  }
}

// Response
{
  "success": true,
  "message": "Onboarding complete! Your profile has been saved."
}
```

**What happens:**
1. Clerk metadata updated
2. Profile text generated
3. Embedding created via OpenAI
4. Stored in Pinecone with ID `profile_{userId}`
5. Console logs: `✅ User profile stored in Pinecone for Alex (user_123...)`

### 2. Retrieve User Profile

```typescript
GET /api/profile
Authorization: Bearer {clerkToken}

// Response
{
  "success": true,
  "profile": {
    "userId": "user_123...",
    "name": "Alex",
    "graduation_date": "2024-05",
    "university": "State University",
    "ef_challenges": ["task_initiation", "time_management"],
    "goals": ["find_job", "financial_stability"],
    "timestamp": 1234567890
  }
}
```

### 3. Update User Profile

```typescript
PATCH /api/profile
{
  "ef_profile": {
    "task_initiation": true,
    "time_management": true,
    "organization": true,  // New challenge added
    "focus": true          // New challenge added
  }
}

// Response
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**What happens:**
1. New embedding generated with updated data
2. Pinecone vector updated with same ID
3. Metadata refreshed

### 4. Use in AI Agents

```typescript
import { getUserContextForAgent, formatUserContextForLLM } from '@/lib/pinecone/user-context';

// In agent processing
const userContext = await getUserContextForAgent(userId);

if (userContext) {
  const contextText = formatUserContextForLLM(userContext);
  
  // Add to agent prompt
  const prompt = `${AGENT_SYSTEM_PROMPT}

USER CONTEXT:
${contextText}

USER QUERY: "${query}"`;
}
```

**Agent receives:**
```
User: Alex
Education: State University (graduated 2024-05)
Executive Function Challenges: task_initiation, time_management
Current Goals: find_job, financial_stability

This user is a neurodivergent young adult. Please provide:
- Supportive, non-judgmental guidance
- Clear, structured responses
- Task breakdowns when appropriate
- Acknowledgment of executive function challenges
```

---

## 🔍 Query Capabilities

### 1. Fetch by User ID

```typescript
import { getUserProfile } from '@/lib/pinecone/operations';

const profile = await getUserProfile(userId);
```

### 2. Semantic Search (Future Enhancement)

```typescript
// Find users with similar challenges (for peer matching)
const similarUsers = await index.query({
  vector: userEmbedding,
  filter: { type: 'profile' },
  topK: 5
});
```

### 3. Metadata Filtering (Future Enhancement)

```typescript
// Find users with specific EF challenge
const usersWithTaskInitiation = await index.query({
  vector: zeroVector,
  filter: { 
    type: 'profile',
    ef_task_initiation: true
  },
  topK: 10
});
```

---

## 🧠 Why This Matters for AI Personalization

### 1. Context-Aware Responses

When a user asks: **"Help me organize my tasks"**

**Without profile:**
```
Here's how to organize tasks: 1. Make a list... 2. Prioritize...
```

**With profile (knows user has task_initiation challenges):**
```
I know task initiation can be tough. Let's start really small:

Step 1: Set a 2-minute timer and just write down ONE task (just one!)
Step 2: Take a break if needed
Step 3: When ready, add one more task

You don't need to organize everything today. Starting is the win.

Tip: Users with task initiation challenges often find the 5-minute rule helpful...
```

### 2. Goal Alignment

User profile shows: `goals: ["find_job", "financial_stability"]`

When they ask about anything, agent can:
- Connect advice back to their goals
- Suggest related resources
- Track progress toward stated goals

### 3. Breakdown Suggestions

```typescript
import { shouldSuggestBreakdown } from '@/lib/pinecone/user-context';

if (shouldSuggestBreakdown(userContext.efChallenges)) {
  // Automatically offer breakdown for complex tasks
  // Users with task_initiation, overwhelm, anxiety, etc. benefit most
}
```

### 4. Energy-Level Adaptation

```typescript
import { getEnergyLevelGuidance } from '@/lib/pinecone/user-context';

const guidance = getEnergyLevelGuidance(
  userContext.energyLevel, // from dashboard
  userContext.efChallenges
);

// Low energy + task_initiation challenge
// → Suggests only 1-2 micro-steps, emphasizes rest
```

---

## 🛠️ Technical Specifications

### Embedding Model
- **Model**: OpenAI text-embedding-3-small
- **Dimensions**: 1536
- **Cost**: ~$0.00002 per 1K tokens
- **Speed**: ~100ms per embedding

### Pinecone Index Requirements
- **Dimensions**: 1536 (must match embedding model)
- **Metric**: cosine similarity
- **Index Name**: navia-index (or PINECONE_INDEX_NAME from .env)

### Vector ID Format
```
profile_{clerkUserId}
```

Example: `profile_user_2abc123XYZ456`

### Storage Pattern
- One vector per user (upsert updates existing)
- Metadata stored alongside vector
- Retrievable by user ID via fetch
- Searchable semantically via query

---

## 🔒 Privacy & Security

### Data Stored
- Only data user explicitly provides during onboarding
- No sensitive information (no passwords, no financial data)
- Can be deleted on user request

### Access Control
- User ID from Clerk authentication required
- Users can only access their own profile
- Agents retrieve profile in secure backend context

### GDPR Compliance
- User can request profile deletion
- Profile can be exported as JSON
- Clear consent during onboarding

---

## 🧪 Testing

### Test Profile Storage

```bash
# 1. Complete onboarding
POST http://localhost:3000/api/onboarding
{
  "name": "Test User",
  "graduation_date": "2024-05",
  "university": "Test University",
  "ef_profile": {"task_initiation": true, "time_management": true},
  "current_goals": {"find_job": true}
}

# Check console for:
# ✅ User profile stored in Pinecone for Test User (user_...)

# 2. Retrieve profile
GET http://localhost:3000/api/profile

# Should return profile data

# 3. Update profile
PATCH http://localhost:3000/api/profile
{
  "ef_profile": {"task_initiation": true, "focus": true}
}

# 4. Verify in Pinecone
# Go to Pinecone console → Index → Vectors → Search for profile_{userId}
```

---

## 📊 Metadata Structure Example

```json
{
  "id": "profile_user_2abc123XYZ",
  "values": [0.123, -0.456, ...], // 1536 dimensions
  "metadata": {
    "user_id": "user_2abc123XYZ",
    "type": "profile",
    "name": "Alex",
    "graduation_date": "2024-05",
    "university": "State University",
    "ef_challenges": "task_initiation, time_management",
    "goals": "find_job, financial_stability",
    "timestamp": 1234567890,
    "ef_task_initiation": true,
    "ef_time_management": true,
    "goal_find_job": true,
    "goal_financial_stability": true
  }
}
```

---

## 🔄 Integration with Multi-Agent System

The agents already support user context via `userContext` parameter. Now they can automatically fetch full profile:

```typescript
// In any agent (finance.ts, career.ts, daily-task.ts)
import { getUserContextForAgent } from '@/lib/pinecone/user-context';

const userProfile = await getUserContextForAgent(userId);

if (userProfile) {
  // Use profile data for personalization
  const efRecommendations = getEFRecommendations(userProfile.efChallenges);
  
  // Add to agent context
  agentContext.userProfile = userProfile;
}
```

---

## ✅ Checklist for Setup

- [x] Update `generateEmbedding()` to use text-embedding-3-small
- [x] Enhance `storeUserProfile()` with proper types
- [x] Add `getUserProfile()` retrieval function
- [x] Add `updateUserProfile()` update function
- [x] Uncomment profile storage in onboarding route
- [x] Create `/api/profile` endpoint for retrieval/updates
- [x] Create `user-context.ts` helpers for agents
- [x] Add graceful error handling
- [x] Add console logging for debugging

---

## 🎉 Benefits

1. **Personalized AI Responses** - Agents understand each user's unique challenges
2. **Context Continuity** - User doesn't repeat their situation every conversation
3. **Better Recommendations** - EF-specific tips based on actual challenges
4. **Goal Alignment** - Advice connected to user's stated goals
5. **Automatic Adaptation** - Breakdown triggers, energy adjustments, etc.
6. **Semantic Search Ready** - Can find similar users for peer matching
7. **Scalable** - Vector DB handles millions of users efficiently

---

**Implementation Status**: ✅ Complete and Ready for Use

All user profiles from onboarding are now automatically stored in Pinecone with embeddings for AI personalization!

