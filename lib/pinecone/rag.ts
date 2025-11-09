// Pinecone: RAG (Retrieval-Augmented Generation) operations
// Retrieves relevant knowledge sources with metadata filtering

import { getIndex } from './client';
import { generateEmbedding } from '../embeddings/client';

export interface KnowledgeSource {
  id: string;
  content: string;
  title: string;
  url?: string;
  category: 'finance' | 'career' | 'task' | 'general';
  tags: string[];
  sourceType: 'article' | 'guide' | 'tool' | 'template' | 'resource';
  score?: number;
  metadata?: Record<string, any>;
}

export interface RAGQueryOptions {
  category?: 'finance' | 'career' | 'task' | 'general';
  tags?: string[];
  sourceType?: string;
  minScore?: number;
  limit?: number;
}

/**
 * Generate a unique ID for a knowledge source
 */
function generateSourceId(category: string, title: string): string {
  const timestamp = Date.now();
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50);
  return `${category}_${cleanTitle}_${timestamp}`;
}

/**
 * Store a knowledge source in Pinecone
 */
export async function storeKnowledgeSource(
  content: string,
  metadata: {
    title: string;
    url?: string;
    category: 'finance' | 'career' | 'task' | 'general';
    tags?: string[];
    sourceType?: 'article' | 'guide' | 'tool' | 'template' | 'resource';
    [key: string]: any;
  }
): Promise<string> {
  try {
    const index = getIndex();

    // Create embedding for the content
    const vector = await generateEmbedding(content);
    const sourceId = generateSourceId(metadata.category, metadata.title);

    // Store in Pinecone with metadata (destructure to avoid duplicates)
    const { title, url, category, tags, sourceType, ...otherMetadata } = metadata;
    
    await index.upsert([
      {
        id: sourceId,
        values: vector,
        metadata: {
          content: content.substring(0, 1000), // Store preview
          title,
          url: url || '',
          category,
          tags: tags?.join(',') || '',
          sourceType: sourceType || 'article',
          timestamp: Date.now(),
          ...otherMetadata,
        },
      },
    ]);

    console.log(`Stored knowledge source: ${metadata.title} (${metadata.category})`);
    return sourceId;
  } catch (error) {
    console.error('Error storing knowledge source:', error);
    throw error;
  }
}

/**
 * Retrieve relevant sources using semantic search with metadata filtering
 */
export async function retrieveRelevantSources(
  query: string,
  options: RAGQueryOptions = {}
): Promise<KnowledgeSource[]> {
  try {
    const {
      category,
      tags,
      sourceType,
      minScore = 0.7,
      limit = 5,
    } = options;

    const index = getIndex();

    // Create embedding for the query
    const vector = await generateEmbedding(query);

    // Build metadata filter
    const filter: any = {};
    if (category) {
      filter.category = category;
    }
    if (sourceType) {
      filter.sourceType = sourceType;
    }

    // Query Pinecone
    const queryResponse = await index.query({
      vector,
      topK: limit * 2, // Get more than needed to filter by score
      includeMetadata: true,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    });

    // Process and filter results
    const sources = queryResponse.matches
      .filter((match) => match.score && match.score >= minScore)
      .map((match) => {
        if (!match.metadata) return null;

        const sourceTags = match.metadata.tags
          ? (match.metadata.tags as string).split(',').filter(Boolean)
          : [];

        // Additional tag filtering if specified
        if (tags && tags.length > 0) {
          const hasMatchingTag = tags.some((tag) =>
            sourceTags.some((sourceTag) => sourceTag.toLowerCase().includes(tag.toLowerCase()))
          );
          if (!hasMatchingTag) return null;
        }

        return {
          id: match.id,
          content: match.metadata.content as string,
          title: match.metadata.title as string,
          url: match.metadata.url as string | undefined,
          category: match.metadata.category as 'finance' | 'career' | 'task' | 'general',
          tags: sourceTags,
          sourceType: match.metadata.sourceType as KnowledgeSource['sourceType'],
          score: match.score,
          metadata: match.metadata,
        };
      })
      .filter((source) => source !== null)
      .slice(0, limit);

    return sources;
  } catch (error) {
    console.error('Error retrieving relevant sources:', error);
    return [];
  }
}

