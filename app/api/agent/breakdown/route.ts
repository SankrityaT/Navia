// API Route: Breakdown Tool
// Standalone endpoint for breaking down complex tasks

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {
  analyzeTaskComplexity,
  generateBreakdown,
  containsBreakdownKeywords,
  addEFSpecificTips,
} from '@/lib/agents/breakdown';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      task,
      context,
      autoBreakdown = false,
      userContext,
    } = body;

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 });
    }

    // Step 1: Analyze complexity
    const analysis = await analyzeTaskComplexity(task, context);

    // Step 2: Check if breakdown is explicitly requested or needed
    const hasBreakdownKeywords = containsBreakdownKeywords(task);
    const shouldBreakdown = autoBreakdown || hasBreakdownKeywords || analysis.needsBreakdown;

    if (!shouldBreakdown) {
      return NextResponse.json({
        needsBreakdown: false,
        complexity: analysis.complexity,
        reasoning: 'Task is simple enough without breakdown',
        message: 'This task looks straightforward - you can tackle it directly!',
      });
    }

    // Step 3: Generate the breakdown
    const breakdown = await generateBreakdown({
      task,
      context,
      complexity: analysis.complexity,
      userEFProfile: userContext?.ef_profile,
    });

    // Step 4: Add personalized tips if EF profile is available
    const personalizedTips = userContext?.ef_profile
      ? addEFSpecificTips(userContext.ef_profile)
      : breakdown.tips;

    return NextResponse.json({
      success: true,
      breakdown: breakdown.breakdown,
      needsBreakdown: true,
      complexity: breakdown.complexity,
      estimatedTime: breakdown.estimatedTime,
      tips: personalizedTips,
      reasoning: analysis.reasoning,
    });

  } catch (error) {
    console.error('Breakdown API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate breakdown' },
      { status: 500 }
    );
  }
}

// GET endpoint for checking if a task needs breakdown (without generating it)
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const task = searchParams.get('task');

    if (!task) {
      return NextResponse.json({ error: 'Task parameter is required' }, { status: 400 });
    }

    const analysis = await analyzeTaskComplexity(task);
    const hasBreakdownKeywords = containsBreakdownKeywords(task);

    return NextResponse.json({
      needsBreakdown: analysis.needsBreakdown || hasBreakdownKeywords,
      complexity: analysis.complexity,
      reasoning: analysis.reasoning,
      hasKeywords: hasBreakdownKeywords,
    });

  } catch (error) {
    console.error('Breakdown analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze task' },
      { status: 500 }
    );
  }
}

