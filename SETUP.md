# NAVIA - SETUP GUIDE

Quick setup guide for getting Navia running locally.

## Prerequisites
- Node.js 18+ installed
- npm or yarn
- Accounts on: Clerk, Pinecone, OpenAI

## Step-by-Step Setup

### 1. Clone & Install
```bash
cd navia
npm install
```

### 2. Get API Keys

#### Clerk (Authentication)
1. Go to https://clerk.com
2. Create account → New application
3. Copy `Publishable Key` and `Secret Key`
4. In Clerk dashboard:
   - Go to "Paths" settings
   - Set sign-in URL: `/sign-in`
   - Set sign-up URL: `/sign-up`
   - Set after sign-in: `/onboarding`
   - Set after sign-up: `/onboarding`

#### Pinecone (Vector Database)
1. Go to https://pinecone.io
2. Create account (free tier available)
3. Create new index:
   - Name: `navia-users`
   - Dimensions: `1536`
   - Metric: `cosine`
   - Pod type: `s1` (starter)
4. Copy API key from dashboard
5. Note your environment (e.g., `us-east-1-aws`)

#### OpenAI (AI)
1. Go to https://platform.openai.com
2. Create account
3. Go to API keys section
4. Create new secret key
5. Copy the key (you won't see it again!)

### 3. Configure Environment Variables

Create `.env.local` in project root:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Pinecone Vector Database
PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=navia-users

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

## Verify Setup

### Test Landing Page
- [ ] Landing page loads at http://localhost:3000
- [ ] "Get Started Free" button visible
- [ ] No console errors

### Test Authentication
- [ ] Click "Get Started Free"
- [ ] Clerk sign-up modal opens
- [ ] Can create account with email
- [ ] Redirects to `/onboarding` after sign-up

### Test Onboarding
- [ ] Step 1: Basic info form loads
- [ ] Can navigate through all 4 steps
- [ ] Redirects to `/dashboard` after completion

### Test Dashboard
- [ ] Dashboard loads with user name
- [ ] Energy slider works
- [ ] Mock tasks display
- [ ] "View All Tasks" button works

### Test Task Visualizer
- [ ] Kanban view shows 3 columns
- [ ] List view shows grouped tasks
- [ ] View toggle works
- [ ] Mock data displays correctly

## Common Issues

### "Clerk keys not found"
- Make sure `.env.local` exists in project root
- Restart dev server after adding env vars
- Check keys don't have extra spaces

### "Pinecone connection failed"
- Verify API key is correct
- Check environment matches your Pinecone region
- Ensure index name is exactly `navia-users`
- Index must have 1536 dimensions

### "OpenAI API error"
- Verify API key is valid
- Check you have credits in OpenAI account
- Ensure no extra spaces in key

### Build errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### TypeScript errors
```bash
# Regenerate types
npm run build
```

## Next Steps After Setup

1. **Frontend Devs**: Read `FRONTEND_README.md`
   - Implement form validation
   - Connect components to API
   - Add drag & drop
   - Build chat modal

2. **Backend Devs**: Read `BACKEND_README.md`
   - Complete Pinecone operations
   - Implement task update logic
   - Add error handling
   - Build AI personas

## Development Workflow

```bash
# Start dev server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure Quick Reference

```
navia/
├── app/                    # Pages & API routes
├── components/             # React components
├── lib/                    # Backend utilities
├── .env.local             # Environment variables (create this)
├── README.md              # Main project README
├── FRONTEND_README.md     # Frontend dev guide
├── BACKEND_README.md      # Backend dev guide
└── SETUP.md              # This file
```

## Getting Help

- **Clerk Issues**: https://clerk.com/docs
- **Pinecone Issues**: https://docs.pinecone.io
- **OpenAI Issues**: https://platform.openai.com/docs
- **Next.js Issues**: https://nextjs.org/docs

## Ready to Code?

✅ Setup complete? Pick your track:
- **Frontend**: Open `FRONTEND_README.md`
- **Backend**: Open `BACKEND_README.md`

Let's build Navia! 🚀
