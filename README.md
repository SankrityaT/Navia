# NAVIA - Beyond the Cliff

AI executive function coach for post-college neurodivergent young adults.

## 🎯 Project Overview

**Problem**: 30-40% unemployment rate for neurodivergent young adults. All support disappears at graduation.

**Solution**: Navia provides AI-powered executive function coaching with:
- Career support & task breakdown
- Personalized task management
- Progress tracking
- Peer network (future)

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Auth**: Clerk
- **Vector DB**: Pinecone
- **AI**: OpenAI GPT-4
- **Icons**: Lucide React

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.local` and add your keys:
```env
# Clerk (get from https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Pinecone (get from https://pinecone.io)
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=navia-users

# OpenAI (get from https://platform.openai.com)
OPENAI_API_KEY=sk-...
```

### 3. Set Up Pinecone Index
1. Create account at https://pinecone.io
2. Create index: `navia-users`
3. Dimensions: `1536` (OpenAI embeddings)
4. Metric: `cosine`

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
navia/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── onboarding/                 # User onboarding flow
│   ├── dashboard/                  # Main dashboard
│   ├── tasks/                      # Task visualizer (Kanban/List)
│   ├── chat/                       # AI chat interface
│   ├── peers/                      # Peer network
│   ├── sign-in/                    # Clerk sign-in
│   ├── sign-up/                    # Clerk sign-up
│   └── api/                        # API routes
│       ├── onboarding/             # Save user profile
│       ├── dashboard/energy/       # Daily energy tracking
│       ├── tasks/                  # Task CRUD
│       ├── chat/                   # AI chat with personas
│       └── peers/                  # Peer matching
├── components/
│   ├── landing/                    # Landing page sections
│   ├── auth/                       # Onboarding steps
│   ├── dashboard/                  # Dashboard components
│   ├── tasks/                      # Task views
│   ├── chat/                       # Chat interface
│   └── peers/                      # Peer cards
├── lib/
│   ├── pinecone/                   # Vector DB operations
│   │   ├── client.ts               # Pinecone init
│   │   ├── operations.ts           # Task operations
│   │   └── peers.ts                # Peer matching
│   ├── openai/                     # AI client
│   │   ├── client.ts               # OpenAI init
│   │   ├── personas.ts             # AI personas
│   │   └── functions.ts            # Function calling
│   └── types.ts                    # TypeScript types
├── FRONTEND_README.md              # Frontend dev guide
├── BACKEND_README.md               # Backend dev guide
└── TASK_DIVISION.md                # Team task breakdown
```

## 🎨 Features Implemented (Skeleton)

### ✅ Flow 1: Landing Page → Auth
- Hero section with CTA
- Problem section (support cliff visualization)
- Solution preview (3 cards)
- CTA footer
- Clerk sign-up/sign-in integration

### ✅ Flow 2: Onboarding
- Step 1: Basic info (name, graduation, university)
- Step 2: EF profile (executive function challenges)
- Step 3: Current goals (job search, finances, etc.)
- Step 4: Completion & redirect to dashboard

### ✅ Flow 3: Dashboard
- Header with greeting & energy meter
- Today's Focus (priority tasks)
- Quick Wins sidebar (< 10 min tasks)
- Progress Tracker (goal completion)

### ✅ Flow 4: Task Visualizer
- Kanban view (Not Started / In Progress / Completed)
- List view (grouped by category)
- View toggle
- Filter & sort options

### ✅ Flow 5: Chat with AI Personas
- 3 AI personas (Career, Finance, Daily Tasks)
- Auto-detect persona based on message
- Function calling (break_down_task, get_references)
- Context-aware responses with user EF profile
- Task creation from chat

### ✅ Flow 6: Peer Network
- Peer matching algorithm (Pinecone similarity)
- Match scoring (struggles, neurotype, interests)
- Swipe-style interface
- Connection management
- Group accountability (skeleton)

## 🔧 What Needs Implementation

### Frontend (see FRONTEND_README.md)
- Form validation
- API integration
- Drag & drop for Kanban
- Task creation/editing
- Chat modal ("Ask Navia")
- Loading states & error handling
- Mobile responsiveness
- Animations

### Backend (see BACKEND_README.md)
- Complete Pinecone operations
- Implement `updateTaskStatus`
- Add batch operations
- Complete function execution (break_down_task, get_references)
- Streaming chat responses
- Store conversation history
- Error handling & retry logic
- Rate limiting
- Task dependencies
- Peer connection management
- Group features

## 📚 Documentation

- **Frontend Devs**: Read `FRONTEND_README.md`
- **Backend Devs**: Read `BACKEND_README.md`

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 🔑 Key Concepts

### Pinecone Metadata Structure
```typescript
{
  user_id: string,
  type: 'task' | 'profile' | 'energy',
  status: 'not_started' | 'in_progress' | 'completed',
  priority: 'low' | 'medium' | 'high',
  category: 'career' | 'finance' | 'daily_life' | 'social',
  date: string,
  time_estimate: number
}
```

### Task Data Flow
1. User creates task → Frontend
2. POST /api/tasks → Backend
3. Generate embedding → OpenAI
4. Store vector → Pinecone
5. Query with filters → Retrieve tasks
6. Display in UI → Frontend

## 🚨 Important Notes

- This is a **COMPLETE SKELETON** for hackathon division of work
- All 6 major flows implemented with basic functionality
- Core functionality stubbed out with TODOs for implementation
- Mock data used in components (replace with real API calls)
- Drag-and-drop needs implementation
- AI function execution needs completion
- Streaming chat responses need implementation
- Peer connections/messaging need implementation
- Mobile responsiveness needs work

## 📝 License

MIT

## 👥 Team

Built for hackathon - divide and conquer!
