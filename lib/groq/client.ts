// BACKEND: Groq AI client for fast chat completions with multi-agent support
// Updated to use llama-4-scout for multi-agent orchestration

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

// Available Groq models
export const GROQ_MODELS = {
  LLAMA_4_SCOUT: 'meta-llama/llama-4-scout-17b-16e-instruct', // Llama 4 Scout - optimized for speed and efficiency
  LLAMA_8B_INSTANT: 'llama-3.1-8b-instant', // Ultra-fast, lower token usage - use for simple operations
  LLAMA_70B_FALLBACK: 'llama-3.1-70b-versatile', // Older but stable
  MIXTRAL: 'mixtral-8x7b-32768', // Long context alternative
};

interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

// Chat completion with Groq (10x faster than GPT-4)
export async function groqChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options: ChatCompletionOptions = {}
) {
  const {
    model = GROQ_MODELS.LLAMA_4_SCOUT,
    temperature = 0.7,
    max_tokens = 8192, // Increased from 2048 to allow complete responses (lists, breakdowns, etc.)
    response_format,
  } = options;

  const client = getGroqClient();
  
  try {
  const response = await client.chat.completions.create({
    model,
    messages: messages as any,
      temperature,
      max_tokens,
      ...(response_format && { response_format }),
  });

  return response.choices[0];
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}

// Structured JSON output with Groq
export async function groqStructuredOutput(
  messages: Array<{ role: string; content: string }>,
  options: ChatCompletionOptions = {}
) {
  return groqChatCompletion(messages, {
    ...options,
    response_format: { type: 'json_object' },
  });
}

// Streaming chat (super fast with Groq!)
export async function groqStreamChat(
  messages: Array<{ role: string; content: string }>,
  onChunk: (text: string) => void,
  options: ChatCompletionOptions = {}
) {
  const {
    model = GROQ_MODELS.LLAMA_4_SCOUT,
    temperature = 0.7,
    max_tokens = 8192, // Increased from 2048 to match groqChatCompletion
  } = options;

  const client = getGroqClient();
  
  try {
  const stream = await client.chat.completions.create({
    model,
    messages: messages as any,
    stream: true,
      temperature,
      max_tokens,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) onChunk(content);
  }
  } catch (error) {
    console.error('Groq streaming error:', error);
    throw error;
  }
}
