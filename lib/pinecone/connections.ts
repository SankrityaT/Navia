// BACKEND: Peer connection management (MVP)
// Handles connection requests, messages, and check-ins

import { getIndex } from './client';
import { PeerConnection, PeerMessage, CheckIn } from '../types';

// Create a connection request
export async function createConnectionRequest(
  initiatorId: string,
  targetId: string
): Promise<PeerConnection> {
  const index = getIndex();
  
  const connection: PeerConnection = {
    connection_id: `conn_${Date.now()}_${initiatorId}_${targetId}`,
    user1_id: initiatorId,
    user2_id: targetId,
    status: 'pending',
    initiated_by: initiatorId,
    created_at: new Date().toISOString(),
  };
  
  await index.upsert([
    {
      id: connection.connection_id,
      values: new Array(1536).fill(0), // Dummy vector for metadata storage
      metadata: {
        type: 'peer_connection',
        ...connection,
      } as any,
    },
  ]);
  
  return connection;
}

// Accept a connection request
export async function acceptConnection(
  connectionId: string,
  user1Goals: string[],
  user2Goals: string[]
): Promise<void> {
  const index = getIndex();
  
  // Fetch existing connection
  const result = await index.fetch([connectionId]);
  const existing = result.records[connectionId];
  
  if (!existing) {
    throw new Error('Connection not found');
  }
  
  // Update to active with goals
  await index.upsert([
    {
      id: connectionId,
      values: existing.values,
      metadata: {
        ...existing.metadata,
        status: 'active',
        accepted_at: new Date().toISOString(),
        goals: {
          user1_goals: user1Goals,
          user2_goals: user2Goals,
        },
      } as any,
    },
  ]);
}

// Get user's connections
export async function getUserConnections(userId: string): Promise<PeerConnection[]> {
  const index = getIndex();
  
  // Query for connections where user is either user1 or user2
  const results = await index.query({
    vector: new Array(1536).fill(0),
    filter: {
      type: { $eq: 'peer_connection' },
      $or: [
        { user1_id: { $eq: userId } },
        { user2_id: { $eq: userId } },
      ],
    },
    topK: 100,
    includeMetadata: true,
  });
  
  return results.matches.map((match) => match.metadata as unknown as PeerConnection);
}

// Store a message
export async function storeMessage(message: PeerMessage): Promise<void> {
  const index = getIndex();
  
  await index.upsert([
    {
      id: message.message_id,
      values: new Array(1536).fill(0),
      metadata: {
        type: 'peer_message',
        ...message,
      } as any,
    },
  ]);
}

// Get messages for a connection
export async function getMessages(connectionId: string, limit: number = 50): Promise<PeerMessage[]> {
  const index = getIndex();
  
  const results = await index.query({
    vector: new Array(1536).fill(0),
    filter: {
      type: { $eq: 'peer_message' },
      connection_id: { $eq: connectionId },
    },
    topK: limit,
    includeMetadata: true,
  });
  
  const messages = results.matches.map((match) => match.metadata as unknown as PeerMessage);
  
  // Sort by timestamp (newest first from Pinecone, reverse for chat display)
  return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// Store a check-in
export async function storeCheckIn(checkIn: CheckIn): Promise<void> {
  const index = getIndex();
  
  await index.upsert([
    {
      id: checkIn.checkin_id,
      values: new Array(1536).fill(0),
      metadata: {
        type: 'peer_checkin',
        ...checkIn,
      } as any,
    },
  ]);
}

// Get recent check-ins for a connection
export async function getCheckIns(connectionId: string, limit: number = 10): Promise<CheckIn[]> {
  const index = getIndex();
  
  const results = await index.query({
    vector: new Array(1536).fill(0),
    filter: {
      type: { $eq: 'peer_checkin' },
      connection_id: { $eq: connectionId },
    },
    topK: limit,
    includeMetadata: true,
  });
  
  const checkIns = results.matches.map((match) => match.metadata as unknown as CheckIn);
  
  return checkIns.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
