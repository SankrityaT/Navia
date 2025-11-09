# Navia Mobile - React Native + Expo

Complete 1:1 mobile replica of the Navia web app.

## 🚀 Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run the app
npm start
```

## 📱 Features

- ✅ Full authentication with Clerk
- ✅ 4-step onboarding flow
- ✅ Dashboard with energy tracking
- ✅ Task management (Kanban + List views)
- ✅ AI chat with 3 personas
- ✅ Peer network with swipe UI
- ✅ Native iOS & Android support

## 📁 Structure

```
app/
├── (auth)/          # Authentication screens
├── (tabs)/          # Main app tabs
├── _layout.tsx      # Root layout
└── index.tsx        # Landing screen

components/
├── auth/            # Onboarding steps
├── dashboard/       # Dashboard components
├── tasks/           # Task management
├── chat/            # Chat interface
└── peers/           # Peer network

services/
├── api.ts           # API client
├── supabase.ts      # Supabase client
└── storage.ts       # Storage helpers
```

## 🎨 Same as Web App

All components, types, and logic are converted from the web app:
- Same TypeScript types
- Same API endpoints
- Same business logic
- Mobile-optimized UI

See SETUP.md for detailed instructions.
