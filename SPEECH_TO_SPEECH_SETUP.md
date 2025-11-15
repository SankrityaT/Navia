# Quick Setup Guide: Speech-to-Speech with Hume EVI

## ✅ What's Been Implemented

Your Navia app now has **dual voice modes**:

1. **📻 Speech-to-Speech (EVI)** - Real-time empathic voice AI
2. **🔊 Text-to-Speech (TTS)** - Your existing voice mode

Both modes work independently without breaking each other!

## 🚀 Quick Start

### Step 1: Get Your Hume Secret Key

1. Go to https://platform.hume.ai/settings/keys
2. Copy your **API Key** (you already have this)
3. Copy your **Secret Key** (this is new, required for EVI)

### Step 2: Add to Environment Variables

Add this to your `.env.local` file:

```bash
# You already have this
HUME_API_KEY=your_api_key_here

# Add this new one for EVI
HUME_SECRET_KEY=your_secret_key_here
```

### Step 3: Restart Your Dev Server

```bash
npm run dev
```

### Step 4: Test It Out!

1. Open your app (e.g., dashboard or focus mode)
2. Look for the **Radio icon (📻)** button
3. Click it to enable Speech-to-Speech mode
4. Click the microphone and start speaking
5. Navia will respond in real-time with empathic voice!

## 🎯 How to Use

### Speech-to-Speech Mode (NEW)
- **Button:** Radio icon (📻)
- **What it does:** Real-time voice conversation with Navia
- **Best for:** Natural conversations, quick interactions
- **Features:** 
  - Instant responses
  - Can interrupt Navia
  - Automatic turn-taking
  - Emotion-aware responses

### Text-to-Speech Mode (EXISTING)
- **Button:** Volume icon (🔊)
- **What it does:** Traditional voice mode (speech → text → LLM → speech)
- **Best for:** When you need specific LLM behavior
- **Features:**
  - Uses your custom chat endpoints
  - Full control over LLM prompts
  - Text-based emotion detection

## 🔍 What Changed?

### New Files
- `app/api/evi/access-token/route.ts` - Authentication for EVI
- `hooks/useEviSpeechToSpeech.ts` - EVI connection management
- `docs/SPEECH_TO_SPEECH.md` - Full documentation

### Modified Files
- `components/ai/UniversalNavia.tsx` - Added EVI mode toggle
- `package.json` - Added `@humeai/voice-react` dependency

### Nothing Broken
- ✅ All existing TTS functionality works as before
- ✅ All existing chat endpoints unchanged
- ✅ All existing emotion detection intact
- ✅ Both modes work independently

## 🎨 UI Changes

You'll see **two new buttons** in the chat interface:

```
[Input Field] [📻 Radio] [🔊 Volume] [🎤 Mic/Send]
```

- **Radio (📻)** = Speech-to-Speech mode (EVI)
- **Volume (🔊)** = Text-to-Speech mode (existing)
- Only one can be active at a time
- Microphone behavior adapts to active mode

## 📊 Status Indicators

When using Speech-to-Speech mode, you'll see:
- "📡 Connecting to EVI..." - Establishing connection
- "Click mic to start conversation" - Ready to speak
- "🎤 Speaking... Click mic to stop" - You're speaking
- "🔊 Navia is responding..." - Navia is speaking

## ⚠️ Important Notes

1. **Secret Key Required:** EVI won't work without `HUME_SECRET_KEY`
2. **Browser Support:** Requires modern browsers (Chrome, Edge, Safari)
3. **Microphone Access:** Browser will ask for mic permissions
4. **Network:** Real-time mode needs stable internet connection

## 🐛 Troubleshooting

**"Connecting to EVI..." never completes**
→ Check that `HUME_SECRET_KEY` is set correctly in `.env.local`

**"Microphone access denied"**
→ Grant microphone permissions in your browser settings

**No audio playback**
→ Check browser audio permissions and output device

**Mode toggle not working**
→ Make sure only one mode is active at a time

## 📚 Learn More

- Full documentation: `docs/SPEECH_TO_SPEECH.md`
- Hume EVI docs: https://dev.hume.ai/docs/speech-to-speech-evi/overview
- Get API keys: https://platform.hume.ai/settings/keys

## 🎉 That's It!

You now have both text-to-speech AND speech-to-speech working together in Navia!

Try both modes and see which one you prefer for different use cases.
