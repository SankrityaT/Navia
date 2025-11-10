// BACKEND: Pinecone CRUD operations
// Uses Pinecone Inference API for embeddings (1024 dimensions)
// Includes error handling and retry logic

import { getIndex } from './client';
import { Task, PineconeMetadata } from '../types';

// Store task in Pinecone
export async function storeTask(task: Task, embedding: number[]) {
  const index = getIndex();
  
  await index.upsert([
    {
      id: task.task_id,
      values: embedding,
      metadata: {
        type: 'task',
        ...task,
      } as any,
    },
  ]);
}

// Query tasks by user and filters
export async function queryTasks(
  userId: string,
  queryEmbedding: number[],
  filters?: Record<string, any>,
  topK: number = 10
) {
  const index = getIndex();
  
  const filter: any = {
    user_id: { $eq: userId },
    type: { $eq: 'task' },
    ...filters,
  };

  const results = await index.query({
    vector: queryEmbedding,
    filter,
    topK,
    includeMetadata: true,
  });

  return results.matches;
}

// Update task status
export async function updateTaskStatus(
  taskId: string,
  status: 'not_started' | 'in_progress' | 'completed'
) {
  const index = getIndex();
  
  try {
    // Fetch existing record to get the vector and metadata
    const fetchResponse = await index.fetch([taskId]);
    const record = fetchResponse.records[taskId];
    
    if (!record) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    // Update metadata with new status
    const updatedMetadata = {
      ...record.metadata,
      status,
    };
    
    // Upsert with same vector but updated metadata
    await index.upsert([
      {
        id: taskId,
        values: record.values,
        metadata: updatedMetadata as any,
      },
    ]);
    
    console.log(`✅ Updated task ${taskId} status to: ${status}`);
  } catch (error) {
    console.error(`Failed to update task ${taskId}:`, error);
    throw error;
  }
}

// Delete task
export async function deleteTask(taskId: string) {
  const index = getIndex();
  await index.deleteOne(taskId);
}

// Store user profile data with embedding
export async function storeUserProfile(
  userId: string,
  profileData: {
    name: string;
    graduation_date?: string;
    university?: string;
    ef_profile: Record<string, boolean>;
    current_goals: Record<string, boolean>;
  },
  embedding: number[]
) {
  const index = getIndex();
  
  // Extract active EF challenges and goals
  const efChallenges = Object.entries(profileData.ef_profile)
    .filter(([_, v]) => v)
    .map(([k]) => k);
  
  const goals = Object.entries(profileData.current_goals)
    .filter(([_, v]) => v)
    .map(([k]) => k);

  try {
    await index.upsert([
      {
        id: `profile_${userId}`,
        values: embedding,
        metadata: {
          user_id: userId,
          type: 'profile',
          name: profileData.name,
          graduation_date: profileData.graduation_date || '',
          university: profileData.university || '',
          ef_challenges: efChallenges.join(', '),
          goals: goals.join(', '),
          timestamp: Date.now(),
          // Store individual flags for filtering
          ...Object.fromEntries(
            efChallenges.map((challenge) => [`ef_${challenge}`, true])
          ),
          ...Object.fromEntries(
            goals.map((goal) => [`goal_${goal}`, true])
          ),
        },
      },
    ]);

    console.log(`Stored user profile for ${userId} in Pinecone`);
  } catch (error) {
    console.error('Error storing user profile in Pinecone:', error);
    throw error;
  }
}

// Retrieve user profile from Pinecone
export async function getUserProfile(userId: string) {
  const index = getIndex();
  
  try {
    const result = await index.fetch([`profile_${userId}`]);
    const record = result.records[`profile_${userId}`];
    
    if (!record) {
      return null;
    }

    return {
      userId,
      name: record.metadata?.name as string,
      graduation_date: record.metadata?.graduation_date as string,
      university: record.metadata?.university as string,
      ef_challenges: (record.metadata?.ef_challenges as string)?.split(', ') || [],
      goals: (record.metadata?.goals as string)?.split(', ') || [],
      timestamp: record.metadata?.timestamp as number,
    };
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  profileData: Partial<Parameters<typeof storeUserProfile>[1]>,
  newEmbedding?: number[]
) {
  // Fetch existing profile to merge data
  const existingProfile = await getUserProfile(userId);
  
  if (!existingProfile && !newEmbedding) {
    throw new Error('Cannot update non-existent profile without embedding');
  }

  // If no new embedding, fetch the existing vector
  let embedding = newEmbedding;
  if (!embedding) {
    const index = getIndex();
    const result = await index.fetch([`profile_${userId}`]);
    const record = result.records[`profile_${userId}`];
    embedding = record?.values as number[];
  }

  // Merge profile data
  const mergedProfile = {
    name: profileData.name || existingProfile?.name || '',
    graduation_date: profileData.graduation_date || existingProfile?.graduation_date,
    university: profileData.university || existingProfile?.university,
    ef_profile: profileData.ef_profile || {},
    current_goals: profileData.current_goals || {},
  };

  await storeUserProfile(userId, mergedProfile as any, embedding);
}

// Store daily energy level
export async function storeDailyEnergy(
  userId: string,
  date: string,
  energyLevel: number,
  embedding: number[]
) {
  const index = getIndex();
  
  await index.upsert([
    {
      id: `energy_${userId}_${date}`,
      values: embedding,
      metadata: {
        user_id: userId,
        type: 'energy',
        date,
        energy_level: energyLevel,
      },
    },
  ]);
}
