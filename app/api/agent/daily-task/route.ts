// API Route: Daily Task Agent
// Handles executive function, task management, and productivity queries

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { processDailyTaskQuery } from '@/lib/agents/daily-task';
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

    // Process the query with Daily Task Agent
    const startTime = Date.now();
    const response = await processDailyTaskQuery({
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
          category: 'daily_task',
          persona: 'daily_task_agent',
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
      taskId = await autoStoreTaskIfNeeded(userId, 'daily_task', response, query);
      if (taskId) {
        console.log(`📋 Daily task created: ${taskId}`);
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
    console.error('Daily task agent API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process task query',
        domain: 'daily_task',
      },
      { status: 500 }
    );
  }
}

