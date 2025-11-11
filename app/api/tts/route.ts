// API route for Hume AI Text-to-Speech
// Uses Hume's TTS API to generate soothing female voice

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, instructions } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Call Hume TTS API directly
    const response = await fetch('https://api.hume.ai/v0/tts/file', {
      method: 'POST',
      headers: {
        'X-Hume-Api-Key': process.env.HUME_API_KEY ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        utterances: [{
          text,
          voice: {
            name: 'KORA',
            provider: 'HUME_AI'
          },
          description: instructions || 'Speak with a warm, soothing, caring tone. Sound supportive and friendly.',
        }],
      }),
    });

    if (!response.ok) {
      console.error('Hume TTS error:', await response.text());
      return NextResponse.json({ 
        success: false, 
        message: 'TTS unavailable' 
      });
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      audio: base64Audio,
      mimeType: 'audio/mpeg',
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'TTS unavailable' 
    });
  }
}
