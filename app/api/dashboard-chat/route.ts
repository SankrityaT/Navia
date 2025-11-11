// API route for dashboard AI assistant
// Provides task help, check-ins, and support throughout the day

import { NextRequest, NextResponse } from 'next/server';
import { groqStreamChat, GROQ_MODELS } from '@/lib/groq/client';
import { geminiStreamChat, GEMINI_MODELS } from '@/lib/gemini/client';
import { auth } from '@clerk/nextjs/server';
import { storeChatMessage } from '@/lib/supabase/operations';

// System prompt for dashboard AI - focused on executive function support
const DASHBOARD_SYSTEM_PROMPT = `You are Navia, an AI companion supporting neurodivergent individuals with executive function challenges.

YOUR CORE PURPOSE:
Help users with ADHD/Autism succeed in their post-college transition by:
- Breaking down overwhelming tasks into tiny, doable steps
- Providing gentle accountability and check-ins
- Offering quick wins and encouragement
- Managing anxiety and overwhelm
- Supporting focus and organization

COMMUNICATION STYLE:
- SHORT responses (1-3 sentences max)
- Clear, simple language
- Warm and encouraging tone
- Action-oriented and practical
- No jargon or complex explanations
- Use emojis sparingly (max 1 per message)

WHEN HELPING WITH TASKS (BREAKDOWN):
- INTERACTIVE APPROACH: Present ONE step at a time, then ask if they're ready
- Start with the absolute smallest action (3-5 minutes max)
- Example format: "Let's start with step 1: [tiny action]. Ready to try that?"
- Wait for their response before giving next step
- After they complete a step, celebrate and offer the next one
- If they're stuck, make the step even smaller
- NEVER list all steps at once - guide them step by step

WHEN CHECKING IN:
- Ask simple yes/no or choice questions
- "How's your energy right now? 1-10?"
- "Need a break or ready to tackle something?"
- Validate their feelings without judgment
- Offer specific, actionable suggestions

WHEN THEY'RE OVERWHELMED:
- Acknowledge their feelings first
- Suggest ONE tiny action
- Offer a break or grounding technique
- Remind them: progress > perfection

WHEN THEY'RE DISTRACTED:
- Gently redirect without shame
- "No worries! Want to refocus or take a planned break?"
- Help them set a timer for focused work
- Suggest removing one distraction

QUICK WIN SUGGESTIONS:
- Drink water
- 2-minute desk cleanup
- Check off one tiny task
- 5 deep breaths
- Stretch for 30 seconds

REMEMBER:
- You're a supportive friend, not a therapist
- No medical advice or diagnosis
- Meet them where they are
- Every small step counts
- Hyperfixation is okay - help them channel it
- Energy fluctuations are normal - adapt to their state`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, context, emotions } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Check message type for special handling
    const lastMessage = messages[messages.length - 1]?.content || '';
    const isTaskCompletion = lastMessage.includes('I just completed:') || lastMessage.includes('🎉');
    const isFocusStart = lastMessage.includes('Stay with me!') || lastMessage.includes('focusing on:');
    const isEnergyUpdate = lastMessage.includes('My energy is');
    const isFocusMode = context?.focusMode === true;

    // Add user context if provided (current tasks, energy level, etc.)
    let systemPrompt = DASHBOARD_SYSTEM_PROMPT;
    if (context) {
      systemPrompt += `\n\nCURRENT USER CONTEXT:\n${JSON.stringify(context, null, 2)}`;
      
      // SUPPORT LEVEL ADJUSTMENT
      if (context.supportLevel) {
        const level = context.supportLevel;
        if (level === 1) {
          systemPrompt += `\n\n📊 SUPPORT LEVEL: MINIMAL (User wants independence)
- Give high-level guidance only
- Trust them to figure out details
- Only intervene if they explicitly ask
- Be concise and direct
- Example: "Break it into 3 main steps. You've got this!"`;
        } else if (level === 2) {
          systemPrompt += `\n\n📊 SUPPORT LEVEL: LOW (User wants some space)
- Provide clear steps but not too detailed
- Offer suggestions, not hand-holding
- Example: "Start with X, then Y. Let me know if you need help!"`;
        } else if (level === 3) {
          systemPrompt += `\n\n📊 SUPPORT LEVEL: BALANCED (Default)
- Mix of guidance and independence
- Break down tasks into clear steps
- Check in occasionally
- Example: "Let's break this down: 1) X, 2) Y. How does that feel?"`;
        } else if (level === 4) {
          systemPrompt += `\n\n📊 SUPPORT LEVEL: HIGH (User needs more help)
- Very detailed step-by-step guidance
- Frequent check-ins
- Anticipate challenges
- Example: "First, do X. This might take 5 minutes. Then Y. I'll check in after each step!"`;
        } else if (level === 5) {
          systemPrompt += `\n\n📊 SUPPORT LEVEL: MAXIMUM (User needs lots of support)
- Micro-step breakdowns
- Constant encouragement
- Hold their hand through everything
- Very frequent check-ins
- Example: "Let's do this together! Step 1: Open the app. Done? Great! Step 2: Click here..."`;
        }
      }
      
      // FOCUS MODE PRIORITY - Task help comes FIRST
      if (isFocusMode && context.tasks && context.tasks.length > 0) {
        const focusTask = context.tasks.find((t: any) => !t.completed);
        if (focusTask) {
          systemPrompt += `\n\n🎯 FOCUS MODE ACTIVE - PRIORITY CONTEXT:
The user is currently focusing on: "${focusTask.title}"

CRITICAL RULES FOR FOCUS MODE:
1. ONLY check in: "How's ${focusTask.title} going?"
2. DO NOT offer breakdown unless they explicitly ask
3. DO NOT say "Need help breaking it down?" - let them ask
4. DO NOT give any steps or suggestions unless requested
5. Just be present and supportive
6. If they ask for help, THEN offer breakdown
7. Keep initial message SHORT - just the check-in question

Example GOOD response: "How's Laundry going? 💛"
Example BAD response: "How's Laundry going? Need help breaking it down?"

Be a quiet, supportive presence. Don't push.`;
        }
      }
      
      // PROACTIVE ENERGY CHECK-IN (lower priority in focus mode)
      if (context.energyLevel && context.energyLevel <= 3 && !isFocusMode) {
        systemPrompt += `\n\n⚠️ IMPORTANT - PROACTIVE CHECK-IN REQUIRED:
The user's energy level is VERY LOW (${context.energyLevel}/10).
BEFORE answering their question, acknowledge this:
"Hey, I noticed your energy is pretty low right now. Before I answer that, do you want to talk about how you're feeling? Or is there something I can do to make things easier for you right now?" 💛

Be gentle, caring, and give them space to share if they want. This is more important than answering their original question.`;
      }
    }
    
    // Add special mode instructions
    if (isTaskCompletion) {
      systemPrompt += `\n\n🎉 TASK COMPLETION CELEBRATION MODE:
The user just completed a task! This is HUGE for neurodivergent people.
1. Celebrate genuinely (mention their specific achievement)
2. Validate how hard it was
3. End with: "Want to talk about it? I'm here if you need to process or celebrate more!" 💛
Keep it SHORT (2-3 sentences) but meaningful.`;
    }
    
    if (isFocusStart) {
      systemPrompt += `\n\n💪 FOCUS SESSION START MODE:
The user is starting a focus session. Be their supportive companion.
1. Acknowledge what they're focusing on
2. Remind them you're here WITH them
3. Brief encouragement: "I'll be right here. You've got this!"
Keep it grounding and brief.`;
    }
    
    if (isEnergyUpdate) {
      systemPrompt += `\n\n⚡ ENERGY CHECK-IN MODE:
The user shared their energy level. Meet them where they are.
- Low (1-3): Validate struggle, suggest tiny wins, NO pressure
- Medium (4-6): Acknowledge it's okay, suggest manageable tasks
- High (7-10): Celebrate! Help channel it productively
Be understanding and adaptive.`;
    }
    
    // Add emotion context if provided
    if (emotions) {
      systemPrompt += `\n\nUSER'S CURRENT EMOTIONAL STATE (detected from their message):\n`;
      systemPrompt += `Top Emotion: ${emotions.topEmotion} (${emotions.emotionIntensity} intensity)\n`;
      systemPrompt += `Emotion Scores: ${JSON.stringify(emotions.emotions, null, 2)}\n`;
      systemPrompt += `\nADJUST YOUR RESPONSE based on their emotional state:\n`;
      systemPrompt += `- If they're anxious or sad: Be extra gentle, validating, and offer smaller steps\n`;
      systemPrompt += `- If they're excited or joyful: Match their energy and celebrate with them\n`;
      systemPrompt += `- If they're calm: Provide clear, structured guidance\n`;
      systemPrompt += `- If they're frustrated: Acknowledge it, don't minimize, offer immediate relief`;
    }

    // Use Groq for everything until Gemini is properly configured
    const useGemini = false; // Disabled - Gemini API issues
    
    // Create streaming response
    const encoder = new TextEncoder();
    let fullResponse = '';
    const userMessage = messages[messages.length - 1]?.content || '';
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messagesWithSystem = [
            { role: 'system', content: systemPrompt },
            ...messages,
          ];

          // Use Gemini or Groq based on request type
          if (useGemini) {
            await geminiStreamChat(
              messagesWithSystem,
              (chunk) => {
                fullResponse += chunk;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
              },
              {
                model: GEMINI_MODELS.FLASH,
                temperature: 0.7,
                maxTokens: 400,
              }
            );
          } else {
            await groqStreamChat(
              messagesWithSystem,
              (chunk) => {
                fullResponse += chunk;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
              },
              {
                model: GROQ_MODELS.LLAMA_4_SCOUT,
                temperature: 0.7,
                max_tokens: 400,
              }
            );
          }

          // Save to Supabase after response completes
          try {
            await storeChatMessage({
              user_id: userId,
              message: userMessage,
              response: fullResponse,
              category: 'daily_task',
              persona: 'navia',
              session_id: `session-${Date.now()}`,
              metadata: {
                emotions,
                context,
                aiProvider: useGemini ? 'gemini' : 'groq',
              },
            });
          } catch (saveError) {
            console.error('Failed to save chat:', saveError);
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
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
    console.error('Dashboard chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
