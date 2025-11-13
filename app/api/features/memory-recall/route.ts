import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { generateEmbedding } from '@/lib/embeddings/client';
import { getIndex } from '@/lib/pinecone/client';
import { groqStreamChat, GROQ_MODELS } from '@/lib/groq/client';

const MEMORY_RECALL_PROMPT = `You are Navia, a warm AI companion helping neurodivergent users recall what they've brain dumped.

YOUR JOB:
Answer their question based on their brain dumps and pending tasks. Be conversational, warm, and helpful.

RESPONSE STYLE:
- Sound like a caring friend, NOT a robot
- Be conversational and natural
- Example GOOD: "Hey, I remember you mentioned needing to pick up your ADHD meds and email Professor Chen about that recommendation letter. Also, you said something about forgetting to eat when you're stressed - that's so real. 💛"
- Example BAD: "I recall you mentioning• Needing to pick ADHD medication• Wanting to email..."
- Keep it SHORT (3-4 sentences max)
- Pick 2-3 most important things
- Use natural language, not bullet points
- Add empathy and validation
- End with warmth 💛

QUERY TYPES:
- "forgetting": Remind them of 2-3 key things they mentioned but haven't done
- "today": What they said they'd do today
- "patterns": 1-2 patterns you notice in their brain dumps

IMPORTANT: Be warm, specific, and conversational. Reference actual content from their brain dumps and tasks.`;

export async function POST(request: NextRequest) {
  try {
    const { query, userId, queryType } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    console.log('🧠 [Memory Recall] Query type:', queryType, 'for user:', userId);

    // Get relevant memories from Pinecone
    let memories: any[] = [];
    if (query) {
      const queryEmbedding = await generateEmbedding(query);
      const index = getIndex();
      const namespace = index.namespace(`user-${userId}`);

      const queryResponse = await namespace.query({
        vector: queryEmbedding,
        topK: 10,
        includeMetadata: true,
        filter: {
          type: 'brain_dump',
        },
      });

      memories = queryResponse.matches.map((match: any) => ({
        content: match.metadata?.content || '',
        timestamp: match.metadata?.timestamp || '',
        extracted_items: match.metadata?.extracted_items || null,
        patterns: match.metadata?.patterns || null,
        score: match.score,
      }));
    }

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
        if (memory.extracted_items) {
          try {
            const items = JSON.parse(memory.extracted_items);
            contextPrompt += `\n   Extracted: ${items.map((i: any) => i.content).join(', ')}`;
          } catch (e) {}
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
