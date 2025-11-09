// Embedding Generation using Pinecone Inference API
// Pinecone provides embeddings without needing OpenAI

import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;

function getPineconeClient(): Pinecone {
  if (!pineconeClient && process.env.PINECONE_API_KEY) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return pineconeClient!;
}

/**
 * Generate a deterministic embedding from text (fallback method)
 * Creates a 1024-dimensional vector based on text content
 */
function generateDeterministicEmbedding(text: string): number[] {
  const dimension = 1024;
  const vector = new Array(dimension).fill(0);
  
  // Simple hash-based embedding generation
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const index = (charCode * (i + 1)) % dimension;
    vector[index] += Math.sin(charCode * 0.1) * 0.1;
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
}

/**
 * Generate embeddings using Pinecone Inference API via SDK
 * Falls back to deterministic embeddings if API fails
 * Uses multilingual-e5-large model (1024 dimensions)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Check if Pinecone API key is configured
  if (!process.env.PINECONE_API_KEY) {
    console.warn('Pinecone API key not configured, using fallback embeddings');
    return generateDeterministicEmbedding(text);
  }

  try {
    const pc = getPineconeClient();
    
    // Use Pinecone's inference.embed method
    const result = await pc.inference.embed(
      'multilingual-e5-large',
      [text],
      { inputType: 'passage' }
    );

    // Handle Pinecone SDK response format
    const embeddings = Array.isArray(result) ? result : result?.data || [];
    if (embeddings.length > 0 && embeddings[0]?.values) {
      return embeddings[0].values;
    }

    throw new Error('No embedding returned from Pinecone');
  } catch (error: any) {
    console.error('Pinecone embedding error:', error?.message || error);
    console.warn('Falling back to deterministic embeddings');
    return generateDeterministicEmbedding(text);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // Check if Pinecone API key is configured
  if (!process.env.PINECONE_API_KEY) {
    console.warn('Pinecone API key not configured, using fallback embeddings');
    return texts.map(text => generateDeterministicEmbedding(text));
  }

  try {
    const pc = getPineconeClient();
    
    // Use Pinecone's inference.embed method for batch
    const result = await pc.inference.embed(
      'multilingual-e5-large',
      texts,
      { inputType: 'passage' }
    );

    // Handle Pinecone SDK response format
    const embeddings = Array.isArray(result) ? result : result?.data || [];
    if (embeddings.length > 0) {
      return embeddings.map(r => r.values);
    }

    throw new Error('No embeddings returned from Pinecone');
  } catch (error: any) {
    console.error('Pinecone batch embedding error:', error?.message || error);
    console.warn('Falling back to deterministic embeddings for batch');
    return texts.map(text => generateDeterministicEmbedding(text));
  }
}

