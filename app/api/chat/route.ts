// BACKEND: Chat endpoint with persona detection and function calling
// TODO: Implement streaming responses
// TODO: Store conversation history in Pinecone
// TODO: Add rate limiting

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { groqChatCompletion } from '@/lib/groq/client';
import { PERSONAS, PERSONA_DETECTOR_PROMPT, SYSTEM_PROMPT_BASE } from '@/lib/openai/personas';
import { AVAILABLE_FUNCTIONS, executeBreakDownTask, executeGetReferences } from '@/lib/openai/functions';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, persona, userContext } = await request.json();

    // Step 1: Detect persona if not provided
    let detectedPersona = persona;
    if (!persona) {
      const detectionResponse = await groqChatCompletion([
        { role: 'system', content: PERSONA_DETECTOR_PROMPT },
        { role: 'user', content: message },
      ]);

      try {
        const detection = JSON.parse(detectionResponse.message.content || '{}');
        detectedPersona = detection.confidence >= 0.6 ? detection.detected_persona : 'daily_tasks';
      } catch {
        detectedPersona = 'daily_tasks'; // Default if parsing fails
      }
    }

    // Step 2: Build context-aware system prompt
    const selectedPersona = PERSONAS[detectedPersona as keyof typeof PERSONAS];
    const systemPrompt = `${SYSTEM_PROMPT_BASE}

${selectedPersona.systemPrompt}

USER CONTEXT:
- User ID: ${userId}
- EF Profile: ${userContext?.ef_profile?.join(', ') || 'Not provided'}
- Current Goals: ${userContext?.current_goals?.join(', ') || 'Not provided'}
- Energy Level: ${userContext?.energy_level || 'Unknown'}`;

    // Step 3: Chat completion with Groq
    // Note: Groq doesn't support function calling yet, so we detect function needs from response
    const response = await groqChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ]);

    const choice = response;

    // TODO: Implement function detection from Groq response text
    // For now, Groq doesn't have native function calling
    // Backend team can add keyword detection later (e.g., if response contains "I'll break this down")

    return NextResponse.json({
      message: choice.message.content,
      persona: detectedPersona,
      personaIcon: selectedPersona.icon,
      functionCall: null, // Will be implemented when function detection is added
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}
