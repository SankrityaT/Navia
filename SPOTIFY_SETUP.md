# Spotify Integration Setup

This guide will help you set up Spotify integration for the Focus Mode feature.

## Prerequisites

1. A Spotify account (Free or Premium)
2. Spotify Developer account access

## Setup Steps

### 1. Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create app"
4. Fill in the details:
   - **App name**: Navia Focus Mode
   - **App description**: Focus mode with music integration
   - **Redirect URI**: `http://127.0.0.1:3000/api/auth/spotify/callback` (development loopback IP)
   - Optional IPv6 loopback: `http://[::1]:3000/api/auth/spotify/callback`
   - For production, add: `https://your-domain.com/api/auth/spotify/callback`
   - **APIs used**: Web API
5. Accept the terms and click "Save"

### 2. Get Your Credentials

1. In your app's dashboard, click "Settings"
2. Copy your **Client ID**
3. Click "View client secret" and copy your **Client Secret**

### 3. Add Environment Variables

Add these to your `.env.local` file:

```env
# Spotify Integration
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_URL=http://127.0.0.1:3000
```

If you're using IPv6 locally, set `NEXT_PUBLIC_URL=http://[::1]:3000`. For production, update `NEXT_PUBLIC_URL` to your actual domain.

### 4. Update Redirect URIs

When deploying to production:

1. Go back to your Spotify app settings
2. Add your production redirect URI: `https://your-domain.com/api/auth/spotify/callback`
3. Save the changes

## Features

### Focus Mode Music Integration

- **Spotify Integration**: Connect your Spotify account to play your own playlists
- **Lofi Fallback**: If Spotify isn't connected, enjoy curated lofi beats
- **Playback Controls**: Play, pause, skip tracks, and adjust volume
- **Seamless Experience**: Music automatically pauses when you pause your focus session

### User Experience

1. Start a focus session
2. Click "Add Focus Music" to expand the music player
3. Connect Spotify (optional) or use the built-in lofi tracks
4. Control playback without leaving your focus session
5. Music state syncs with your focus session (pauses when you pause)

## Troubleshooting

### "Not authenticated with Spotify" error

- Make sure you've connected your Spotify account
- Try disconnecting and reconnecting
- Check that your access token hasn't expired

### Music not playing

- Ensure you have an active Spotify session (open Spotify app/web player)
- For Spotify Free users, you need an active device playing
- Try the lofi fallback option

### Redirect URI mismatch

- Ensure the redirect URI in your Spotify app settings exactly matches your environment variable
- When developing locally, use a loopback IP (`127.0.0.1` or `[::1]`) instead of `localhost`
- Don't forget the `/api/auth/spotify/callback` path

## API Endpoints

- `GET /api/auth/spotify` - Initiates Spotify OAuth flow
- `GET /api/auth/spotify/callback` - Handles OAuth callback
- `POST /api/spotify/player` - Controls playback (play/pause/next)
- `GET /api/spotify/player` - Gets current playback state

## Security Notes

- Client secrets are stored server-side only
- Access tokens are stored in HTTP-only cookies
- Tokens automatically refresh when expired
- Never commit `.env.local` to version control

## Support

For issues or questions:
- Check Spotify Developer docs: https://developer.spotify.com/documentation/web-api
- Review Next.js API routes documentation
- Ensure all environment variables are set correctly
