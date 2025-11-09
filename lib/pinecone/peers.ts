// BACKEND: Research-optimized peer matching operations
// Based on near-peer mentoring research (Synapse 2025, CARA studies)
// Scoring: Shared struggles (40%), Neurotype (20%), Interests (15%), 
//          Near-peer timing (15%), Complementary skills (10%)

import { getIndex } from './client';
import { PeerProfile, PeerMatch } from '../types';
import { generateEmbedding } from '../openai/client';

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

// Calculate match score based on research-backed factors
// Research shows: shared struggles + near-peer timing = highest effectiveness
function calculateMatchScore(user: PeerProfile, peer: PeerProfile, vectorScore: number): number {
  let score = 0;
  
  // 1. Shared struggles: 0-40 points (PRIMARY - research shows this is most important)
  const sharedStruggles = user.current_struggles.filter(s => 
    peer.current_struggles.includes(s)
  );
  const struggleScore = (sharedStruggles.length / Math.max(user.current_struggles.length, 1)) * 40;
  score += struggleScore;
  
  // 2. Similar neurotype: 0-20 points (reduces masking, creates safe space)
  const sharedNeurotype = user.neurotype.filter(n => peer.neurotype.includes(n));
  const neurotypeScore = (sharedNeurotype.length / Math.max(user.neurotype.length, 1)) * 20;
  score += neurotypeScore;
  
  // 3. Shared interests: 0-15 points (social connectedness)
  const sharedInterests = user.interests.filter(i => peer.interests.includes(i));
  const interestScore = (sharedInterests.length / Math.max(user.interests.length, 1)) * 15;
  score += interestScore;
  
  // 4. Near-peer timing: 0-15 points (1-3 years apart is ideal per research)
  const monthsDiff = Math.abs(user.months_post_grad - peer.months_post_grad);
  let timingScore = 0;
  if (monthsDiff <= 12) {
    timingScore = 15; // 0-1 year apart: perfect
  } else if (monthsDiff <= 24) {
    timingScore = 12; // 1-2 years apart: great
  } else if (monthsDiff <= 36) {
    timingScore = 8; // 2-3 years apart: good
  } else if (monthsDiff <= 48) {
    timingScore = 4; // 3-4 years apart: okay
  }
  score += timingScore;
  
  // 5. Complementary skills: 0-10 points (reciprocal support)
  // User needs what peer offers, and vice versa
  const userNeedsPeerOffers = user.seeking.filter(need => 
    peer.offers.includes(need)
  );
  const peerNeedsUserOffers = peer.seeking.filter(need => 
    user.offers.includes(need)
  );
  const complementaryScore = (
    (userNeedsPeerOffers.length / Math.max(user.seeking.length, 1)) * 5 +
    (peerNeedsUserOffers.length / Math.max(peer.seeking.length, 1)) * 5
  );
  score += complementaryScore;
  
  return Math.min(Math.round(score), 100);
}

// Get human-readable match reasons (emphasize mutual support)
function getMatchReasons(user: PeerProfile, peer: PeerProfile): string[] {
  const reasons: string[] = [];
  
  // Near-peer timing (show first - establishes credibility)
  const monthsDiff = Math.abs(user.months_post_grad - peer.months_post_grad);
  if (monthsDiff <= 12) {
    reasons.push(`${peer.name} graduated around the same time—they get what you're going through`);
  } else if (monthsDiff <= 36) {
    const yearsDiff = Math.round(monthsDiff / 12);
    reasons.push(`${peer.name} is ${yearsDiff} year${yearsDiff > 1 ? 's' : ''} ahead—recently navigated similar challenges`);
  }
  
  // Shared struggles (primary connection point)
  const sharedStruggles = user.current_struggles.filter(s => 
    peer.current_struggles.includes(s)
  );
  if (sharedStruggles.length > 0) {
    const formatted = sharedStruggles.map(s => s.replace(/_/g, ' ')).join(', ');
    reasons.push(`Both working on: ${formatted}`);
  }
  
  // Complementary skills (mutual benefit)
  const userNeedsPeerOffers = user.seeking.filter(need => 
    peer.offers.includes(need)
  );
  const peerNeedsUserOffers = peer.seeking.filter(need => 
    user.offers.includes(need)
  );
  if (userNeedsPeerOffers.length > 0 && peerNeedsUserOffers.length > 0) {
    reasons.push(`You can help each other—mutual accountability partnership`);
  } else if (userNeedsPeerOffers.length > 0) {
    const formatted = userNeedsPeerOffers.map(s => s.replace(/_/g, ' ')).join(', ');
    reasons.push(`${peer.name} can help with: ${formatted}`);
  }
  
  // Shared neurotype (safe space)
  const sharedNeurotype = user.neurotype.filter(n => peer.neurotype.includes(n));
  if (sharedNeurotype.length > 0) {
    reasons.push(`Safe space: both ${sharedNeurotype.join(' & ')}—no masking required`);
  }
  
  // Shared interests (social connection)
  const sharedInterests = user.interests.filter(i => peer.interests.includes(i));
  if (sharedInterests.length > 0) {
    reasons.push(`Common interests: ${sharedInterests.slice(0, 3).join(', ')}`);
  }
  
  // Career field
  if (user.career_field && peer.career_field === user.career_field) {
    reasons.push(`Both in ${user.career_field}`);
  }
  
  return reasons;
}
