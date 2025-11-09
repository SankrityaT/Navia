# NAVIA - COMPLETE FILE TREE

## 📂 Project Structure

```
navia/
│
├── 📄 Documentation (6 files)
│   ├── README.md                    # Main project overview
│   ├── FRONTEND_README.md           # Frontend implementation guide
│   ├── BACKEND_README.md            # Backend implementation guide
│   ├── SETUP.md                     # Setup instructions
│   ├── TASK_DIVISION.md             # Team task breakdown
│   ├── PROJECT_SUMMARY.md           # What's been built
│   ├── QUICKSTART.md                # 5-minute quickstart
│   └── FILE_TREE.md                 # This file
│
├── 📱 App Directory (Pages & API)
│   ├── page.tsx                     # Landing page (/)
│   ├── layout.tsx                   # Root layout with ClerkProvider
│   ├── globals.css                  # Global styles
│   │
│   ├── 🔐 sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx             # Clerk sign-in page
│   │
│   ├── 🔐 sign-up/
│   │   └── [[...sign-up]]/
│   │       └── page.tsx             # Clerk sign-up page
│   │
│   ├── 📝 onboarding/
│   │   └── page.tsx                 # 4-step onboarding flow
│   │
│   ├── 📊 dashboard/
│   │   └── page.tsx                 # Main dashboard
│   │
│   ├── ✅ tasks/
│   │   └── page.tsx                 # Task visualizer (Kanban/List)
│   │
│   └── 🔌 api/
│       ├── onboarding/
│       │   └── route.ts             # POST - Save user profile
│       ├── dashboard/
│       │   └── energy/
│       │       └── route.ts         # POST - Save energy level
│       └── tasks/
│           └── route.ts             # GET/POST/PATCH/DELETE - Task CRUD
│
├── 🎨 Components (14 files)
│   ├── landing/                     # Landing page sections
│   │   ├── Hero.tsx                 # Hero with CTA
│   │   ├── Problem.tsx              # Support cliff visualization
│   │   ├── Solution.tsx             # Feature preview
│   │   └── CTAFooter.tsx            # Final CTA
│   │
│   ├── auth/                        # Onboarding flow
│   │   ├── OnboardingStep1.tsx      # Basic info
│   │   ├── OnboardingStep2.tsx      # EF profile
│   │   ├── OnboardingStep3.tsx      # Current goals
│   │   └── OnboardingStep4.tsx      # Completion
│   │
│   ├── dashboard/                   # Dashboard components
│   │   ├── Header.tsx               # Greeting + energy meter
│   │   ├── TodaysFocus.tsx          # Priority tasks
│   │   ├── QuickWins.tsx            # Micro-tasks sidebar
│   │   └── ProgressTracker.tsx      # Goal progress
│   │
│   └── tasks/                       # Task visualizer
│       ├── KanbanView.tsx           # 3-column board
│       └── ListView.tsx             # Grouped list
│
├── 🔧 Library (Backend Utils)
│   ├── types.ts                     # TypeScript interfaces
│   │
│   ├── pinecone/                    # Vector DB
│   │   ├── client.ts                # Pinecone initialization
│   │   └── operations.ts            # CRUD operations
│   │
│   └── openai/                      # AI
│       └── client.ts                # Embeddings + chat
│
├── ⚙️ Configuration
│   ├── middleware.ts                # Clerk auth protection
│   ├── .env.local                   # Environment variables
│   ├── next.config.ts               # Next.js config
│   ├── tailwind.config.ts           # Tailwind config
│   ├── tsconfig.json                # TypeScript config
│   ├── eslint.config.mjs            # ESLint config
│   ├── postcss.config.mjs           # PostCSS config
│   ├── package.json                 # Dependencies
│   └── .gitignore                   # Git ignore
│
└── 📦 Other
    ├── node_modules/                # Dependencies
    ├── .next/                       # Next.js build
    └── public/                      # Static assets
```

## 📊 File Count by Type

