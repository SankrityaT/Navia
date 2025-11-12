import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_URL 
  ? `${process.env.NEXT_PUBLIC_URL}/api/auth/spotify/callback`
  : 'http://localhost:3000/api/auth/spotify/callback';

const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'user-read-email',
  'user-read-private',
].join(' ');

export async function GET(request: NextRequest) {
  console.log('🎵 [SPOTIFY AUTH] Starting Spotify OAuth flow');
  console.log('🎵 [SPOTIFY AUTH] NEXT_PUBLIC_URL:', process.env.NEXT_PUBLIC_URL);
  console.log('🎵 [SPOTIFY AUTH] Redirect URI:', SPOTIFY_REDIRECT_URI);
  console.log('🎵 [SPOTIFY AUTH] Client ID exists:', !!SPOTIFY_CLIENT_ID);
  console.log('🎵 [SPOTIFY AUTH] Client Secret exists:', !!SPOTIFY_CLIENT_SECRET);

  if (!SPOTIFY_CLIENT_ID) {
    console.error('❌ [SPOTIFY AUTH] Missing SPOTIFY_CLIENT_ID');
    return NextResponse.json(
      { error: 'Spotify client ID not configured' },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SCOPES,
    show_dialog: 'true',
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  
  console.log('🎵 [SPOTIFY AUTH] Redirecting to:', authUrl);
  
  return NextResponse.redirect(authUrl);
}
