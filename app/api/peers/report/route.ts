// API: Report a user
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  console.log('🚩 [REPORT USER] Starting...');
  
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportedUserId, reason, description } = await request.json();
    
    if (!reportedUserId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create user_reports table entry (you'll need to create this table)
    const { error } = await supabase
      .from('user_reports')
      .insert({
        reporter_id: userId,
        reported_id: reportedUserId,
        reason,
        description: description || '',
        status: 'pending',
        reported_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ [REPORT USER] Error:', error);
      return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
    }

    console.log('✅ [REPORT USER] Report submitted successfully');

    // TODO: Send notification to admin/moderation team

    return NextResponse.json({ 
      success: true,
      message: 'Report submitted successfully. Our team will review it shortly.'
    });
  } catch (error: any) {
    console.error('❌ [REPORT USER] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit report', details: error?.message },
      { status: 500 }
    );
  }
}
