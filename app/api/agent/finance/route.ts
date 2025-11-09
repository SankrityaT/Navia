// API Route: Finance Agent
// Handles budgeting, financial planning, and money management queries

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { processFinanceQuery } from '@/lib/agents/finance';
import { storeChatMessage } from '@/lib/pinecone/chat-history';
import { autoStoreTaskIfNeeded } from '@/lib/tasks/ai-task-storage';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, userContext } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Process the query with Finance Agent
    const startTime = Date.now();
    const response = await processFinanceQuery({
      userId,
      query,
      userContext,
    });
    const executionTime = Date.now() - startTime;

    // Store conversation in Pinecone for future context
    // CRITICAL: Don't store error messages - they pollute the vector database!
    const isErrorResponse = !response.summary || 
      response.summary.toLowerCase().includes('encountered an issue') ||
      response.summary.toLowerCase().includes('error processing') ||
      response.summary.toLowerCase().includes('please try rephrasing') ||
      response.summary.toLowerCase().includes('api error') ||
      response.summary.toLowerCase().includes('rate limit') ||
      response.summary.toLowerCase().includes('quota exceeded') ||
      response.summary.trim().length < 20;

    if (!isErrorResponse) {
      try {
        await storeChatMessage(
          userId,
          query,
          response.summary,
          {
            category: 'finance',
            persona: 'finance_agent',
            complexity: response.metadata?.complexity,
            hadBreakdown: !!response.breakdown,
          }
        );
      } catch (storageError) {
        console.error('Failed to store chat message:', storageError);
        // Don't fail the request if storage fails
      }
    } else {
      console.warn('⚠️ Finance agent: Skipping Pinecone storage - Error response detected');
    }

    // Auto-store task if breakdown was generated (for Task Visualizer)
    let taskId: string | null = null;
    try {
      taskId = await autoStoreTaskIfNeeded(userId, 'finance', response, query);
      if (taskId) {
        console.log(`📋 Finance task created: ${taskId}`);
      }
    } catch (taskError) {
      console.error('Failed to store AI task:', taskError);
      // Don't fail the request if task storage fails
    }

    // Return response with execution metadata
    return NextResponse.json({
      success: true,
      ...response,
      executionTime,
      taskId, // Include task ID if task was created
    });

  } catch (error) {
    console.error('Finance agent API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process finance query',
        domain: 'finance',
      },
      { status: 500 }
    );
  }
}

