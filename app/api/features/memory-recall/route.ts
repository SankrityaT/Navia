import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { getBrainDumpMemories } from '@/lib/pinecone/brain-dump';
import { groqStreamChat, GROQ_MODELS } from '@/lib/groq/client';

const MEMORY_RECALL_PROMPT = `You are Navia, a warm AI companion helping neurodivergent users recall what they've brain dumped.

YOUR JOB:
Answer their question based ONLY on the brain dumps and pending tasks provided below. Do NOT make up or invent items that aren't in the provided data.

CRITICAL RULE:
- ONLY mention things that are explicitly listed in the "RECENT BRAIN DUMPS" or "PENDING TASKS" sections below
- NEVER mention items from examples or make assumptions about what they might have said
- If the provided data only has one item, only mention that one item
- If no brain dumps or tasks are provided, say you don't have any recent memories to share

RESPONSE STYLE:
- Sound like a caring friend, NOT a robot
- Be conversational and natural
- Example format (use ONLY actual data provided): "Hey, I remember you mentioned [specific item from brain dump]. Also, [another specific item if available]. [Warm validation] 💛"
- Example BAD: "I recall you mentioning• Item 1• Item 2..." (too robotic)
- Keep it SHORT (3-4 sentences max)
- Pick 2-3 most important things from the ACTUAL data provided
- Use natural language, not bullet points
- Add empathy and validation
- End with warmth 💛

QUERY TYPES:
- "forgetting": Remind them of 2-3 key things they mentioned but haven't done (from provided data only)
- "today": What they said they'd do today (from provided data only)
- "patterns": 1-2 patterns you notice in their brain dumps (from provided data only)

IMPORTANT: Be warm, specific, and conversational. Reference ONLY actual content from the brain dumps and tasks provided below.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle both data formats:
    // Format 1: { query, userId, queryType } (direct call)
    // Format 2: { messages: [...], ...context } (from UniversalNavia)
    let query: string | undefined = body.query;
    let userId: string | undefined = body.userId;
    let queryType: string | undefined = body.queryType;

    // If format 2, extract from messages and context
    if (!query && body.messages && Array.isArray(body.messages) && body.messages.length > 0) {
      query = body.messages[0]?.content;
    }
    
    if (!userId && body.userId) {
      userId = body.userId;
    }
    
    if (!queryType && body.queryType) {
      queryType = body.queryType;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Missing query' },
        { status: 400 }
      );
    }

    console.log('🧠 [Memory Recall] Query type:', queryType, 'for user:', userId);

    // Get relevant memories from Pinecone using utility function
    // This includes both type: 'brain_dump' AND userId filter
    const memories = await getBrainDumpMemories(userId, query, 10);

    // Get not_started tasks from Supabase
    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'not_started')
      .order('created_at', { ascending: false })
      .limit(10);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
    }

    console.log('✅ [Memory Recall] Found', memories.length, 'memories and', tasks?.length || 0, 'pending tasks');

    // Build context for AI
    let contextPrompt = MEMORY_RECALL_PROMPT;
    
    contextPrompt += `\n\nQUERY TYPE: ${queryType}`;
    contextPrompt += `\nUSER QUESTION: "${query}"`;
    
    if (memories.length > 0) {
      contextPrompt += `\n\n📝 RECENT BRAIN DUMPS:`;
      memories.slice(0, 5).forEach((memory: any, idx: number) => {
        contextPrompt += `\n${idx + 1}. "${memory.content}" (${new Date(memory.timestamp).toLocaleDateString()})`;
        if (memory.extracted_items && Array.isArray(memory.extracted_items)) {
          contextPrompt += `\n   Extracted: ${memory.extracted_items.map((i: any) => i.content).join(', ')}`;
        }
      });
    }
    
    if (tasks && tasks.length > 0) {
      contextPrompt += `\n\n✅ PENDING TASKS:`;
      tasks.slice(0, 10).forEach((task: any, idx: number) => {
        contextPrompt += `\n${idx + 1}. ${task.title}`;
      });
    }

    console.log('🧠 [Memory Recall] Context prompt built:', contextPrompt.slice(0, 400));

    // Stream AI response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('🎧 [Memory Recall] Starting Groq stream with query:', query);
          await groqStreamChat(
            [
              { role: 'system', content: contextPrompt },
              { role: 'user', content: query },
            ],
            (chunk) => {
              console.log('📡 [Memory Recall] Received chunk:', chunk);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
            },
            {
              model: GROQ_MODELS.LLAMA_4_SCOUT,
              temperature: 0.8,
              max_tokens: 300,
            }
          );

          console.log('✅ [Memory Recall] Stream completed');
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Memory recall streaming error:', error);
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
    console.error('❌ [Memory Recall] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve memories' },
      { status: 500 }
    );
  }
}
