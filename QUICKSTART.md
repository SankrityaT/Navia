# NAVIA - QUICKSTART (5 MINUTES)

Get Navia running in 5 minutes.

## Step 1: Environment Variables (2 min)

Open `.env.local` and add your keys:

```env
# Get from https://clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Get from https://pinecone.io
PINECONE_API_KEY=xxxxx
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX_NAME=navia-users

# Get from https://platform.openai.com
OPENAI_API_KEY=sk-xxxxx
```

## Step 2: Run Dev Server (1 min)

```bash
cd navia
npm run dev
```

## Step 3: Open Browser (1 min)

Go to: http://localhost:3000

## Step 4: Test (1 min)

- ✅ Landing page loads
- ✅ Click "Get Started Free"
- ✅ Sign up with email
- ✅ Complete onboarding
- ✅ See dashboard

## Done! 🎉

Now read:
- **Frontend devs**: `FRONTEND_README.md`
- **Backend devs**: `BACKEND_README.md`

## Troubleshooting

**"Clerk keys not found"**
→ Restart dev server after adding .env.local

**"Module not found"**
→ Run `npm install`

**Port 3000 in use**
→ Run `npm run dev -- -p 3001`

## Project Structure

```
navia/
├── app/              # Pages & API
├── components/       # React components
├── lib/              # Backend utils
└── *.md             # Documentation
```

## What to Build

See `TASK_DIVISION.md` for complete task list.

**Frontend**: Forms, API integration, drag & drop, chat UI
**Backend**: Pinecone ops, OpenAI integration, API routes

Let's go! 🚀
