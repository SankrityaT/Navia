// API Route: AI-Generated Tasks (Task Visualizer)
// Retrieve and manage tasks created by AI agents

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import aiTaskStore from '@/lib/tasks/ai-task-storage';

// GET: Retrieve AI-generated tasks
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') as 'finance' | 'career' | 'daily_task' | null;
    const taskId = searchParams.get('task_id');
    const stats = searchParams.get('stats') === 'true';

    // Get specific task by ID
    if (taskId) {
      const task = await aiTaskStore.getTaskById(userId, taskId);
      
      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        task,
      });
    }

    // Get task statistics
    if (stats) {
      const taskStats = await aiTaskStore.getTaskStats(userId);
      return NextResponse.json({
        success: true,
        stats: taskStats,
      });
    }

    // Get tasks by domain or all tasks
    const tasks = domain
      ? await aiTaskStore.getTasksByDomain(userId, domain)
      : await aiTaskStore.getUserTasks(userId);

    // Group by domain for frontend convenience
    const groupedByDomain = {
      finance: tasks.filter((t) => t.domain === 'finance'),
      career: tasks.filter((t) => t.domain === 'career'),
      daily_task: tasks.filter((t) => t.domain === 'daily_task'),
    };

    return NextResponse.json({
      success: true,
      tasks,
      groupedByDomain,
      total: tasks.length,
    });

  } catch (error) {
    console.error('AI task retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tasks' },
      { status: 500 }
    );
  }
}

// PATCH: Update task status
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { task_id, status } = body;

    if (!task_id || !status) {
      return NextResponse.json(
        { error: 'task_id and status are required' },
        { status: 400 }
      );
    }

    if (!['not_started', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: not_started, in_progress, or completed' },
        { status: 400 }
      );
    }

    const updated = await aiTaskStore.updateTaskStatus(userId, task_id, status);

    if (!updated) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Task status updated to ${status}`,
    });

  } catch (error) {
    console.error('AI task update error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a task
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');

    if (!taskId) {
      return NextResponse.json(
        { error: 'task_id is required' },
        { status: 400 }
      );
    }

    const deleted = await aiTaskStore.deleteTask(userId, taskId);

    if (!deleted) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });

  } catch (error) {
    console.error('AI task deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}

