// BACKEND: Pinecone client initialization
// Configured for 1024 dimensions (Pinecone multilingual-e5-large embeddings)
// Metadata filtering enabled for user_id, date, priority, status, category

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
