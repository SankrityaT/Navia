// BACKEND: Brain dump retrieval operations from Pinecone
// Retrieves brain dump memories for memory recall queries

import { getIndex } from './client';
import { generateEmbedding } from '../embeddings/client';

export interface BrainDumpMemory {
  content: string;
  timestamp: string;
  extracted_items: any[] | null;
  patterns: string[] | null;
  score: number;
}

/**
 * Retrieve brain dump memories from Pinecone
 * Queries user's namespace with filters for type and userId
 */
export async function getBrainDumpMemories(
  userId: string,
  query: string,
  topK: number = 10
): Promise<BrainDumpMemory[]> {
  try {
    if (!userId || !query) {
      return [];
    }

    const queryEmbedding = await generateEmbedding(query);
    const index = getIndex();
    const namespace = index.namespace(`user-${userId}`);

    const queryResponse = await namespace.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter: {
        type: 'brain_dump',
        userId: { $eq: userId },
      },
    });

    const memories: BrainDumpMemory[] = queryResponse.matches.map((match: any) => ({
      content: match.metadata?.content || '',
      timestamp: match.metadata?.timestamp || '',
      extracted_items: match.metadata?.extracted_items 
        ? (typeof match.metadata.extracted_items === 'string' 
            ? JSON.parse(match.metadata.extracted_items) 
            : match.metadata.extracted_items)
        : null,
      patterns: match.metadata?.patterns
        ? (typeof match.metadata.patterns === 'string'
            ? JSON.parse(match.metadata.patterns)
            : match.metadata.patterns)
        : null,
      score: match.score || 0,
    }));

    return memories;
  } catch (error) {
    console.error('Error retrieving brain dump memories:', error);
    return [];
  }
}

