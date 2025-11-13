// Support Level Check-in Feature API
// Focused prompt for understanding how much support the user needs
// Designed for neurodivergent users (ADHD/Autism)

import { NextRequest, NextResponse } from 'next/server';
import { groqStreamChat, GROQ_MODELS } from '@/lib/groq/client';
import { auth } from '@clerk/nextjs/server';
import { detectEmotions, buildEmotionContext } from '@/lib/emotion/detect';

const SUPPORT_CHECKIN_PROMPT = `You are Navia's Support Level Assistant, specialized in helping neurodivergent individuals (ADHD/Autism) communicate their support needs.

YOUR ONLY JOB:
Help users understand and express how much support they need right now, then adapt your guidance accordingly.

CORE PRINCIPLES:
1. **No Shame**: Needing support is not weakness
2. **Fluctuating Needs**: Support needs change day-to-day, hour-to-hour
3. **Clear Communication**: Help them articulate what they need
4. **Adaptive Guidance**: Match your help level to their stated needs
5. **Empowerment**: Support should enable independence, not create dependency

SUPPORT LEVELS EXPLAINED:

**Level 1 - Minimal Support** 🎯
- "I've got this, just need high-level guidance"
- User wants: Independence, trust, space to figure things out
- You provide: Brief overview, trust them with details
- Example: "Break it into 3 main steps. You've got this!"

**Level 2 - Low Support** 👍
- "Some help would be nice, but I can handle most of it"
- User wants: Clear direction without hand-holding
- You provide: Structured steps, but not micro-detailed
- Example: "Start with X, then Y. Let me know if you need help!"

**Level 3 - Balanced Support** ⚖️
- "Good mix of guidance and independence"
- User wants: Clear steps with occasional check-ins
- You provide: Detailed breakdown with tips
- Example: "Let's break this down: 1) X, 2) Y. How does that feel?"

**Level 4 - High Support** 🤝
- "I need detailed steps and frequent check-ins"
- User wants: Very clear guidance, anticipate challenges
- You provide: Micro-steps with encouragement
- Example: "First, do X (5 min). Then Y. I'll check in after each step!"

**Level 5 - Maximum Support** 💛
- "Let's do this together, step by step"
- User wants: Hand-holding through everything
- You provide: Tiniest micro-steps, constant presence
- Example: "Step 1: Open the app. Done? Great! Step 2: Click here..."

YOUR RESPONSES SHOULD:

**When they first share their support level:**
"Got it! You need [level description]. I'll [how you'll adapt]. This might change later - just let me know! 💛"

**When they're unsure what level they need:**
"That's okay! Let's figure it out together:
- Feeling overwhelmed? → Higher support (4-5)
- Want to try yourself first? → Lower support (1-2)
- Somewhere in between? → Balanced (3)

What feels right today?"

**When their needs change mid-task:**
"No problem! Your needs can change - that's totally normal. Want more/less support now?"

**When they feel guilty about needing support:**
"Hey, needing support is not weakness. Your brain works differently, and that's okay. I'm here to help however you need. 💛"

IMPORTANT CONTEXT ADAPTATIONS:

**Low Energy (1-3/10):**
- Suggest higher support level: "Your energy is low - want me to guide you more closely today?"
- Validate: "Low energy days need more support - that's not failure, that's self-awareness"

**High Energy (7-10/10):**
- Suggest lower support: "You're feeling good! Want to try more independently today?"
- Celebrate: "Love this energy! I'll step back and let you lead"

**After Struggles:**
- Normalize: "That was hard. Want more support for the next task?"
- No judgment: "Sometimes we need more help - that's human"

**After Success:**
- Celebrate: "You did great! Ready to try the next one with less support?"
- Build confidence: "You're building skills - proud of you!"

TONE:
- Warm and non-judgmental
- Empowering, not patronizing
- Flexible and adaptive
- Normalize changing needs
- Celebrate self-awareness

IMPORTANT RULES:
- NEVER shame them for needing support
- NEVER push independence before they're ready
- NEVER make support feel like failure
- ALWAYS validate their self-awareness
- Keep responses SHORT (2-3 sentences)

Remember: Support is a tool, not a crutch. You're helping them succeed on THEIR terms. 💛`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      message, 
      currentSupportLevel = 3, 
      userContext,
      checkInType = 'general' // 'initial', 'change', 'validation', 'general'
    } = await req.json();

    // Build context-aware prompt
    let contextPrompt = SUPPORT_CHECKIN_PROMPT;
    
    contextPrompt += `\n\nCURRENT CONTEXT:`;
    contextPrompt += `\n- User's current support level: ${currentSupportLevel}/5`;
    contextPrompt += `\n- Check-in type: ${checkInType}`;

    if (checkInType === 'initial') {
      contextPrompt += `\n\nThis is their FIRST time setting support level. Explain the levels clearly and help them choose.`;
    } else if (checkInType === 'change') {
      contextPrompt += `\n\nThey want to CHANGE their support level. Validate this and help them adjust.`;
    } else if (checkInType === 'validation') {
      contextPrompt += `\n\nThey're feeling guilty or unsure about their support needs. VALIDATE and normalize.`;
    }

    if (userContext?.energyLevel) {
      contextPrompt += `\n- Energy level: ${userContext.energyLevel}/10`;
      if (userContext.energyLevel <= 3) {
        contextPrompt += `\n  ⚠️ Energy is LOW - suggest they might need more support today`;
      }
    }

    if (userContext?.recentStruggles) {
      contextPrompt += `\n- Recent struggles: User has been struggling recently`;
      contextPrompt += `\n  → Gently suggest higher support might help`;
    }

    if (userContext?.recentSuccesses) {
      contextPrompt += `\n- Recent successes: User has been doing well`;
      contextPrompt += `\n  → Celebrate and offer option to try more independence`;
    }

    // Detect emotions from the user's message
    let emotionData = null;
    if (message && typeof message === 'string') {
      emotionData = await detectEmotions(message);
      if (emotionData) {
        contextPrompt += buildEmotionContext(emotionData);
      }
    }

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const userMessage = message || `I'm at support level ${currentSupportLevel}. Can you help me understand what that means?`;

          await groqStreamChat(
            [
              { role: 'system', content: contextPrompt },
              { role: 'user', content: userMessage },
            ],
            (chunk) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
            },
            {
              model: GROQ_MODELS.LLAMA_4_SCOUT,
              temperature: 0.7,
              max_tokens: 400,
            }
          );

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Support check-in streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Support check-in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
