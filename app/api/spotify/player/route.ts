import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  // Try to get token from Authorization header first, then cookies
  const authHeader = request.headers.get('authorization');
  let accessToken = authHeader?.replace('Bearer ', '');
  
  if (!accessToken) {
    const cookieStore = await cookies();
    accessToken = cookieStore.get('spotify_access_token')?.value;
  }

  console.log('🎵 [SPOTIFY PLAYER] Access token exists:', !!accessToken);
  console.log('🎵 [SPOTIFY PLAYER] Token source:', authHeader ? 'header' : 'cookie');

  if (!accessToken) {
    console.error('❌ [SPOTIFY PLAYER] No access token found');
    return NextResponse.json({ error: 'Not authenticated with Spotify' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, deviceId } = body;

    let endpoint = '';
    let method = 'PUT';

    switch (action) {
      case 'play':
        endpoint = 'https://api.spotify.com/v1/me/player/play';
        break;
      case 'pause':
        endpoint = 'https://api.spotify.com/v1/me/player/pause';
        break;
      case 'next':
        endpoint = 'https://api.spotify.com/v1/me/player/next';
        method = 'POST';
        break;
      case 'previous':
        endpoint = 'https://api.spotify.com/v1/me/player/previous';
        method = 'POST';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: deviceId ? JSON.stringify({ device_id: deviceId }) : undefined,
    });

    if (response.status === 204) {
      return NextResponse.json({ success: true });
    }

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.error?.message || 'Spotify API error' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Spotify player error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Try to get token from Authorization header first, then cookies
  const authHeader = request.headers.get('authorization');
  let accessToken = authHeader?.replace('Bearer ', '');
  
  if (!accessToken) {
    const cookieStore = await cookies();
    accessToken = cookieStore.get('spotify_access_token')?.value;
  }

  console.log('🎵 [SPOTIFY PLAYER GET] Access token exists:', !!accessToken);
  console.log('🎵 [SPOTIFY PLAYER GET] Token source:', authHeader ? 'header' : 'cookie');

  if (!accessToken) {
    console.error('❌ [SPOTIFY PLAYER GET] No access token found');
    return NextResponse.json({ error: 'Not authenticated with Spotify', needsReauth: true }, { status: 401 });
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // 204 means no active playback
    if (response.status === 204) {
      return NextResponse.json({ is_playing: false, track: null });
    }

    // 401/403 means token expired - signal frontend to refresh
    if (response.status === 401 || response.status === 403) {
      console.log('⚠️ [SPOTIFY PLAYER GET] Token expired, needs refresh');
      return NextResponse.json({ 
        is_playing: false, 
        track: null, 
        error: 'Token expired',
        needsRefresh: true 
      }, { status: 401 });
    }

    // Other errors - return empty state instead of throwing
    if (!response.ok) {
      console.log('Spotify API returned:', response.status);
      return NextResponse.json({ is_playing: false, track: null });
    }

    const data = await response.json();
    
    return NextResponse.json({
      is_playing: data.is_playing,
      track: data.item ? {
        name: data.item.name,
        artist: data.item.artists[0]?.name,
        album: data.item.album?.name,
        imageUrl: data.item.album?.images[0]?.url,
      } : null,
    });
  } catch (error) {
    console.error('Spotify playback state error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
