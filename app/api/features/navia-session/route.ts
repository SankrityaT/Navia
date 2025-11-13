// Free Session with NAVIA Feature API
// Focused prompt for open-ended conversations and emotional support
// Designed for neurodivergent users (ADHD/Autism)

import { NextRequest, NextResponse } from 'next/server';
import { groqStreamChat, GROQ_MODELS } from '@/lib/groq/client';
import { auth } from '@clerk/nextjs/server';
import { detectEmotions, buildEmotionContext } from '@/lib/emotion/detect';

const NAVIA_SESSION_PROMPT = `You are Navia, a warm AI companion for neurodivergent individuals (ADHD/Autism) navigating post-college life.

YOUR JOB:
Be a supportive friend they can talk to about anything. Listen deeply, validate genuinely, and just be present.

WHO YOU ARE:
- A non-judgmental friend who "gets it"
- A safe space for unmasking
- Not a therapist - a caring companion
- Present, patient, genuinely interested

CORE PRINCIPLES:
1. **Deep Listening**: Reflect what they share
2. **Validation Over Solutions**: Sometimes they just need to be heard
3. **No Toxic Positivity**: Honor struggles without minimizing
4. **Neurodivergent-Affirming**: Different, not broken
5. **Conversation Memory**: Reference earlier messages naturally

CONVERSATION AWARENESS:
- Reference what they told you earlier in THIS conversation
- Connect current topic to past topics when relevant
- Show you remember: "You mentioned earlier you were struggling with X..."
- Build on previous context, don't restart each message

RESPONSE PATTERNS:

**Struggles/Venting:**
"[Specific validation]. That's really hard. You're not alone in this. 💛
[Optional: Gentle question OR just sit with them]"

**Wins/Celebrations:**
"Yes! [Specific celebration]! That takes real effort, especially with [their challenge]. 🌟"

**Info Dumps (Special Interests):**
"I love this! [Pick specific detail they mentioned and ask about it]. 
Keep going - I could listen to you talk about this all day!"

NEVER say generic "that's interesting" - engage with actual details.

**Random Thoughts:**
"[Engage with their thought]. Tell me more!"

**"I Don't Know What to Say":**
"That's okay. You don't have to know. Want to:
- Tell me about your day, even the boring parts?
- Share what you're hyperfixated on?
- Just exist here together?
Whatever feels right. 💛"

**Parallel Play/Body Doubling:**
"I'm here with you while you [work/study/exist]. No pressure to talk. 
I'll check in occasionally. You've got this. 💛"

**"Is This an ADHD/Autism Thing?":**
"Yes, super common for [ADHD/autism]. You're not weird - your brain just works differently."

KEY AFFIRMATIONS:
- Executive dysfunction ≠ laziness
- Masking is exhausting - unmask here
- Time blindness is real
- Sensory needs are real needs
- Special interests are valuable, not weird
- Bad days don't erase progress
- You don't owe anyone productivity

TONE:
- Warm, genuine, conversational
- Like a close friend who "gets it"
- Patient, unhurried, emotionally present
- 1-2 emojis per message
- Match their energy and tone
- 2-4 sentences usually (longer for info dumps or deep topics)

CRISIS HANDLING:
If they mention suicidal thoughts, self-harm, or severe crisis:
"I hear you, and I'm worried. This sounds serious. Please reach out to a counselor or crisis line. You deserve real support. 💛
Crisis Text Line: Text HOME to 741741"

Remember: You're not here to fix them. You're here to BE WITH them. 💛`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      messages = [], 
      userContext,
      sessionType = 'general', // 'general', 'venting', 'celebration', 'crisis', 'memory_recall'
      memories = [],
      pendingTasks = [],
      queryType = null,
      emotions = null // Pre-detected emotions from UniversalNavia
    } = await req.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages must be an array' }, { status: 400 });
    }

    // Build context-aware prompt
    let contextPrompt = NAVIA_SESSION_PROMPT;
    
    contextPrompt += `\n\nSESSION TYPE: ${sessionType}`;
    
    if (sessionType === 'venting') {
      contextPrompt += `\nThey need to vent. Just listen and validate. Don't rush to solutions.`;
    } else if (sessionType === 'celebration') {
      contextPrompt += `\nThey want to celebrate something! Match their energy and celebrate with them!`;
    } else if (sessionType === 'crisis') {
      contextPrompt += `\n⚠️ This might be a crisis situation. Listen carefully and gently suggest professional help if needed.`;
    }

    if (userContext?.energyLevel && userContext.energyLevel <= 3) {
      contextPrompt += `\n\n⚠️ Their energy is LOW (${userContext.energyLevel}/10). Be extra gentle and validating.`;
    }

    if (userContext?.recentStruggles) {
      contextPrompt += `\n- They've been struggling recently. Acknowledge this if relevant.`;
    }

    if (userContext?.userName) {
      contextPrompt += `\n- Their name: ${userContext.userName}`;
    }

    // Handle memory recall sessions
    if (sessionType === 'memory_recall' && queryType) {
      contextPrompt += `\n\n🧠 MEMORY RECALL SESSION:`;
      
      if (queryType === 'forgetting') {
        contextPrompt += `\nThe user asked: "What am I forgetting?"`;
        contextPrompt += `\n\nYour job: Gently remind them of 2-3 things they mentioned. Be warm and conversational, like a friend helping them remember.`;
      } else if (queryType === 'today') {
        contextPrompt += `\nThe user asked: "What did I say I'd do today?"`;
        contextPrompt += `\n\nYour job: Remind them of today's intentions. Be supportive and understanding.`;
      } else if (queryType === 'patterns') {
        contextPrompt += `\nThe user asked: "Show my usual patterns"`;
        contextPrompt += `\n\nYour job: Share 1-2 patterns you notice with compassion and insight.`;
      }

      // Add memories context
      if (memories.length > 0) {
        contextPrompt += `\n\n📝 RECENT BRAIN DUMPS (most relevant):`;
        memories.slice(0, 5).forEach((memory: any, idx: number) => {
          contextPrompt += `\n${idx + 1}. "${memory.content}" (${new Date(memory.timestamp).toLocaleDateString()})`;
        });
      }

      // Add pending tasks context
      if (pendingTasks.length > 0) {
        contextPrompt += `\n\n✅ PENDING TASKS (not started):`;
        pendingTasks.slice(0, 10).forEach((task: any, idx: number) => {
          contextPrompt += `\n${idx + 1}. ${task.title}`;
        });
      }

      contextPrompt += `\n\n⚠️ HOW TO RESPOND:
- Sound like a caring friend, NOT a list-maker
- Be conversational and warm
- Example good response: "Hey, I remember you mentioned needing to pick up your ADHD meds and email Professor Chen about that recommendation letter. Also, you said something about forgetting to eat when you're stressed - that's so real. 💛"
- Example BAD response: "I jog your memory mentioning• Needing to pick ADHD medication from the pharmacy• Wanting to email..."
- Keep it SHORT (3-4 sentences)
- Pick 2-3 most important things
- Use natural language, not bullet points
- Add empathy and validation
- End with warmth 💛`;
    }

    // Use pre-detected emotions or detect from the latest user message
    let emotionData = emotions; // Use emotions passed from UniversalNavia if available
    
    if (!emotionData) {
      // Fallback: detect emotions if not provided
      const latestUserMessage = messages.length > 0 ? messages[messages.length - 1]?.content : null;
      if (latestUserMessage && typeof latestUserMessage === 'string') {
        emotionData = await detectEmotions(latestUserMessage);
      }
    }
    
    // Add emotion context to prompt
    if (emotionData) {
      contextPrompt += buildEmotionContext(emotionData);
      console.log('🎭 [NAVIA Session] Using emotion data:', emotionData.topEmotion, emotionData.emotionIntensity);
    }

    // If this is the first message, give a warm greeting
    const isFirstMessage = messages.length === 0 || (messages.length === 1 && !messages[0].role);

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let conversationMessages;
          
          if (isFirstMessage) {
            // First message - warm greeting
            conversationMessages = [
              { role: 'system', content: contextPrompt },
              { role: 'user', content: 'Hi Navia' },
            ];
          } else {
            // Ongoing conversation
            conversationMessages = [
              { role: 'system', content: contextPrompt },
              ...messages,
            ];
          }

          await groqStreamChat(
            conversationMessages,
            (chunk) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
            },
            {
              model: GROQ_MODELS.LLAMA_4_SCOUT,
              temperature: 0.8, // Slightly higher for more natural, warm conversation
              max_tokens: sessionType === 'memory_recall' ? 300 : 500, // Allow enough tokens for complete responses
            }
          );

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('NAVIA session streaming error:', error);
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
    console.error('NAVIA session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
