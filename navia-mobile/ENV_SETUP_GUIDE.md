# Environment Setup Guide - Navia Mobile

## ✅ All Required API Keys

Your mobile app needs the same API keys as the web app. Copy them from your existing `.env.local` file.

### 1. Copy Your Existing Keys

```bash
cd /Users/ikinjalc/Navia/navia-mobile

# Copy your web app's .env.local and convert prefixes
cp ../.env.local .env.local
```

### 2. Update Prefixes

Change `NEXT_PUBLIC_` to `EXPO_PUBLIC_` for all public keys:

**Your `.env.local` should look like this:**

```env
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (Database)
EXPO_PUBLIC_SUPABASE_URL=https://lomexlacflymoiulgjzn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Pinecone (Vector DB)
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=navia-index
PINECONE_ENVIRONMENT=us-east-1-aws

# Groq (LLM)
GROQ_API_KEY=gsk_...

# Tavily (Web Search - Optional)
TAVILY_API_KEY=tvly-...

# API Base URL (points to your Next.js backend)
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## 🔗 What Each Service Does

### Clerk (Authentication)
- **Used for**: User sign-up, sign-in, session management
- **Mobile screens**: Sign In, Sign Up, Dashboard (user info)
- **Status**: ✅ Fully integrated

### Supabase (Database)
- **Used for**: Storing user profiles, tasks, peer connections
- **Mobile screens**: Dashboard, Tasks, Peers
- **Status**: ✅ Client configured, ready for queries

### Pinecone (Vector Embeddings)
- **Used for**: AI-powered chat context and matching
- **Mobile screens**: Chat (AI responses)
- **Status**: ⚠️ Backend only (web app handles this)

### Groq (LLM)
- **Used for**: Fast AI responses in chat
- **Mobile screens**: Chat interface
- **Status**: ⚠️ Backend only (web app API handles this)

### Tavily (Web Search)
- **Used for**: Real-time web search in AI responses
- **Mobile screens**: Chat (optional feature)
- **Status**: ⚠️ Backend only (optional)

## 🚀 How It Works

### Mobile App Architecture

```
Mobile App (React Native/Expo)
    ↓
Clerk (Direct) - Authentication
    ↓
Supabase (Direct) - Database queries
    ↓
Next.js Backend API (http://localhost:3000/api)
    ↓
Groq + Pinecone + Tavily (Server-side only)
```

### What Runs Where

**Mobile App Directly Connects To:**
- ✅ Clerk - For authentication
- ✅ Supabase - For database (tasks, profiles, peers)

**Mobile App Calls Backend API For:**
- 🔄 Chat messages → `/api/query` (uses Groq + Pinecone)
- 🔄 Onboarding → `/api/onboarding` (saves to Supabase + Pinecone)
- 🔄 Task generation → `/api/tasks` (uses Groq)

## 📝 Setup Steps

### Step 1: Copy Environment Variables

```bash
cd /Users/ikinjalc/Navia/navia-mobile

# Edit .env.local with your keys
nano .env.local
```

### Step 2: Verify Keys Are Loaded

```bash
# Start the app
npm start

# Check console - you should see:
# ✅ Clerk loaded
# ✅ Supabase connected
# ⚠️ If you see warnings, check your .env.local
```

### Step 3: Start Backend (Required for Chat)

The mobile app needs your Next.js backend running for AI features:

```bash
# In a separate terminal
cd /Users/ikinjalc/Navia
npm run dev
```

This starts the backend at `http://localhost:3000`

### Step 4: Test Each Feature

1. **Authentication** ✅
   - Sign up with email
   - Verify email code
   - Sign in

2. **Onboarding** ✅
   - Complete 4 steps
   - Data saves to Supabase

3. **Dashboard** ✅
   - Shows user name from Clerk
   - Displays tasks from Supabase

4. **Tasks** ✅
   - View tasks (Supabase)
   - Create/update (calls backend API)

5. **Chat** 🔄
   - Requires backend running
   - Calls `/api/query` → Groq + Pinecone

6. **Peers** ✅
   - View matches (Supabase)
   - Connect (saves to Supabase)

## 🐛 Troubleshooting

### "Clerk publishableKey missing"
```bash
# Check your .env.local has:
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Restart the app
npm start
```

### "Supabase credentials not found"
```bash
# Check your .env.local has:
EXPO_PUBLIC_SUPABASE_URL=https://...
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Restart the app
```

### "Network Error" in Chat
```bash
# Make sure backend is running:
cd /Users/ikinjalc/Navia
npm run dev

# Check it's on http://localhost:3000
# Then try chat again
```

### "Cannot connect to localhost" (on physical device)
```bash
# If testing on real phone, use your computer's IP:
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3000/api

# Find your IP:
ifconfig | grep "inet "
```

## ✅ Verification Checklist

- [ ] `.env.local` exists in `/navia-mobile/`
- [ ] All `EXPO_PUBLIC_` prefixes (not `NEXT_PUBLIC_`)
- [ ] Clerk keys copied from web app
- [ ] Supabase URL and keys copied
- [ ] Backend running on `localhost:3000`
- [ ] Can sign up and sign in
- [ ] Dashboard shows user name
- [ ] Tasks load from Supabase
- [ ] Chat works (with backend running)

## 🎯 Quick Reference

| Feature | Requires Backend | Direct Connection |
|---------|-----------------|-------------------|
| Sign In/Up | No | Clerk |
| Onboarding | Yes (save) | Clerk + Supabase |
| Dashboard | No | Clerk + Supabase |
| Tasks (view) | No | Supabase |
| Tasks (create) | Yes | Backend API |
| Chat | Yes | Backend API |
| Peers | No | Supabase |

## 📱 Ready to Test!

```bash
# Terminal 1: Start backend
cd /Users/ikinjalc/Navia
npm run dev

# Terminal 2: Start mobile app
cd /Users/ikinjalc/Navia/navia-mobile
npm start

# Scan QR code with Expo Go
# Test all features!
```

Your mobile app is now fully connected to all services! 🎉
