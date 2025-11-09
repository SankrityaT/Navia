// API: Manual check-in for accountability
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { storeCheckIn, getCheckIns } from '@/lib/pinecone/connections';
import { CheckIn } from '@/lib/types';

// GET: Fetch check-ins for a connection
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');
    
    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID required' }, { status: 400 });
    }

    const checkIns = await getCheckIns(connectionId);

    return NextResponse.json({ checkIns });
  } catch (error) {
    console.error('Fetch check-ins error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
}

// POST: Submit a check-in
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId, goalsCompleted, totalGoals, reflection } = await request.json();
    
    if (!connectionId || goalsCompleted === undefined || totalGoals === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const checkIn: CheckIn = {
      checkin_id: `checkin_${Date.now()}_${userId}`,
      connection_id: connectionId,
      user_id: userId,
      week_start: weekStart.toISOString(),
      goals_completed: goalsCompleted,
      total_goals: totalGoals,
      reflection,
      timestamp: new Date().toISOString(),
    };

    await storeCheckIn(checkIn);

    return NextResponse.json({ 
      success: true,
      checkIn,
      message: 'Check-in submitted! Great work staying accountable.' 
    });
  } catch (error) {
    console.error('Submit check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to submit check-in' },
      { status: 500 }
    );
  }
}
