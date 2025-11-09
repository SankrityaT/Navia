// BACKEND: Pinecone client initialization
// TODO: Configure Pinecone index with proper dimensions (1536 for OpenAI embeddings)
// TODO: Set up metadata filtering for user_id, date, priority, status, category

import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;

export const getPineconeClient = () => {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
};

export const getIndex = () => {
  const client = getPineconeClient();
  return client.index(process.env.PINECONE_INDEX_NAME!);
};
