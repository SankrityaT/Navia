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

  return <TasksClient initialTasks={tasks} />;
}
