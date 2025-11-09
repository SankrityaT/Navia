// API Route: Career Agent
// Handles job search, career development, and workplace accommodation queries

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { processCareerQuery } from '@/lib/agents/career';
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

    // Process the query with Career Agent
    const startTime = Date.now();
    const response = await processCareerQuery({
      userId,
      query,
      userContext,
    });
    const executionTime = Date.now() - startTime;

    // Store conversation in Pinecone for future context
    try {
      await storeChatMessage(
        userId,
        query,
        response.summary,
        {
          category: 'career',
          persona: 'career_agent',
          complexity: response.metadata?.complexity,
          hadBreakdown: !!response.breakdown,
        }
      );
    } catch (storageError) {
      console.error('Failed to store chat message:', storageError);
      // Don't fail the request if storage fails
    }

    // Auto-store task if breakdown was generated (for Task Visualizer)
    let taskId: string | null = null;
    try {
      taskId = await autoStoreTaskIfNeeded(userId, 'career', response, query);
      if (taskId) {
        console.log(`📋 Career task created: ${taskId}`);
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
    console.error('Career agent API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process career query',
        domain: 'career',
      },
      { status: 500 }
    );
  }
}

