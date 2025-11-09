// API Route: Main Query Orchestrator
// Primary endpoint for all user queries - routes to appropriate agents

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { orchestrateQuery } from '@/lib/agents/orchestrator';
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

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Orchestrate the query through the multi-agent system
    const result = await orchestrateQuery(userId, query, userContext);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to process query',
          message: 'I encountered an issue processing your question. Please try rephrasing or breaking it into smaller parts.',
          metadata: result.metadata,
        },
        { status: 500 }
      );
    }

    // Determine primary domain for chat history storage
    const primaryDomain = result.metadata.domainsInvolved[0] || 'daily_task';
    const responseText = result.combinedSummary || result.responses[0]?.summary || '';

    // Store the conversation in Pinecone
    try {
      await storeChatMessage(
        userId,
        query,
        responseText,
        {
          category: primaryDomain,
          persona: 'orchestrator',
          complexity: result.metadata.complexity,
          hadBreakdown: result.metadata.usedBreakdown,
          multiAgent: result.metadata.multiAgent,
          domainsInvolved: result.metadata.domainsInvolved.join(','),
        }
      );
    } catch (storageError) {
      console.error('Failed to store orchestrated chat:', storageError);
      // Don't fail the request if storage fails
    }

    // Auto-store tasks for each agent that generated a breakdown
    const taskIds: string[] = [];
    if (result.metadata.usedBreakdown) {
      for (const response of result.responses) {
        try {
          const taskId = await autoStoreTaskIfNeeded(userId, response.domain, response, query);
          if (taskId) {
            taskIds.push(taskId);
            console.log(`📋 Orchestrator: Task created: ${taskId} (${response.domain})`);
          }
        } catch (taskError) {
          console.error('Failed to store AI task from orchestrator:', taskError);
        }
      }
    }

    // Return the orchestrated result - ONLY include breakdown if it exists
    const responseData: any = {
      success: true,
      query,
      domains: result.metadata.domainsInvolved,
      
      // Primary response
      summary: result.combinedSummary || result.responses[0]?.summary,
      
      // Resources and sources
      resources: result.allResources,
      sources: result.allSources,
      
      // Individual agent responses (for debugging or detailed view)
      agentResponses: result.responses.map((r) => ({
        domain: r.domain,
        summary: r.summary,
        breakdown: r.breakdown,
        needsBreakdown: r.metadata?.needsBreakdown,
      })),
      
      // Metadata (ALWAYS include needsBreakdown here!)
      metadata: {
        ...result.metadata,
        userId,
        timestamp: Date.now(),
      },
    };
    
    // ONLY add breakdown field if it exists and has items
    if (result.breakdown && result.breakdown.length > 0) {
      responseData.breakdown = result.breakdown;
    }
    
    // Only add taskIds if they exist
    if (taskIds.length > 0) {
      responseData.taskIds = taskIds;
    }
    
    console.log('🎯 API Response:', {
      hasBreakdown: !!result.breakdown,
      breakdownLength: result.breakdown?.length || 0,
      needsBreakdown: result.metadata.needsBreakdown,
      willShowButtons: result.metadata.needsBreakdown && (!result.breakdown || result.breakdown.length === 0),
    });
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Query orchestrator API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process query',
        message: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing orchestrator health
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Query orchestrator is running',
      availableAgents: ['finance', 'career', 'daily_task'],
      features: [
        'Multi-agent routing',
        'Intent detection',
        'Task breakdown',
        'RAG retrieval',
        'Chat history',
      ],
    });

  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Orchestrator health check failed' },
      { status: 500 }
    );
  }
}

