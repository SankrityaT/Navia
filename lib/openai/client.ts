// BACKEND: OpenAI client for embeddings and chat
// TODO: Implement function calling for task breakdown
// TODO: Add streaming support for chat responses
// TODO: Implement retry logic and rate limiting

import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export const getOpenAIClient = () => {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }
  return openaiClient;
};

// Generate embeddings for text using Pinecone Inference API
export async function generateEmbedding(text: string): Promise<number[]> {
  // Use Pinecone's inference API instead of OpenAI
  // This is faster, cheaper, and integrated with Pinecone
  const response = await fetch('https://api.pinecone.io/embed', {
    method: 'POST',
    headers: {
      'Api-Key': process.env.PINECONE_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-text-embed-v2',
      inputs: [{ text }],
    }),
  });

  const data = await response.json();
  return data.data[0].values; // Returns 1024-dimensional vector
}

// Alternative: OpenAI embeddings (if you prefer)
export async function generateEmbeddingOpenAI(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  
  const response = await client.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });

  return response.data[0].embedding;
}

// Chat completion with function calling
export async function chatCompletion(
  messages: Array<{ role: string; content: string }>,
  functions?: any[]
) {
  const client = getOpenAIClient();
  
  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: messages as any,
    functions,
    function_call: functions ? 'auto' : undefined,
  });

  return response.choices[0];
}
