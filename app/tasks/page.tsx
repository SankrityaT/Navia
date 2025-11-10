// FRONTEND: ADHD-Friendly Task Visualizer
// Research-based design for neurodivergent users

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import TasksClient from '@/components/tasks/TasksClient';
import { Task } from '@/lib/types';

async function fetchTasks(userId: string): Promise<Task[]> {
  try {
    console.log('🔍 [LIVE DATA] Fetching tasks from Pinecone for user:', userId);
    
    // Import the operations directly
    const { queryTasks } = await import('@/lib/pinecone/operations');
    const { generateEmbedding } = await import('@/lib/embeddings/client');
    
    // Generate query embedding
    const queryText = `Get all tasks for user ${userId}`;
    const embedding = await generateEmbedding(queryText);
    
    // Query tasks directly from Pinecone
    const results = await queryTasks(userId, embedding, {}, 50);
    
    // Transform Pinecone results to Task objects
    const tasks = results.map((match: any) => match.metadata as Task).filter(Boolean);
    
    console.log(`✅ [LIVE DATA] Fetched ${tasks.length} tasks from Pinecone:`, tasks.map(t => t.title));
    
    return tasks;
  } catch (error) {
    console.error('❌ [LIVE DATA] Error fetching tasks:', error);
    return [];
  }
}

export default async function TasksPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch real tasks from API
  const tasks = await fetchTasks(userId);

  // Fallback mock tasks if no real data
  const mockTasks = tasks.length > 0 ? tasks : [
    {
      user_id: 'user_1',
      task_id: 'task_1',
      title: 'Update resume with recent projects',
      status: 'in_progress' as const,
      priority: 'high' as const,
      time_estimate: 45,
      category: 'career' as const,
      created_by: 'system',
      created_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    },
    {
      user_id: 'user_1',
      task_id: 'task_2',
      title: 'Research 5 companies in your field',
      status: 'not_started' as const,
      priority: 'medium' as const,
      time_estimate: 30,
      category: 'career' as const,
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
    {
      user_id: 'user_1',
      task_id: 'task_3',
      title: 'Set up monthly budget tracker',
      status: 'not_started' as const,
      priority: 'high' as const,
      time_estimate: 60,
      category: 'finance' as const,
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
    {
      user_id: 'user_1',
      task_id: 'task_4',
      title: 'Complete job application for Software Engineer role',
      status: 'completed' as const,
      priority: 'high' as const,
      time_estimate: 90,
      category: 'career' as const,
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
    {
      user_id: 'user_1',
      task_id: 'task_5',
      title: 'Organize weekly meal planning',
      status: 'in_progress' as const,
      priority: 'low' as const,
      time_estimate: 20,
      category: 'daily_life' as const,
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
    {
      user_id: 'user_1',
      task_id: 'task_6',
      title: 'Reach out to college friend for coffee',
      status: 'not_started' as const,
      priority: 'medium' as const,
      time_estimate: 15,
      category: 'social' as const,
      created_by: 'system',
      created_at: new Date().toISOString(),
    },
  ];

  return <TasksClient initialTasks={mockTasks} />;
}
