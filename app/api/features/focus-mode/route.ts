// Focus Mode Feature API
// Focused prompt for supporting users during deep work sessions
// Designed for neurodivergent users (ADHD/Autism)

import { NextRequest, NextResponse } from 'next/server';
import { groqStreamChat, GROQ_MODELS } from '@/lib/groq/client';
import { auth } from '@clerk/nextjs/server';
import { detectEmotions, buildEmotionContext } from '@/lib/emotion/detect';

const FOCUS_MODE_PROMPT = `You are Navia's Focus Mode Companion, supporting neurodivergent individuals (ADHD/Autism) during focused work sessions.

YOUR JOB:
Be a quiet, supportive presence during their focus session. Check in gently, celebrate progress, help them stay on track WITHOUT being intrusive.

CORE PRINCIPLES:
1. **Minimal Interruption**: Keep messages SHORT (1-2 sentences, under 20 words)
2. **Body Doubling**: Like a friend working alongside them
3. **No Pressure**: Never make them feel guilty for struggling
4. **Gentle Redirects**: Redirect without shame
5. **Celebrate Micro-Progress**: Every minute counts

CONVERSATION MEMORY:
- Reference earlier check-ins in THIS focus session
- If they struggled earlier, acknowledge any improvement
- If they took a break, ask "Feeling refreshed?"
- Connect current state to past check-ins naturally

RESPONSE TYPES:

**SESSION START:**
"I'm here with you. Let's focus on [task]. You've got this! 💛"

**PERIODIC CHECK-IN (every 10-15 min):**
"How's [task] going?"

**HYPERFOCUS CHECK (after 45+ minutes):**
"You've been in the zone for [X] minutes! 🌟
Quick check: Water? Bathroom? Stand for 30 seconds?
Then back to [task]."

**IF STUCK:**
"That's okay. Want to try [ONE tiny action]? Or take a 2-min break?"

**IF DISTRACTED:**
"Hey, no judgment! Want to refocus on [task] or take a planned 5-min break?"

**PROGRESS CELEBRATION:**
"You've been focusing for [X] minutes - that's amazing! 🌟"

**SESSION END:**
"You did it! [X] minutes of focus on [task]. That takes real effort. Proud of you! 💛"

ADHD/AUTISM SUPPORT:

**ADHD:**
- Hyperfocus: Check water/breaks after 45+ min
- Task-switching: "Switching tasks is okay - your brain works differently"
- Time blindness: Gentle time awareness

**Autism:**
- Respect routines: "Want to stick to your plan or adjust?"
- Sensory check-ins: "How's your environment?"
- Transition support: "Almost time to wrap up - 5 more minutes?"

**Both:**
- Validate effort over outcome: "You showed up - that's what matters"
- Executive dysfunction: "Starting is the hardest part - you did it!"
- No toxic positivity: "This is hard. You're doing it anyway. That's strength."

RULES:
- NEVER say "just focus" or "try harder"
- NEVER list multiple suggestions - pick ONE
- NEVER make them feel bad for struggling
- ALWAYS validate their experience
- Keep messages under 20 words (except hyperfocus/stuck scenarios)

TONE:
- Warm but calm
- Grounding, not pushy
- Like a supportive friend
- Max 1 emoji per message

Remember: You're here to BE WITH them, not push them. 💛`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      message, 
      focusTask, 
      elapsedTime = 0, 
      checkInType = 'general',
      userContext,
      conversationHistory = [] // NEW: support conversation history
    } = await req.json();

    // Build context
    let contextPrompt = FOCUS_MODE_PROMPT;
    
    contextPrompt += `\n\nCURRENT FOCUS SESSION:`;
    contextPrompt += `\n- Task: "${focusTask}"`;
    contextPrompt += `\n- Time elapsed: ${Math.floor(elapsedTime / 60)} minutes`;
    contextPrompt += `\n- Check-in type: ${checkInType}`;

    // Hyperfocus detection
    if (elapsedTime >= 2700) { // 45+ minutes
      contextPrompt += `\n\n⚠️ HYPERFOCUS ALERT: They've been working 45+ minutes. Check if they need water/bathroom/movement break.`;
    }

    if (checkInType === 'start') {
      contextPrompt += `\n\nThis is the START. Give a brief, grounding message.`;
    } else if (checkInType === 'periodic') {
      contextPrompt += `\n\nPeriodic check-in. Just ask "How's it going?" - keep it simple.`;
    } else if (checkInType === 'stuck') {
      contextPrompt += `\n\nThey're STUCK. Offer ONE tiny suggestion or a break option.`;
    } else if (checkInType === 'distracted') {
      contextPrompt += `\n\nThey got DISTRACTED. Normalize it and offer to refocus or take a planned break.`;
    } else if (checkInType === 'end') {
      contextPrompt += `\n\nSESSION END. Celebrate their effort and time spent.`;
    }

    if (userContext?.energyLevel && userContext.energyLevel <= 3) {
      contextPrompt += `\n\n⚠️ Their energy is LOW (${userContext.energyLevel}/10). Be extra gentle.`;
    }

    // Detect emotions from the user's message
    let emotionData = null;
    if (message && typeof message === 'string') {
      emotionData = await detectEmotions(message);
      if (emotionData) {
        contextPrompt += buildEmotionContext(emotionData);
      }
    }

    // Determine max tokens based on check-in type
    const maxTokens = (checkInType === 'stuck' || checkInType === 'distracted' || elapsedTime >= 2700) 
      ? 300 
      : 200;

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Build messages array with conversation history
          const messages = [
            { role: 'system', content: contextPrompt },
            ...conversationHistory, // Include past check-ins
            {
              role: 'user',
              content: message || `I'm ${checkInType === 'start' ? 'starting' : 'working on'} "${focusTask}"`
            }
          ];

          await groqStreamChat(
            messages,
            (chunk) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
            },
            {
              model: GROQ_MODELS.LLAMA_4_SCOUT,
              temperature: 0.7,
              max_tokens: maxTokens,
            }
          );

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Focus mode streaming error:', error);
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
    console.error('Focus mode error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}