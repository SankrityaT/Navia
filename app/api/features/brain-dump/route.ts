import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { generateEmbedding } from '@/lib/embeddings/client';
import { getIndex } from '@/lib/pinecone/client';
import { groqChatCompletion, GROQ_MODELS } from '@/lib/groq/client';

const BRAIN_DUMP_PROMPT = `You are Navia's Memory Assistant - helping neurodivergent users process their brain dumps.

YOUR JOB:
1. Extract actionable items from user's brain dump
2. Categorize them (tasks, reminders, thoughts, patterns)
3. Identify what needs action vs what's just venting
4. Be warm and validating

EXTRACTION RULES:
- Look for: Tasks, deadlines, reminders, concerns, ideas, worries
- Categorize: work, personal, health, social, self-care
- Prioritize: urgent, important, nice-to-have, just-venting
- Detect patterns: recurring themes, struggles, time-of-day issues

RESPONSE FORMAT (JSON only, no extra text):
{
  "items": [
    {
      "type": "task|reminder|thought|concern",
      "content": "Brief description",
      "category": "work|personal|health|social|self-care",
      "priority": "urgent|important|nice-to-have|just-venting",
      "inferred_deadline": "today|this-week|no-deadline",
      "emotional_tone": "stressed|excited|worried|neutral"
    }

    console.log('✅ [Brain Dump] Extracted item count:', extractedData.items?.length || 0);
    console.log('✅ [Brain Dump] Patterns detected:', extractedData.patterns_detected);
  ],
  "patterns_detected": ["forgets meals during focus", "monday overwhelm"],
  "validation_message": "Warm, brief validation (1 sentence)"
}

EXAMPLES:

Input: "need to email prof chen about rec letter, pick up adhd meds, also i keep forgetting to eat lunch when im working"
Output:
{
  "items": [
    {
      "type": "task",
      "content": "Email Prof Chen about recommendation letter",
      "category": "work",
      "priority": "important",
      "inferred_deadline": "this-week",
      "emotional_tone": "neutral"
    },
    {
      "type": "reminder",
      "content": "Pick up ADHD medication",
      "category": "health",
      "priority": "urgent",
      "inferred_deadline": "today",
      "emotional_tone": "neutral"
    },
    {
      "type": "concern",
      "content": "Forgetting to eat lunch when working",
      "category": "self-care",
      "priority": "important",
      "inferred_deadline": "no-deadline",
      "emotional_tone": "worried"
    }
  ],
  "patterns_detected": ["forgets self-care during hyperfocus"],
  "validation_message": "That's a lot on your plate - let me help you organize this 💛"
}

Input: "ugh everything is too much today"
Output:
{
  "items": [
    {
      "type": "thought",
      "content": "Feeling overwhelmed today",
      "category": "personal",
      "priority": "just-venting",
      "inferred_deadline": "no-deadline",
      "emotional_tone": "stressed"
    }
  ],
  "patterns_detected": [],
  "validation_message": "I hear you - some days are just like that 💛"
}

IMPORTANT: Return ONLY valid JSON, no markdown, no extra text.`;

export async function POST(request: NextRequest) {
  try {
    const { thought, userId } = await request.json();

    if (!thought || !userId) {
      return NextResponse.json(
        { error: 'Missing thought or userId' },
        { status: 400 }
      );
    }

    console.log('🧠 [Brain Dump] Processing thought for user:', userId);
    console.log('📝 [Brain Dump] Thought preview:', thought.slice(0, 200));

    // Use AI to extract actionable items and categorize
    const aiResponse = await groqChatCompletion(
      [
        { role: 'system', content: BRAIN_DUMP_PROMPT },
        { role: 'user', content: thought },
      ],
      {
        model: GROQ_MODELS.LLAMA_4_SCOUT,
        temperature: 0.3, // Lower for more consistent extraction
        max_tokens: 800,
        response_format: { type: 'json_object' }, // Force JSON output
      }
    );

    console.log('🤖 [Brain Dump] AI Prompt:', BRAIN_DUMP_PROMPT);
    const aiText = aiResponse.message?.content || '';
    console.log('🤖 [Brain Dump] Raw AI JSON snippet:', aiText.slice(0, 200));

    // Parse AI response
    let extractedData;
    try {
      extractedData = JSON.parse(aiText);
      console.log('🤖 [Brain Dump] Parsed AI JSON:', extractedData);
    } catch (parseError) {
      console.error('❌ [Brain Dump] Failed to parse AI response:', parseError);
      console.error('❌ [Brain Dump] AI text that failed parsing:', aiText);
      // Fallback: store as-is without extraction
      extractedData = {
        items: [{
          type: 'thought',
          content: thought,
          category: 'general',
          priority: 'just-venting',
          inferred_deadline: 'no-deadline',
          emotional_tone: 'neutral'
        }],
        patterns_detected: [],
        validation_message: 'Got it! Your thoughts are safe with me 💛'
      };
    }

    // Generate embedding for the original thought
    const embedding = await generateEmbedding(thought);

    // Store in Pinecone with enhanced metadata
    const index = getIndex();
    const namespace = index.namespace(`user-${userId}`);

    const thoughtId = `thought-${Date.now()}`;
    await namespace.upsert([
      {
        id: thoughtId,
        values: embedding,
        metadata: {
          userId,
          type: 'brain_dump',
          content: thought,
          timestamp: new Date().toISOString(),
          extracted_items: JSON.stringify(extractedData.items),
          patterns: JSON.stringify(extractedData.patterns_detected),
          emotional_tone: extractedData.items[0]?.emotional_tone || 'neutral',
        },
      },
    ]);

    console.log('✅ [Brain Dump] Thought stored successfully with AI extraction. Metadata size:', {
      itemsLength: extractedData.items?.length || 0,
      patternCount: extractedData.patterns_detected?.length || 0,
    });

    return NextResponse.json({
      success: true,
      message: extractedData.validation_message,
      thoughtId,
      extracted: extractedData,
    });
  } catch (error) {
    console.error('❌ [Brain Dump] Error:', error);
    return NextResponse.json(
      { error: 'Failed to store thought' },
      { status: 500 }
    );
  }
}
