# API Keys Setup Guide

## 🔑 Required API Keys

You need **1 key** to get the iOS app working with your existing backend:

### **Clerk Publishable Key** (REQUIRED)

Your existing web app already uses Clerk. You just need to add the same Clerk key to the iOS app.

---

## 📝 Where to Get Your Keys

### 1. Clerk Publishable Key

**From your web app:**
1. Check your `.env.local` file in the Next.js project
2. Look for: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...` or `pk_live_...`
3. Copy the value (starts with `pk_test_` or `pk_live_`)

**Or from Clerk Dashboard:**
1. Go to https://dashboard.clerk.com
2. Select your Navia application
3. Go to **API Keys** section
4. Copy the **Publishable Key**

---

## 📱 How to Add Keys to iOS App

### Option 1: Xcode Scheme (Recommended for Development)

1. Open your project in Xcode
2. Click on the scheme dropdown (next to play button) → **Edit Scheme**
3. Select **Run** → **Arguments** tab
4. Under **Environment Variables**, click **+** and add:

```
Name: CLERK_PUBLISHABLE_KEY
Value: pk_test_your_key_here (paste your key)
```

5. Click **Close**

### Option 2: Info.plist (For Production Build)

1. Open `Info.plist` in Xcode
2. Right-click → **Add Row**
3. Add these keys:

```xml
<key>CLERK_PUBLISHABLE_KEY</key>
<string>$(CLERK_PUBLISHABLE_KEY)</string>
```

4. Then set the environment variable in your CI/CD or build settings

### Option 3: .xcconfig File (Team Development)

1. Create file: `navia-app/Config/Development.xcconfig`
2. Add:

```xcconfig
CLERK_PUBLISHABLE_KEY = pk_test_your_key_here
```

3. In Xcode: Project Settings → Configurations → Set this file for Debug
4. **Add to .gitignore!**

```gitignore
# Add to .gitignore
*.xcconfig
Config/Development.xcconfig
Config/Production.xcconfig
```

---

## 🚀 What About Other Services?

### Supabase, Pinecone, Groq - NO iOS KEYS NEEDED! ✅

Your iOS app **does NOT** need keys for:
- ❌ Supabase
- ❌ Pinecone
- ❌ Groq AI

**Why?** The iOS app talks to your **Next.js backend**, which handles all of these services.

**Architecture:**
```
iOS App
  → Clerk Auth (gets token)
  → Next.js API (with auth token)
    → Supabase (Next.js has key)
    → Pinecone (Next.js has key)
    → Groq (Next.js has key)
```

This is **more secure** because:
- API keys stay on your server
- iOS app only has Clerk auth token
- If someone decompiles the app, they can't steal your Supabase/Groq keys

---

## 🔧 Optional: Backend URL Configuration

### Development (Local Testing)

If you're running Next.js locally (npm run dev), tell the iOS app to connect to localhost:

**In Xcode Scheme Environment Variables:**
```
Name: NAVIA_API_URL
Value: http://localhost:3000
```

### Production

By default, the app uses `https://navia.app`. To override:

**In Xcode Scheme Environment Variables:**
```
Name: NAVIA_API_URL
Value: https://your-custom-domain.com
```

---

## ✅ Checklist

Before running the app, make sure:

- [ ] Copied Clerk publishable key from web app or Clerk dashboard
- [ ] Added `CLERK_PUBLISHABLE_KEY` to Xcode scheme environment variables
- [ ] (Optional) Added `NAVIA_API_URL` if testing with local backend
- [ ] Next.js backend is running (`npm run dev` or deployed to production)
- [ ] Backend has Clerk, Supabase, Pinecone, Groq keys configured

---

## 🐛 Troubleshooting

### "Clerk publishable key not configured"

**Problem:** You see this warning in console

**Solution:**
1. Check Xcode scheme environment variables
2. Make sure key starts with `pk_test_` or `pk_live_`
3. Restart Xcode after adding key

### "All API calls fail with 401 Unauthorized"

**Problem:** Can't load tasks, chat doesn't work

**Possible causes:**
1. **Clerk key is wrong** → Double-check you copied the full key
2. **Backend not running** → Start Next.js: `npm run dev`
3. **Backend can't reach Supabase** → Check backend logs
4. **Auth token expired** → Sign out and sign back in

### "Can't connect to backend"

**Problem:** Network errors, timeouts

**Solution:**
1. Check backend is running: `curl http://localhost:3000/api/health`
2. Make sure `NAVIA_API_URL` is correct (include http:// or https://)
3. For localhost: Use your Mac's IP address, not `localhost` (e.g., `http://192.168.1.5:3000`)
4. Check iOS simulator/device can reach backend network

### "How do I find my Mac's IP for localhost testing?"

```bash
# On Mac, run:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Example output:
#   inet 192.168.1.5 netmask 0xffffff00 broadcast 192.168.1.255

# Use the IP (192.168.1.5) in NAVIA_API_URL:
# NAVIA_API_URL=http://192.168.1.5:3000
```

---

## 🎯 Quick Start (TL;DR)

1. Get Clerk key from web app `.env.local` or Clerk dashboard
2. In Xcode: Edit Scheme → Run → Arguments → Environment Variables
3. Add: `CLERK_PUBLISHABLE_KEY = pk_test_your_key`
4. (Optional) Add: `NAVIA_API_URL = http://localhost:3000` for local testing
5. Run the app!

---

## 📚 Resources

- **Clerk iOS SDK Docs:** https://clerk.com/docs/references/ios/overview
- **Your Clerk Dashboard:** https://dashboard.clerk.com
- **Backend Integration Status:** See `BACKEND_INTEGRATION.md`
- **UI Comparison Guide:** See `UI_COMPARISON.md`

---

**Questions?** Check the backend integration docs or Clerk's iOS documentation.
