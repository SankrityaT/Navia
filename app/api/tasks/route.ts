// BACKEND: CRUD operations for tasks using Supabase

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Query tasks from Supabase
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    // Build Supabase query
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (priority) query = query.eq('priority', priority);

    const { data: tasks, error } = await query;

    if (error) throw error;

    console.log('📋 [API/TASKS] Fetched from Supabase:', tasks?.length || 0);
    console.log('📋 [API/TASKS] Task titles:', tasks?.map((t: any) => t.title));

    return NextResponse.json({ tasks: tasks || [] });
  } catch (error) {
    console.error('Task query error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST: Create new task in Supabase
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskData = await request.json();
    
    const task = {
      user_id: userId,
      status: 'not_started',
      created_by: 'user',
      ...taskData,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    
    console.log(`✅ Created task: "${data.title}" with ID: ${data.id}`);

    return NextResponse.json({ success: true, task: data });
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

// PATCH: Update task in Supabase
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, task_id, ...updates } = await request.json();

    const targetId = id ?? task_id;

    if (!targetId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', targetId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, task: data });
  } catch (error) {
    console.error('Task update error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE: Delete task from Supabase
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [API/TASKS] Task deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
