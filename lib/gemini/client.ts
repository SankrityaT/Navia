// Gemini AI client for handling some AI workload
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const GEMINI_MODELS = {
  FLASH: 'gemini-1.5-flash', // Use base model name without version suffix
  PRO: 'gemini-1.5-pro', // Use base model name without version suffix
};

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export async function geminiChat(
  messages: Array<{ role: string; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
) {
  const {
    model = GEMINI_MODELS.FLASH,
    temperature = 0.7,
    maxTokens = 400,
  } = options;

  const geminiModel = genAI.getGenerativeModel({ model });

  // Convert messages to Gemini format
  const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
  const chatMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const chat = geminiModel.startChat({
    history: chatMessages.slice(0, -1) as any,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  // Add system prompt to the last user message
  const lastMessage = chatMessages[chatMessages.length - 1];
  const promptWithSystem = systemPrompt 
    ? `${systemPrompt}\n\nUser: ${lastMessage.parts[0].text}`
    : lastMessage.parts[0].text;

  const result = await chat.sendMessage(promptWithSystem);
}

export async function geminiStreamChat(
  messages: Array<{ role: string; content: string }>,
  onChunk: (text: string) => void,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
) {
  const {
    model = GEMINI_MODELS.FLASH,
    temperature = 0.7,
    maxTokens = 2048,
  } = options;

  try {
    const geminiModel = genAI.getGenerativeModel({ 
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    // Convert messages to Gemini format
    const geminiMessages: GeminiMessage[] = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Separate system message if present
    const history = geminiMessages.slice(0, -1);
    const lastMessage = geminiMessages[geminiMessages.length - 1];

    const chat = geminiModel.startChat({
      history,
    });

    const result = await chat.sendMessageStream(lastMessage.parts[0].text);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      onChunk(chunkText);
    }
  } catch (error) {
    console.error('Gemini streaming error:', error);
    throw error;
  }
}
