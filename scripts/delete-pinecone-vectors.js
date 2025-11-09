// scripts/delete-pinecone-vectors.js
// Utility script to wipe every vector from the configured Pinecone index

const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local'), override: true });

async function deleteAllVectors() {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error('Missing PINECONE_API_KEY in environment');
  }

  const indexName = process.env.PINECONE_INDEX || process.env.PINECONE_INDEX_NAME;
  if (!indexName) {
    throw new Error('Missing PINECONE_INDEX or PINECONE_INDEX_NAME in environment');
  }

  const { Pinecone } = await import('@pinecone-database/pinecone');
  const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = client.Index(indexName);

  console.log(`Deleting every vector in index "${indexName}"...`);
  await index.deleteMany({ deleteAll: true });
  console.log('✅ All vectors deleted.');
}

deleteAllVectors().catch((err) => {
  console.error('Failed to delete vectors:', err);
  process.exit(1);
});
