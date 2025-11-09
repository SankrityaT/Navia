// API Route: Main Query Orchestrator
// Primary endpoint for all user queries - routes to appropriate agents

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { orchestrateQuery } from '@/lib/agents/orchestrator';
import { storeChatMessage, retrieveChatHistory, retrieveRelevantContext } from '@/lib/pinecone/chat-history';
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

    // HYBRID RETRIEVAL WITH DOMAIN FILTERING: TOP 3 SEMANTIC + REST CHRONOLOGICAL
    // Step 1: Quick intent detection to get primary domain for filtering
    const { detectIntent } = await import('@/lib/agents/orchestrator');
    const quickIntent = await detectIntent(query, undefined);
    const primaryDomain = quickIntent.domains[0] || 'daily_task';
    
    console.log(`🎯 Primary domain for history retrieval: ${primaryDomain}`);
    
    // Step 2: Get top 3 semantically relevant messages FILTERED by domain
    const semanticMatches = await retrieveRelevantContext(userId, query, primaryDomain, 3);
    
    // Step 3: Get ALL chat history for that domain (time-based, newest first)
    const fullHistory = await retrieveChatHistory(userId, 1000, primaryDomain);
    
    // Step 4: Remove semantic matches from full history to avoid duplicates
    const semanticTimestamps = new Set(semanticMatches.map(m => m.timestamp));
    const chronologicalHistory = fullHistory.filter(chat => !semanticTimestamps.has(chat.timestamp));

    // Step 4: Format conversation history - SEMANTIC FIRST, THEN CHRONOLOGICAL
    // Keep track of semantic match count for formatting in agents
    const semanticMatchMessageCount = semanticMatches.length * 2; // × 2 for user + assistant
    
    const conversationHistory = [
      // TOP 3: Most semantically relevant (will be marked in agent formatting)
      ...semanticMatches.map((chat) => [
        { 
          role: 'user' as const, 
          content: chat.message,
        },
        { 
          role: 'assistant' as const, 
          content: chat.response,
        },
      ]).flat(),
      
      // REST: Chronological chat history (for general context)
      ...chronologicalHistory.map((chat) => [
        { 
          role: 'user' as const, 
          content: chat.message,
        },
        { 
          role: 'assistant' as const, 
          content: chat.response,
        },
      ]).flat(),
    ];

    // Build enhanced context with hybrid retrieval
    const enhancedContext = {
      ...userContext,
      recentHistory: conversationHistory, // TOP 3 semantic + rest chronological (clean: only role + content)
      fullHistoryCount: fullHistory.length,
      semanticMatchCount: semanticMatches.length, // How many conversations are semantic matches
      semanticMatchMessageCount, // How many messages (conversations × 2) are semantic matches
      retrievalStrategy: 'hybrid_semantic_first', // For debugging
    };

    // Log retrieval strategy for debugging
    console.log('🔍 Hybrid Retrieval Summary:', {
      primaryDomain,
      totalMessages: fullHistory.length,
      semanticTop3: semanticMatches.length,
      chronologicalRest: chronologicalHistory.length,
      conversationHistoryLength: conversationHistory.length,
      order: 'TOP 3 semantic (filtered) → rest chronological (filtered)',
    });

    // Orchestrate the query with full context
    const result = await orchestrateQuery(userId, query, enhancedContext);

    if (!result.success) {
      // Store error in database for analytics/debugging, but mark as error
      const errorMessage = 'I encountered an issue processing your question. That\'s okay - sometimes technology has its own executive function challenges! Please try rephrasing your question about tasks, organization, or productivity.';
      
      try {
        const { storeChatMessage: storeInSupabase } = await import('@/lib/supabase/operations');
        await storeInSupabase({
          user_id: userId,
          message: query,
          response: errorMessage,
          category: primaryDomain,
          persona: 'orchestrator',
          metadata: {
            error: true,
            errorType: 'orchestration_failure',
            ...result.metadata,
          },
          is_error: true, // Mark as error - will be hidden from UI
        });
        console.log(`⚠️ Error chat stored for analytics (hidden from UI) for user ${userId}`);
      } catch (storageError) {
        console.error('Failed to store error chat:', storageError);
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to process query',
          message: errorMessage,
          metadata: result.metadata,
        },
        { status: 500 }
      );
    }

    // Use the same primary domain for chat history storage
    // (already determined at line 31 for history retrieval)
    const responseText = result.combinedSummary || result.responses[0]?.summary || '';

    // Store the conversation in BOTH Supabase (primary) and Pinecone (semantic search)
    try {
      const timestamp = Date.now();
      const pineconeId = `chat_${userId}_${timestamp}`;

      // 1. Store in Pinecone for semantic search (with embedding)
      await storeChatMessage(
        userId,
        query,
        responseText,
        {
          category: primaryDomain,
          persona: 'orchestrator',
          complexity: result.metadata.complexity,
          hadBreakdown: result.metadata.usedBreakdown,
        }
      );

      // 2. Store in Supabase as primary database
      const { storeChatMessage: storeInSupabase } = await import('@/lib/supabase/operations');
      await storeInSupabase({
        user_id: userId,
        message: query,
        response: responseText,
        category: primaryDomain,
        persona: 'orchestrator',
        metadata: {
          complexity: result.metadata.complexity,
          hadBreakdown: result.metadata.usedBreakdown,
          domains: result.metadata.domainsInvolved,
          executionTime: result.metadata.executionTime,
        },
        pinecone_id: pineconeId,
        is_error: false, // Explicitly mark as successful
      });

      console.log(`✅ Chat stored in both Supabase and Pinecone for user ${userId}`);
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
      
      // Resources and sources (from orchestrator, already deduplicated)
      resources: result.resources,
      sources: result.sources,
      
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
    
    // ONLY add breakdown field if it exists and has items (from PRIMARY agent only)
    if (result.breakdown && result.breakdown.length > 0) {
      responseData.breakdown = result.breakdown;
      // Also include tips if they exist
      if (result.breakdownTips && result.breakdownTips.length > 0) {
        responseData.breakdownTips = result.breakdownTips;
      }
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

