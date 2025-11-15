// API route for generating Hume EVI access tokens
// Required for authenticating WebSocket connections to EVI

import { NextRequest, NextResponse } from 'next/server';
import { fetchAccessToken } from 'hume';

export async function POST(req: NextRequest) {
  try {
    // Generate access token for EVI WebSocket connection
    const accessToken = await fetchAccessToken({
      apiKey: process.env.HUME_API_KEY ?? '',
      secretKey: process.env.HUME_SECRET_KEY ?? '',
    });

    return NextResponse.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error('Error generating EVI access token:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate access token' 
      },
      { status: 500 }
    );
  }
}
