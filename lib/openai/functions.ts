// BACKEND: OpenAI function definitions for tool calling
// TODO: Implement actual function execution logic
// TODO: Add more functions as needed

export const BREAK_DOWN_TASK_FUNCTION = {
  name: 'break_down_task',
  description: 'Breaks down a complex task into micro-steps tailored to user\'s executive function profile. Creates tasks in Task Visualizer.',
  parameters: {
    type: 'object',
    properties: {
      task_description: {
        type: 'string',
        description: 'The high-level task user wants to accomplish',
      },
      category: {
        type: 'string',
        enum: ['career', 'finance', 'daily_life', 'social'],
        description: 'Which area this task belongs to',
      },
      estimated_total_time: {
        type: 'integer',
        description: 'Rough estimate in minutes',
      },
    },
    required: ['task_description', 'category'],
  },
};

export const GET_REFERENCES_FUNCTION = {
  name: 'get_references',
  description: 'Retrieves relevant resources, templates, or information using RAG (Retrieval-Augmented Generation).',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'What information user needs',
      },
      category: {
        type: 'string',
        enum: ['career', 'finance', 'productivity', 'social'],
        description: 'Filter resources by category',
      },
      format: {
        type: 'string',
        enum: ['article', 'template', 'tool', 'tutorial'],
        description: 'Type of resource needed',
      },
    },
    required: ['query', 'category'],
  },
};

export const AVAILABLE_FUNCTIONS = [
  BREAK_DOWN_TASK_FUNCTION,
  GET_REFERENCES_FUNCTION,
];

// Function execution handlers
export async function executeBreakDownTask(
  args: { task_description: string; category: string; estimated_total_time?: number },
  userId: string,
  efProfile: string[]
) {
  // TODO: Call GPT-4 to generate breakdown
  // TODO: Store each step as task in Pinecone
  // TODO: Return task IDs and link
  
  return {
    success: true,
    task_count: 0,
    message: `I've broken down '${args.task_description}' into manageable steps. Check your Task Visualizer!`,
    link: '/tasks?view=kanban',
  };
}

export async function executeGetReferences(
  args: { query: string; category: string; format?: string },
  userId: string
) {
  // TODO: Query Pinecone knowledge base
  // TODO: Return relevant resources
  
  return {
    references: [],
    message: 'Here are some resources that might help:',
  };
}
