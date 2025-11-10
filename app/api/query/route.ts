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
    const { query, userContext, sessionMessages = [], session_id } = body;
    
    // Import Supabase operations at the top (used in both error and success paths)
    const { storeChatMessage: storeInSupabase, generateSessionTitle, getChatHistory: getSupabaseHistory } = await import('@/lib/supabase/operations');

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    console.log('📨 Received query with session context:', {
      query,
      sessionMessageCount: sessionMessages.length,
      sessionMessages: sessionMessages.slice(-4), // Show last 4 for debugging
    });

    // HYBRID RETRIEVAL WITH DOMAIN FILTERING: TOP 3 SEMANTIC + REST CHRONOLOGICAL
    // Step 1: Quick intent detection to get primary domain for filtering
    // CRITICAL: Pass session messages for context-aware routing!
    const { detectIntent } = await import('@/lib/agents/orchestrator');
    const quickIntent = await detectIntent(query, sessionMessages, sessionMessages.length);
    const primaryDomain = quickIntent.domains[0] || 'daily_task';
    
    console.log(`🎯 Primary domain for history retrieval: ${primaryDomain}`);
    
    // Step 2: Get top 3 semantically relevant messages FILTERED by domain AND session
    const semanticMatches = await retrieveRelevantContext(userId, query, primaryDomain, 3, session_id);
    
    // Step 3: Get ALL chat history for that domain AND session (time-based, newest first)
    const fullHistory = await retrieveChatHistory(userId, 1000, primaryDomain, session_id);
    
    // Step 4: Remove semantic matches from full history to avoid duplicates
    const semanticTimestamps = new Set(semanticMatches.map(m => m.timestamp));
    const chronologicalHistory = fullHistory.filter(chat => !semanticTimestamps.has(chat.timestamp));

    // Step 4: Format conversation history - SESSION FIRST, THEN SEMANTIC, THEN CHRONOLOGICAL
    // CRITICAL: Session messages come first for immediate context (follow-ups!)
    const sessionMessageCount = sessionMessages.length;
    const semanticMatchMessageCount = semanticMatches.length * 2; // × 2 for user + assistant
    
    const conversationHistory = [
      // CURRENT SESSION: Most important for follow-up questions
      ...sessionMessages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      
      // TOP 3 SEMANTIC: Most semantically relevant from stored history
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
      recentHistory: conversationHistory, // SESSION + semantic + chronological (clean: only role + content)
      fullHistoryCount: fullHistory.length,
      sessionMessageCount, // How many messages from current session (for follow-ups!)
      semanticMatchCount: semanticMatches.length, // How many conversations are semantic matches
      semanticMatchMessageCount, // How many messages (conversations × 2) are semantic matches
      retrievalStrategy: 'session_first_hybrid', // For debugging
    };

    // Log retrieval strategy for debugging
    console.log('🔍 Hybrid Retrieval Summary:', {
      primaryDomain,
      sessionMessages: sessionMessageCount,
      totalStoredMessages: fullHistory.length,
      semanticTop3: semanticMatches.length,
      chronologicalRest: chronologicalHistory.length,
      conversationHistoryLength: conversationHistory.length,
      order: 'SESSION (immediate) → TOP 3 semantic (relevant) → rest chronological (context)',
    });

    // Determine if first message in session by checking Supabase (source of truth)
    // This needs to happen BEFORE orchestrator call so it's available for both error and success paths
    const existingSessionMessages = await getSupabaseHistory(userId, 1, undefined, false, session_id);
    const isFirstMessage = existingSessionMessages.length === 0;
    const sessionTitle = isFirstMessage ? generateSessionTitle(query, primaryDomain) : undefined;
    
    console.log(`🔍 Session check: ${session_id}, existing messages: ${existingSessionMessages.length}, isFirstMessage: ${isFirstMessage}`);

    // Orchestrate the query with full context
    const result = await orchestrateQuery(userId, query, enhancedContext);

    if (!result.success) {
      // Store error in database for analytics/debugging, but mark as error
      const errorMessage = 'I encountered an issue processing your question. That\'s okay - sometimes technology has its own executive function challenges! Please try rephrasing your question about tasks, organization, or productivity.';
      
      try {
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
          session_id, // Track session
          session_title: sessionTitle, // Title if first message
          is_first_message: isFirstMessage,
        });
        console.log(`⚠️ Error chat stored for analytics (hidden from UI) for user ${userId}, session ${session_id}`);
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

    // CRITICAL: Don't store error messages in Pinecone - they pollute the vector database!
    // Check if response contains error indicators
    const isErrorResponse = !responseText || 
      responseText.toLowerCase().includes('encountered an issue') ||
      responseText.toLowerCase().includes('error processing') ||
      responseText.toLowerCase().includes('please try rephrasing') ||
      responseText.toLowerCase().includes('api error') ||
      responseText.toLowerCase().includes('rate limit') ||
      responseText.toLowerCase().includes('quota exceeded') ||
      responseText.trim().length < 20; // Very short responses are likely errors

    // Store the conversation in BOTH Supabase (primary) and Pinecone (semantic search)
    let supabaseMessageId: string | undefined;
    try {
      const timestamp = Date.now();
      const pineconeId = `chat_${userId}_${timestamp}`;
      
      // 1. Store in Pinecone ONLY if it's a valid response (not an error)
      if (!isErrorResponse) {
        await storeChatMessage(
          userId,
          query,
          responseText,
          {
            category: primaryDomain,
            persona: 'orchestrator',
            complexity: result.metadata.complexity,
            hadBreakdown: result.metadata.usedBreakdown,
            session_id, // Track session in Pinecone
          }
        );
        console.log(`✅ Conversation stored in Pinecone successfully for session ${session_id}`);
      } else {
        console.warn('⚠️ Skipping Pinecone storage - Error response detected:', {
          responsePreview: responseText.substring(0, 100),
          reason: 'Error messages should not pollute vector database',
        });
      }

      // 2. ALWAYS store in Supabase as primary database (even if Pinecone was skipped)
      const storedMessage = await storeInSupabase({
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
          feedbackToggleCount: 0, // Initialize feedback toggle count
        },
        pinecone_id: !isErrorResponse ? pineconeId : undefined, // Only link to Pinecone if stored there
        is_error: false, // Explicitly mark as successful
        session_id, // Track session
        session_title: sessionTitle, // Title if first message
        is_first_message: isFirstMessage, // Flag first message
      });

      // Capture the Supabase message UUID for feedback tracking
      supabaseMessageId = storedMessage?.id;

      console.log(`✅ Chat stored in Supabase for user ${userId} (message_id: ${supabaseMessageId})`);
    } catch (storageError) {
      console.error('Failed to store chat:', storageError);
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
        sessionId: session_id, // Return session ID
        sessionTitle: isFirstMessage ? sessionTitle : undefined, // Return title if first message
        isFirstMessage, // Flag if first message
        messageId: supabaseMessageId, // Supabase UUID for feedback tracking
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

