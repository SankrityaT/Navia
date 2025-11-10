// AI-Generated Task Storage System
// Captures and stores tasks created by AI agents (Finance, Career, Daily Task)

import { v4 as uuidv4 } from 'uuid';

export interface AIGeneratedTask {
  task_id: string; // UUID v4
  user_id: string;
  domain: 'finance' | 'career' | 'daily_task';
  title: string;
  breakdown: string[];
  summary: string;
  complexity: number;
  created_at: string;
  created_by_agent: string; // 'finance_agent', 'career_agent', 'daily_task_agent'
  original_query: string;
  status: 'not_started' | 'in_progress' | 'completed';
  resources?: Array<{
    title: string;
    url: string;
    description: string;
    type: string;
  }>;
  sources?: Array<{
    title: string;
    url?: string;
    excerpt: string;
  }>;
  metadata?: {
    confidence?: number;
    estimatedTime?: string;
    tips?: string[];
    [key: string]: any;
  };
}

// In-memory storage (can be replaced with Redis or database later)
class AITaskStore {
  private tasks: Map<string, AIGeneratedTask[]> = new Map();

  /**
   * Store a new AI-generated task
   */
  async storeTask(task: AIGeneratedTask): Promise<string> {
    const userId = task.user_id;
    
    if (!this.tasks.has(userId)) {
      this.tasks.set(userId, []);
    }

    const userTasks = this.tasks.get(userId)!;
    userTasks.unshift(task); // Add to beginning (most recent first)

    // Keep only last 100 tasks per user to prevent memory bloat
    if (userTasks.length > 100) {
      userTasks.pop();
    }

    console.log(`📝 AI Task stored: ${task.task_id} (${task.domain}) for user ${userId}`);
    return task.task_id;
  }

  /**
   * Get all tasks for a user
   */
  async getUserTasks(userId: string): Promise<AIGeneratedTask[]> {
    return this.tasks.get(userId) || [];
  }

  /**
   * Get tasks by domain
   */
  async getTasksByDomain(
    userId: string,
    domain: 'finance' | 'career' | 'daily_task'
  ): Promise<AIGeneratedTask[]> {
    const userTasks = this.tasks.get(userId) || [];
    return userTasks.filter((task) => task.domain === domain);
  }

  /**
   * Get a specific task by ID
   */
  async getTaskById(userId: string, taskId: string): Promise<AIGeneratedTask | null> {
    const userTasks = this.tasks.get(userId) || [];
    return userTasks.find((task) => task.task_id === taskId) || null;
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    userId: string,
    taskId: string,
    status: 'not_started' | 'in_progress' | 'completed'
  ): Promise<boolean> {
    const userTasks = this.tasks.get(userId);
    if (!userTasks) return false;

    const task = userTasks.find((t) => t.task_id === taskId);
    if (!task) return false;

    task.status = status;
    console.log(`✅ Task ${taskId} status updated to: ${status}`);
    return true;
  }

  /**
   * Delete a task
   */
  async deleteTask(userId: string, taskId: string): Promise<boolean> {
    const userTasks = this.tasks.get(userId);
    if (!userTasks) return false;

    const index = userTasks.findIndex((t) => t.task_id === taskId);
    if (index === -1) return false;

    userTasks.splice(index, 1);
    console.log(`🗑️ Task ${taskId} deleted`);
    return true;
  }

  /**
   * Get task statistics for a user
   */
  async getTaskStats(userId: string) {
    const userTasks = this.tasks.get(userId) || [];

    return {
      total: userTasks.length,
      byDomain: {
        finance: userTasks.filter((t) => t.domain === 'finance').length,
        career: userTasks.filter((t) => t.domain === 'career').length,
        daily_task: userTasks.filter((t) => t.domain === 'daily_task').length,
      },
      byStatus: {
        not_started: userTasks.filter((t) => t.status === 'not_started').length,
        in_progress: userTasks.filter((t) => t.status === 'in_progress').length,
        completed: userTasks.filter((t) => t.status === 'completed').length,
      },
      recent: userTasks.slice(0, 5),
    };
  }

  /**
   * Clear all tasks for a user (for testing)
   */
  async clearUserTasks(userId: string): Promise<void> {
    this.tasks.delete(userId);
  }

  /**
   * Get all users with tasks (for admin/debugging)
   */
  async getAllUsers(): Promise<string[]> {
    return Array.from(this.tasks.keys());
  }
}

// Singleton instance
const aiTaskStore = new AITaskStore();
export default aiTaskStore;

