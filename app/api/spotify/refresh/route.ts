import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { refresh_token } = body;

    if (!refresh_token) {
      // Try to get from cookies as fallback
      const cookieStore = await cookies();
      refresh_token = cookieStore.get('spotify_refresh_token')?.value;
      
      if (!refresh_token) {
        return NextResponse.json({ error: 'No refresh token provided' }, { status: 400 });
      }
    }

    console.log('🔄 [SPOTIFY REFRESH] Refreshing access token...');

    // Request new access token using refresh token
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [SPOTIFY REFRESH] Token refresh failed:', errorData);
      return NextResponse.json({ error: 'Failed to refresh token' }, { status: response.status });
    }

    const data = await response.json();
    console.log('✅ [SPOTIFY REFRESH] Token refreshed successfully');
    console.log('🎵 [SPOTIFY REFRESH] New token expires in:', data.expires_in, 'seconds');

    // Return new tokens
    return NextResponse.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token || refresh_token, // Spotify may return a new refresh token
      expires_in: data.expires_in,
    });
  } catch (error) {
    console.error('❌ [SPOTIFY REFRESH] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
