# Navia Mobile App Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/ikinjalc/Navia/navia-mobile
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Run the App

```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## 📱 App Structure

The mobile app is a 1:1 replica of the web app with:

- ✅ Same TypeScript types
- ✅ Same API calls
- ✅ Same business logic
- ✅ Mobile-optimized UI components
- ✅ Native gestures and animations

## 🎨 Features Implemented

### Authentication
- Sign In / Sign Up with Clerk
- 4-step onboarding flow (OnboardingStep1-4)
- Secure token storage

### Dashboard
- Energy tracking with slider
- Today's Focus tasks
- Quick Wins sidebar
- Progress Tracker

### Tasks
- Kanban board with drag & drop
- List view with filters
- Task creation and editing
- Priority and category management

### Chat
- 3 AI personas (Career, Finance, Daily Tasks)
- Real-time messaging
- Context-aware responses
- Task creation from chat

### Peers
- Swipe-style peer matching
- Connection management
- Profile viewing

## 🔧 Development

All components are in TypeScript and follow React Native best practices.

The app uses:
- Expo Router for navigation
- Clerk for authentication
- Supabase for backend
- React Native Reanimated for animations
- React Native Gesture Handler for gestures

## 📝 Next Steps

After running `npm install`, all TypeScript errors will resolve.

The app is ready to run!
