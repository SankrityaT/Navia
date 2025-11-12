import { NextRequest, NextResponse } from 'next/server';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_URL 
  ? `${process.env.NEXT_PUBLIC_URL}/api/auth/spotify/callback`
  : 'http://localhost:3000/api/auth/spotify/callback';

export async function GET(request: NextRequest) {
  console.log('🎵 [SPOTIFY CALLBACK] Received callback');
  
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  console.log('🎵 [SPOTIFY CALLBACK] Code exists:', !!code);
  console.log('🎵 [SPOTIFY CALLBACK] Error:', error);
  console.log('🎵 [SPOTIFY CALLBACK] Redirect URI:', SPOTIFY_REDIRECT_URI);

  if (error) {
    console.error('❌ [SPOTIFY CALLBACK] OAuth error:', error);
    return NextResponse.redirect(new URL('/dashboard-new?spotify_error=access_denied', request.url));
  }

  if (!code) {
    console.error('❌ [SPOTIFY CALLBACK] No code received');
    return NextResponse.redirect(new URL('/dashboard-new?spotify_error=no_code', request.url));
  }

  try {
    console.log('🎵 [SPOTIFY CALLBACK] Exchanging code for token...');
    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('❌ [SPOTIFY CALLBACK] Token exchange failed:', errorData);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ [SPOTIFY CALLBACK] Token exchange successful');
    console.log('🎵 [SPOTIFY CALLBACK] Token expires in:', tokenData.expires_in, 'seconds');

    // Instead of cookies, pass tokens via URL (temporary solution)
    // In production, you'd store in a database
    const redirectUrl = new URL('/dashboard-new', request.url);
    redirectUrl.searchParams.set('spotify_connected', 'true');
    redirectUrl.searchParams.set('spotify_token', tokenData.access_token);
    if (tokenData.refresh_token) {
      redirectUrl.searchParams.set('spotify_refresh', tokenData.refresh_token);
    }
    redirectUrl.searchParams.set('spotify_expires', tokenData.expires_in.toString());

    console.log('🔄 [SPOTIFY CALLBACK] Redirecting with tokens in URL');

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Spotify auth error:', error);
    return NextResponse.redirect(new URL('/dashboard-new?spotify_error=auth_failed', request.url));
  }
}
