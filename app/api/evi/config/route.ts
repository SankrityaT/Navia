// API route for creating/getting EVI configuration with the correct Navia voice
// Checks for custom "Navia" voice first, then falls back to KORA

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.HUME_API_KEY ?? '';

    // First, check for custom voices to see if there's a "Navia" voice
    const voicesResponse = await fetch('https://api.hume.ai/v0/voices', {
      method: 'GET',
      headers: {
        'X-Hume-Api-Key': apiKey,
      },
    });

    let targetVoice = { name: 'KORA', provider: 'HUME_AI' };
    
    if (voicesResponse.ok) {
      const voices = await voicesResponse.json();
      // Check if there's a custom voice named "Navia" or similar
      const naviaVoice = voices.voices_page?.find((voice: any) => 
        voice.name?.toLowerCase().includes('navia')
      );
      
      if (naviaVoice) {
        console.log('Found custom Navia voice:', naviaVoice.name);
        targetVoice = { name: naviaVoice.name, provider: 'CUSTOM_VOICE' };
      } else {
        console.log('No custom Navia voice found, using KORA');
      }
    }

    // Now check for existing configs with the target voice
    const listResponse = await fetch('https://api.hume.ai/v0/evi/configs', {
      method: 'GET',
      headers: {
        'X-Hume-Api-Key': apiKey,
      },
    });

    if (listResponse.ok) {
      const configs = await listResponse.json();
      
      // Look for a config with the target voice
      const existingConfig = configs.configs_page?.find((config: any) => 
        config.voice?.name === targetVoice.name
      );

      if (existingConfig) {
        return NextResponse.json({
          success: true,
          configId: existingConfig.id,
          voiceName: targetVoice.name,
          message: `Found existing config with ${targetVoice.name} voice`,
        });
      }
    }

    // If no config exists, create one with the target voice
    const createResponse = await fetch('https://api.hume.ai/v0/evi/configs', {
      method: 'POST',
      headers: {
        'X-Hume-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Navia ${targetVoice.name} Voice`,
        voice: targetVoice,
        language_model: {
          model_provider: 'ANTHROPIC',
          model_resource: 'claude-3-5-sonnet-20241022',
        },
        system_prompt: 'You are Navia, a warm, supportive, and empathic AI companion. Speak with care and understanding, adapting your tone to the user\'s emotional state.',
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Failed to create EVI config:', errorText);
      return NextResponse.json({
        success: false,
        error: 'Failed to create config',
      }, { status: 500 });
    }

    const newConfig = await createResponse.json();

    return NextResponse.json({
      success: true,
      configId: newConfig.id,
      voiceName: targetVoice.name,
      message: `Created new config with ${targetVoice.name} voice`,
    });
  } catch (error) {
    console.error('Error managing EVI config:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to manage config',
    }, { status: 500 });
  }
}
