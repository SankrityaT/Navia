// BACKEND: Peer matching operations
// TODO: Implement sophisticated scoring algorithm
// TODO: Add filtering by location, availability
// TODO: Cache match results

import { getIndex } from './client';
import { PeerProfile, PeerMatch } from '../types';
import { generateEmbedding } from '../embeddings/client';

// Store peer profile in Pinecone
export async function storePeerProfile(profile: PeerProfile, embedding: number[]) {
  const index = getIndex();
  
  await index.upsert([
    {
      id: `peer_${profile.user_id}`,
      values: embedding,
      metadata: {
        type: 'peer_profile',
        ...profile,
      } as any,
    },
  ]);
}

// Find matching peers using similarity search
export async function findPeerMatches(
  userId: string,
  userProfile: PeerProfile,
  topK: number = 10
): Promise<PeerMatch[]> {
  const index = getIndex();
  
  // Create embedding from user's struggles and interests
  const queryText = `${userProfile.current_struggles.join(' ')} ${userProfile.interests.join(' ')} ${userProfile.career_field || ''}`;
  const embedding = await generateEmbedding(queryText);
  
  // Query Pinecone for similar peers
  const results = await index.query({
    vector: embedding,
    filter: {
      type: { $eq: 'peer_profile' },
      user_id: { $ne: userId }, // Exclude self
    },
    topK,
    includeMetadata: true,
  });
  
  // Score and rank matches
  const matches: PeerMatch[] = results.matches.map((match) => {
    const peer = match.metadata as unknown as PeerProfile;
    const score = calculateMatchScore(userProfile, peer, match.score || 0);
    const matchReasons = getMatchReasons(userProfile, peer);
    
    return {
      peer,
      score,
      matchReasons,
    };
  });
  
  return matches.sort((a, b) => b.score - a.score);
}

// Calculate match score based on multiple factors
function calculateMatchScore(user: PeerProfile, peer: PeerProfile, vectorScore: number): number {
  let score = vectorScore * 40; // Vector similarity: 0-40 points
  
  // Similar struggles: 0-30 points
  const sharedStruggles = user.current_struggles.filter(s => 
    peer.current_struggles.includes(s)
  );
  score += (sharedStruggles.length / Math.max(user.current_struggles.length, 1)) * 30;
  
  // Similar neurotype: 0-20 points
  const sharedNeurotype = user.neurotype.filter(n => peer.neurotype.includes(n));
  if (sharedNeurotype.length > 0) {
    score += 20;
  }
  
  // Shared interests: 0-10 points
  const sharedInterests = user.interests.filter(i => peer.interests.includes(i));
  score += (sharedInterests.length / Math.max(user.interests.length, 1)) * 10;
  
  return Math.min(score, 100);
}

// Get human-readable match reasons
function getMatchReasons(user: PeerProfile, peer: PeerProfile): string[] {
  const reasons: string[] = [];
  
  const sharedStruggles = user.current_struggles.filter(s => 
    peer.current_struggles.includes(s)
  );
  if (sharedStruggles.length > 0) {
    reasons.push(`Both navigating: ${sharedStruggles.join(', ')}`);
  }
  
  const sharedNeurotype = user.neurotype.filter(n => peer.neurotype.includes(n));
  if (sharedNeurotype.length > 0) {
    reasons.push(`Shared experience: ${sharedNeurotype.join(', ')}`);
  }
  
  const sharedInterests = user.interests.filter(i => peer.interests.includes(i));
  if (sharedInterests.length > 0) {
    reasons.push(`Common interests: ${sharedInterests.join(', ')}`);
  }
  
  if (user.career_field && peer.career_field === user.career_field) {
    reasons.push(`Same career field: ${user.career_field}`);
  }
  
  return reasons;
}