### Frontend (14 components)
- Landing: 4 files
- Auth: 4 files
- Dashboard: 4 files
- Tasks: 2 files

### Pages (6 routes)
- Landing page
- Sign-in
- Sign-up
- Onboarding
- Dashboard
- Tasks

### API Routes (3 endpoints)
- Onboarding
- Energy
- Tasks

### Backend (4 files)
- Pinecone: 2 files
- OpenAI: 1 file
- Types: 1 file

### Documentation (7 files)
- README files: 4
- Guides: 3

### Total: 35+ TypeScript/React files

## 🎯 What Each File Does

### Landing Page Flow
```
app/page.tsx
  ├── components/landing/Hero.tsx          → Hero section
  ├── components/landing/Problem.tsx       → Problem statement
  ├── components/landing/Solution.tsx      → Solution preview
  └── components/landing/CTAFooter.tsx     → Final CTA
```

### Onboarding Flow
```
app/onboarding/page.tsx
  ├── components/auth/OnboardingStep1.tsx  → Basic info
  ├── components/auth/OnboardingStep2.tsx  → EF profile
  ├── components/auth/OnboardingStep3.tsx  → Goals
  └── components/auth/OnboardingStep4.tsx  → Complete
      └── Calls: app/api/onboarding/route.ts
```

### Dashboard Flow
```
app/dashboard/page.tsx
  ├── components/dashboard/Header.tsx      → Greeting + energy
  │   └── Calls: app/api/dashboard/energy/route.ts
  ├── components/dashboard/TodaysFocus.tsx → Priority tasks
  ├── components/dashboard/QuickWins.tsx   → Micro-tasks
  └── components/dashboard/ProgressTracker.tsx → Progress
      └── All fetch from: app/api/tasks/route.ts
```

### Task Visualizer Flow
```
app/tasks/page.tsx
  ├── components/tasks/KanbanView.tsx      → Board view
  └── components/tasks/ListView.tsx        → List view
      └── Both fetch from: app/api/tasks/route.ts
```

### API Data Flow
```
Frontend Component
  ↓ fetch()
app/api/*/route.ts
  ↓ uses
lib/pinecone/operations.ts
  ↓ uses
lib/pinecone/client.ts
  ↓ connects to
Pinecone Vector DB
```

```
Frontend Component
  ↓ fetch()
app/api/*/route.ts
  ↓ uses
lib/openai/client.ts
  ↓ connects to
OpenAI API
```

## 🔍 Key Files to Know

### For Frontend Devs
**Start here:**
- `components/` - All UI components
- `app/page.tsx` - Landing page
- `app/dashboard/page.tsx` - Dashboard
- `app/tasks/page.tsx` - Task visualizer

**Reference:**
- `lib/types.ts` - Data structures
- `FRONTEND_README.md` - Implementation guide

### For Backend Devs
**Start here:**
- `app/api/` - All API routes
- `lib/pinecone/operations.ts` - Vector DB ops
- `lib/openai/client.ts` - AI client

**Reference:**
- `lib/types.ts` - Data structures
- `BACKEND_README.md` - Implementation guide

## 📝 File Naming Conventions

- **Pages**: `page.tsx` (Next.js convention)
- **API Routes**: `route.ts` (Next.js convention)
- **Components**: `PascalCase.tsx`
- **Utils**: `camelCase.ts`
- **Types**: `types.ts`
- **Config**: `*.config.*`

## 🚀 Where to Start

1. **Setup**: Read `QUICKSTART.md`
2. **Overview**: Read `README.md`
3. **Your role**:
   - Frontend → `FRONTEND_README.md`
   - Backend → `BACKEND_README.md`
4. **Tasks**: Read `TASK_DIVISION.md`
5. **Build**: Start coding!

## 💡 Pro Tips

- All components have TODO comments
- Mock data is used everywhere (replace with API)
- TypeScript types are in `lib/types.ts`
- Environment variables in `.env.local`
- Clerk handles all auth automatically
