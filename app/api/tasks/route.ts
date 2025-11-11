// BACKEND: CRUD operations for tasks
// TODO: Implement GET (query tasks from Pinecone)
// TODO: Implement POST (create new task)
// TODO: Implement PATCH (update task status)
// TODO: Implement DELETE

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { queryTasks, storeTask, updateTaskStatus, deleteTask } from '@/lib/pinecone/operations';
import { generateEmbedding } from '@/lib/embeddings/client';
import { Task } from '@/lib/types';

// GET: Query tasks
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
    const date = searchParams.get('date');

    // Build filter
    const filters: any = {};
    if (status) filters.status = { $eq: status };
    if (category) filters.category = { $eq: category };
    if (priority) filters.priority = { $eq: priority };
    if (date) filters.date = { $eq: date };

    // Generate query embedding
    const queryText = `Get tasks for user with filters: ${JSON.stringify(filters)}`;
    const embedding = await generateEmbedding(queryText);

    const results = await queryTasks(userId, embedding, filters, 50);

    // Extract metadata from Pinecone matches
    const tasks = results.map((match: any) => ({
      id: match.id,
      task_id: match.id,
      ...match.metadata,
    }));

    console.log('📋 [API/TASKS] Returning tasks:', tasks);
    console.log('📋 [API/TASKS] Task titles:', tasks.map((t: any) => t.title));

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Task query error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST: Create new task
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskData = await request.json();
    
    const task: Task = {
      user_id: userId,
      task_id: `task_${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'not_started',
      created_by: 'user',
      ...taskData,
    };

    // Generate embedding for task
    const taskText = `Task: ${task.title}, category: ${task.category}, priority: ${task.priority}`;
    const embedding = await generateEmbedding(taskText);

    await storeTask(task, embedding);

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

// PATCH: Update task status
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { task_id, status } = await request.json();

    await updateTaskStatus(task_id, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Task update error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE: Delete task
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    // Support both 'id' and 'task_id' parameters
    const taskId = searchParams.get('id') || searchParams.get('task_id');

    console.log('🗑️ [API/TASKS] DELETE request - taskId:', taskId);

    if (!taskId) {
      console.error('❌ [API/TASKS] No task ID provided');
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    await deleteTask(taskId);
    console.log('✅ [API/TASKS] Task deleted successfully:', taskId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [API/TASKS] Task deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
