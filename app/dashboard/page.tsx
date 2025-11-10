// FRONTEND: Main dashboard page with warm-organic aesthetic
// Fetches real data from API endpoints

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/components/dashboard/HeaderNew';
import Dashboard from '@/components/dashboard/DashboardNew';
import { Task } from '@/lib/types';

async function fetchTasks(userId: string): Promise<Task[]> {
  try {
    console.log('🔍 [LIVE DATA] Fetching tasks from Pinecone for user:', userId);
    
    // Import the operations directly instead of making HTTP call
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

function computeGoals(tasks: Task[]) {
  // Compute dynamic goals based on task categories
  const careerTasks = tasks.filter(t => t.category === 'career');
  const financeTasks = tasks.filter(t => t.category === 'finance');
  
  const careerCompleted = careerTasks.filter(t => t.status === 'completed').length;
  const financeCompleted = financeTasks.filter(t => t.status === 'completed').length;
  
  return [
    { 
      name: 'Career Goals', 
      completed: careerCompleted, 
      total: careerTasks.length || 1, 
      color: 'bg-clay-600' 
    },
    { 
      name: 'Financial Goals', 
      completed: financeCompleted, 
      total: financeTasks.length || 1, 
      color: 'bg-sage-600' 
    },
  ];
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  const userName = user?.firstName || user?.username || 'there';

  // Fetch real tasks from API
  const allTasks = await fetchTasks(userId);
  
  // Separate quick wins (tasks with time_estimate <= 10 minutes)
  const quickWins = allTasks.filter(task => 
    task.time_estimate && task.time_estimate <= 10
  );
  
  // Regular tasks (exclude quick wins)
  const tasks = allTasks.filter(task => 
    !task.time_estimate || task.time_estimate > 10
  );
  
  // Compute goals dynamically from tasks
  const goals = computeGoals(allTasks);

  return (
    <>
      <Header userName={userName} />
      <Dashboard tasks={tasks} quickWins={quickWins} goals={goals} />
    </>
  );
}