/**
 * Helper: Create task from agent response
 */
export function createTaskFromAgentResponse(
  userId: string,
  domain: 'finance' | 'career' | 'daily_task',
  agentResponse: {
    summary: string;
    breakdown?: string[];
    resources?: any[];
    sources?: any[];
    metadata?: any;
  },
  originalQuery: string
): AIGeneratedTask {
  const taskId = uuidv4();
  const agentName = `${domain}_agent`;

  // Extract title from query or summary
  const title = extractTitle(originalQuery, agentResponse.summary);

  return {
    task_id: taskId,
    user_id: userId,
    domain,
    title,
    breakdown: agentResponse.breakdown || [],
    summary: agentResponse.summary,
    complexity: agentResponse.metadata?.complexity || 5,
    created_at: new Date().toISOString(),
    created_by_agent: agentName,
    original_query: originalQuery,
    status: 'not_started',
    resources: agentResponse.resources,
    sources: agentResponse.sources,
    metadata: {
      confidence: agentResponse.metadata?.confidence,
      estimatedTime: agentResponse.metadata?.estimatedTime,
      tips: agentResponse.metadata?.tips,
      needsBreakdown: agentResponse.metadata?.needsBreakdown,
    },
  };
}

/**
 * Extract a concise title from query and summary
 */
function extractTitle(query: string, summary: string): string {
  // Remove common question words and trim
  const cleaned = query
    .replace(/^(help me|how do i|how to|can you|please|i need to|i want to)/gi, '')
    .trim();

  // Take first sentence or first 60 characters
  const firstSentence = cleaned.split(/[.!?]/)[0];
  const title = firstSentence.length > 60 
    ? firstSentence.substring(0, 57) + '...'
    : firstSentence;

  // Capitalize first letter
  return title.charAt(0).toUpperCase() + title.slice(1);
}

/**
 * Auto-store task if agent generated a breakdown
 * Stores in both in-memory store AND Pinecone for dashboard/task page visibility
 */
export async function autoStoreTaskIfNeeded(
  userId: string,
  domain: 'finance' | 'career' | 'daily_task',
  agentResponse: any,
  originalQuery: string
): Promise<string | null> {
  // Only store if there's a breakdown (indicating actionable steps)
  if (!agentResponse.breakdown || agentResponse.breakdown.length === 0) {
    return null;
  }

  const task = createTaskFromAgentResponse(
    userId,
    domain,
    agentResponse,
    originalQuery
  );

  // Store in memory (for backward compatibility)
  const taskId = await aiTaskStore.storeTask(task);
  
  // Also store in Pinecone so it appears on dashboard and tasks page
  try {
    const { storeTask } = await import('@/lib/pinecone/operations');
    const { generateEmbedding } = await import('@/lib/embeddings/client');
    
    // Convert AI task to Pinecone Task format
    const pineconeTask = {
      user_id: userId,
      task_id: task.task_id,
      title: task.title,
      status: task.status as 'not_started' | 'in_progress' | 'completed',
      priority: 'medium' as const, // Default priority for AI tasks
      time_estimate: estimateTimeFromBreakdown(task.breakdown),
      category: mapDomainToCategory(domain),
      created_by: 'ai',
      created_at: task.created_at,
      description: task.summary,
      breakdown: task.breakdown,
    };
    
    // Generate embedding for the task
    const taskText = `Task: ${pineconeTask.title}, category: ${pineconeTask.category}, priority: ${pineconeTask.priority}. ${pineconeTask.description}`;
    const embedding = await generateEmbedding(taskText);
    
    // Store in Pinecone
    await storeTask(pineconeTask, embedding);
    
    console.log(`✅ AI task stored in both memory and Pinecone: ${taskId}`);
  } catch (error) {
    console.error('Failed to store AI task in Pinecone:', error);
    // Don't fail if Pinecone storage fails - task is still in memory
  }
  
  return taskId;
}

/**
 * Map AI domain to task category
 */
function mapDomainToCategory(domain: 'finance' | 'career' | 'daily_task'): 'finance' | 'career' | 'daily_life' {
  if (domain === 'daily_task') return 'daily_life';
  return domain;
}

/**
 * Estimate time based on number of breakdown steps
 */
function estimateTimeFromBreakdown(breakdown: string[]): number {
  // Rough estimate: 15 minutes per step, capped at 120 minutes
  const estimate = breakdown.length * 15;
  return Math.min(estimate, 120);
}

