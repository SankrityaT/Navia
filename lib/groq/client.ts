// BACKEND: Groq AI client for fast chat completions
// TODO: Add error handling and retry logic
// TODO: Implement function calling with Groq

import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

export const getGroqClient = () => {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });
  }
  return groqClient;
};

// Chat completion with Groq (10x faster than GPT-4)
export async function groqChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = 'llama-3.1-70b-versatile'
) {
  const client = getGroqClient();
  
  const response = await client.chat.completions.create({
    model,
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 1024,
  });

  return response.choices[0];
}

// Streaming chat (super fast with Groq!)
export async function groqStreamChat(
  messages: Array<{ role: string; content: string }>,
  onChunk: (text: string) => void,
  model: string = 'llama-3.1-70b-versatile'
) {
  const client = getGroqClient();
  
  const stream = await client.chat.completions.create({
    model,
    messages: messages as any,
    stream: true,
    temperature: 0.7,
    max_tokens: 1024,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) onChunk(content);
  }
}

// Available Groq models
export const GROQ_MODELS = {
  LLAMA_70B: 'llama-3.1-70b-versatile', // Best balance - recommended
  LLAMA_8B: 'llama-3.1-8b-instant', // Fastest
  MIXTRAL: 'mixtral-8x7b-32768', // Long context
};
