// BACKEND: Research-optimized peer matching operations
// Based on near-peer mentoring research (Synapse 2025, CARA studies)
// Scoring: Shared struggles (40%), Neurotype (20%), Interests (15%), 
//          Near-peer timing (15%), Complementary skills (10%)

import { getIndex } from './client';
import { generateEmbedding } from '../embeddings/client';
import { generateAnonymousName } from '../utils/anonymousNames';
import { PeerProfile, PeerMatch } from '../types';

// Store peer profile in Pinecone
export async function storePeerProfile(profile: PeerProfile, embedding: number[]) {
  const index = getIndex();
  
  // Flatten nested objects for Pinecone metadata (only supports primitives and string arrays)
  const flatMetadata = {
    type: 'peer_profile',
    user_id: profile.user_id,
    name: profile.name,
    graduation_year: profile.graduation_year,
    months_post_grad: profile.months_post_grad,
    neurotype: profile.neurotype,
    current_struggles: profile.current_struggles,
    career_field: profile.career_field || '',
    location: profile.location || '',
    interests: profile.interests,
    seeking: profile.seeking,
    offers: profile.offers,
    availability: profile.availability || '',
    bio: profile.bio,
    // Flatten match_preferences
    similar_struggles: profile.match_preferences.similar_struggles,
    similar_neurotype: profile.match_preferences.similar_neurotype,
  };
  
  await index.upsert([
    {
      id: `peer_${profile.user_id}`,
      values: embedding,
      metadata: flatMetadata as any,
    },
  ]);
}

// Fetch user's peer profile from Pinecone
export async function getPeerProfile(userId: string): Promise<PeerProfile | null> {
  const index = getIndex();
  const profileId = `peer_${userId}`;
  
  console.log('🔍 [GET PEER PROFILE] Fetching profile with ID:', profileId);
  
  try {
    const result = await index.fetch([profileId]);
    console.log('📦 [GET PEER PROFILE] Fetch result:', {
      recordCount: Object.keys(result.records).length,
      hasRecord: !!result.records[profileId],
    });
    
    const record = result.records[profileId];
    
    if (!record || !record.metadata) {
      console.log('❌ [GET PEER PROFILE] No record or metadata found');
      console.log('📋 [GET PEER PROFILE] Available records:', Object.keys(result.records));
      return null;
    }
    
    console.log('✅ [GET PEER PROFILE] Profile found:', record.metadata.name);
    const meta = record.metadata as any;
    
    // Reconstruct the PeerProfile from flattened metadata
    return {
      user_id: meta.user_id,
      name: meta.name,
      graduation_year: meta.graduation_year,
      months_post_grad: meta.months_post_grad,
      neurotype: meta.neurotype || [],
      current_struggles: meta.current_struggles || [],
      career_field: meta.career_field || undefined,
      location: meta.location || undefined,
      interests: meta.interests || [],
      seeking: meta.seeking || [],
      offers: meta.offers || [],
      availability: meta.availability || undefined,
      bio: meta.bio,
      match_preferences: {
        similar_struggles: meta.similar_struggles,
        similar_neurotype: meta.similar_neurotype,
      },
    };
  } catch (error) {
    console.error('❌ [GET PEER PROFILE] Error fetching peer profile:', error);
    return null;
  }
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
  console.log(`🔍 Searching for matches for user: ${userId}`);
  const results = await index.query({
    vector: embedding,
    filter: {
      type: { $eq: 'peer_profile' },
      user_id: { $ne: userId }, // Exclude self
    },
    topK,
    includeMetadata: true,
  });
  
  console.log(`🔍 Found ${results.matches.length} potential matches for user ${userId}`);
  results.matches.forEach(match => {
    console.log(`  - Match: ${match.metadata?.name} (user_id: ${match.metadata?.user_id}, score: ${match.score})`);
  });
  
  // Score and rank matches
  const matches: PeerMatch[] = results.matches.map((match) => {
    const meta = match.metadata as any;
    
    // Reconstruct PeerProfile from flattened metadata
    const peer: PeerProfile = {
      user_id: meta.user_id,
      name: meta.name,
      graduation_year: meta.graduation_year,
      months_post_grad: meta.months_post_grad,
      neurotype: meta.neurotype || [],
      current_struggles: meta.current_struggles || [],
      career_field: meta.career_field || undefined,
      location: meta.location || undefined,
      interests: meta.interests || [],
      seeking: meta.seeking || [],
      offers: meta.offers || [],
      availability: meta.availability || undefined,
      bio: meta.bio,
      match_preferences: {
        similar_struggles: meta.similar_struggles,
        similar_neurotype: meta.similar_neurotype,
      },
    };
    
    const score = calculateMatchScore(userProfile, peer, match.score || 0);
    const matchReasons = getMatchReasons(userProfile, peer);
    
    console.log(`  Match: ${peer.name} (score: ${score})`);
    
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
  
  // Use anonymous username for privacy
  const peerName = generateAnonymousName(peer.user_id);
  
  // Near-peer timing (show first - establishes credibility)
  const monthsDiff = Math.abs(user.months_post_grad - peer.months_post_grad);
  if (monthsDiff <= 12) {
    reasons.push(`${peerName} graduated around the same time—they get what you're going through`);
  } else if (monthsDiff <= 36) {
    const yearsDiff = Math.round(monthsDiff / 12);
    reasons.push(`${peerName} is ${yearsDiff} year${yearsDiff > 1 ? 's' : ''} ahead—recently navigated similar challenges`);
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
    reasons.push(`${peerName} can help with: ${formatted}`);
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
