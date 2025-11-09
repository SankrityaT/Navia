// BACKEND: Chat endpoint (Legacy - redirects to new multi-agent system)
// NOTE: This route is kept for backwards compatibility
// New implementation should use /api/query instead

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { orchestrateQuery } from '@/lib/agents/orchestrator';
import { storeChatMessage } from '@/lib/pinecone/chat-history';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, userContext } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Use new orchestrator system
    const result = await orchestrateQuery(userId, message, userContext);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to process message',
          message: 'I encountered an issue. Please try rephrasing your question.',
        },
        { status: 500 }
      );
    }

    // Get primary domain and response
    const primaryDomain = result.metadata.domainsInvolved[0] || 'daily_task';
    const responseText = result.combinedSummary || result.responses[0]?.summary || '';

    // Store conversation
    try {
      await storeChatMessage(
        userId,
        message,
        responseText,
        {
          category: primaryDomain,
          persona: 'chat_orchestrator',
          complexity: result.metadata.complexity,
          hadBreakdown: result.metadata.usedBreakdown,
        }
      );
    } catch (storageError) {
      console.error('Failed to store chat:', storageError);
    }

    // Return in legacy format for compatibility
    return NextResponse.json({
      message: responseText,
      persona: primaryDomain,
      personaIcon: primaryDomain === 'finance' ? '💰' : primaryDomain === 'career' ? '💼' : '✅',
      breakdown: result.breakdown,
      resources: result.allResources,
      sources: result.allSources,
      functionCall: null,
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}