/**
 * Retrieve sources specifically for finance questions
 */
export async function retrieveFinanceSources(
  query: string,
  limit: number = 5
): Promise<KnowledgeSource[]> {
  return retrieveRelevantSources(query, {
    category: 'finance',
    limit,
    minScore: 0.65,
  });
}

/**
 * Retrieve sources specifically for career questions
 */
export async function retrieveCareerSources(
  query: string,
  limit: number = 5
): Promise<KnowledgeSource[]> {
  return retrieveRelevantSources(query, {
    category: 'career',
    limit,
    minScore: 0.65,
  });
}

/**
 * Retrieve sources specifically for task/productivity questions
 */
export async function retrieveTaskSources(
  query: string,
  limit: number = 5
): Promise<KnowledgeSource[]> {
  return retrieveRelevantSources(query, {
    category: 'task',
    limit,
    minScore: 0.65,
  });
}

/**
 * Bulk store multiple knowledge sources
 */
export async function bulkStoreKnowledgeSources(
  sources: Array<{
    content: string;
    metadata: Parameters<typeof storeKnowledgeSource>[1];
  }>
): Promise<string[]> {
  const ids: string[] = [];

  for (const source of sources) {
    try {
      const id = await storeKnowledgeSource(source.content, source.metadata);
      ids.push(id);
    } catch (error) {
      console.error(`Error storing source "${source.metadata.title}":`, error);
    }
  }

  return ids;
}

/**
 * Search for sources by title or tags (without embedding)
 */
export async function searchSourcesByMetadata(
  searchTerm: string,
  category?: 'finance' | 'career' | 'task' | 'general'
): Promise<KnowledgeSource[]> {
  try {
    const index = getIndex();
    
    // Use a zero vector for metadata-only search
    const zeroVector = new Array(1024).fill(0);

    const filter: any = {};
    if (category) {
      filter.category = category;
    }

    const queryResponse = await index.query({
      vector: zeroVector,
      topK: 50,
      includeMetadata: true,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    });

    const lowerSearchTerm = searchTerm.toLowerCase();

    // Filter results by title or tags containing search term
    const sources = queryResponse.matches
      .map((match) => {
        if (!match.metadata) return null;

        const title = (match.metadata.title as string).toLowerCase();
        const tags = match.metadata.tags as string;

        if (!title.includes(lowerSearchTerm) && !tags.includes(lowerSearchTerm)) {
          return null;
        }

        return {
          id: match.id,
          content: match.metadata.content as string,
          title: match.metadata.title as string,
          url: match.metadata.url as string | undefined,
          category: match.metadata.category as 'finance' | 'career' | 'task' | 'general',
          tags: tags.split(',').filter(Boolean),
          sourceType: match.metadata.sourceType as KnowledgeSource['sourceType'],
          metadata: match.metadata,
        };
      })
      .filter((source) => source !== null);

    return sources;
  } catch (error) {
    console.error('Error searching sources by metadata:', error);
    return [];
  }
}

/**
 * Delete a knowledge source by ID
 */
export async function deleteKnowledgeSource(sourceId: string): Promise<void> {
  try {
    const index = getIndex();
    await index.deleteOne(sourceId);
    console.log(`Deleted knowledge source: ${sourceId}`);
  } catch (error) {
    console.error('Error deleting knowledge source:', error);
    throw error;
  }
}

/**
 * Update a knowledge source
 */
export async function updateKnowledgeSource(
  sourceId: string,
  content: string,
  metadata: Partial<Parameters<typeof storeKnowledgeSource>[1]>
): Promise<void> {
  try {
    // Delete old and create new (Pinecone doesn't support true updates)
    await deleteKnowledgeSource(sourceId);
    await storeKnowledgeSource(content, metadata as any);
  } catch (error) {
    console.error('Error updating knowledge source:', error);
    throw error;
  }
}

