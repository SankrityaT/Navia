import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET user state (energy level, support level)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('energy_level, support_level')
      .eq('clerk_user_id', userId)
      .single();

    if (error) throw error;

    return NextResponse.json({
      energyLevel: data?.energy_level || 5,
      supportLevel: data?.support_level || 3,
    });
  } catch (error) {
    console.error('Error fetching user state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user state' },
      { status: 500 }
    );
  }
}

// PATCH update user state
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { energyLevel, supportLevel } = body;

    const updates: any = {};
    if (energyLevel !== undefined) updates.energy_level = energyLevel;
    if (supportLevel !== undefined) updates.support_level = supportLevel;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('clerk_user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      energyLevel: data.energy_level,
      supportLevel: data.support_level,
    });
  } catch (error) {
    console.error('Error updating user state:', error);
    return NextResponse.json(
      { error: 'Failed to update user state' },
      { status: 500 }
    );
  }
}
