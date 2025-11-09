// Generate Reddit-style anonymous usernames
// Format: Adjective + Noun + Number (e.g., "QuietPanda47", "BraveOtter92")

const adjectives = [
  'Quiet', 'Brave', 'Calm', 'Bright', 'Swift', 'Gentle', 'Bold', 'Kind',
  'Wise', 'Happy', 'Clever', 'Peaceful', 'Curious', 'Friendly', 'Steady',
  'Warm', 'Cool', 'Bright', 'Soft', 'Strong', 'Quick', 'Smooth', 'Fresh',
  'Neat', 'Clear', 'Pure', 'True', 'Fair', 'Noble', 'Proud'
];

const nouns = [
  'Panda', 'Otter', 'Fox', 'Owl', 'Bear', 'Wolf', 'Eagle', 'Hawk',
  'Deer', 'Rabbit', 'Squirrel', 'Dolphin', 'Penguin', 'Koala', 'Tiger',
  'Lion', 'Falcon', 'Raven', 'Swan', 'Crane', 'Phoenix', 'Dragon',
  'Turtle', 'Whale', 'Seal', 'Lynx', 'Moose', 'Bison', 'Elk', 'Badger'
];

/**
 * Generate a consistent anonymous username from a user ID
 * Uses a simple hash to ensure the same user always gets the same name
 */
export function generateAnonymousName(userId: string): string {
  // Simple hash function to convert userId to a number
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Make hash positive
  hash = Math.abs(hash);
  
  // Select adjective and noun based on hash
  const adjectiveIndex = hash % adjectives.length;
  const nounIndex = Math.floor(hash / adjectives.length) % nouns.length;
  const number = (hash % 100).toString().padStart(2, '0');
  
  return `${adjectives[adjectiveIndex]}${nouns[nounIndex]}${number}`;
}

/**
 * Get display name - either anonymous or real name based on connection status
 */
export function getDisplayName(
  realName: string,
  userId: string,
  isConnected: boolean = false,
  showRealNames: boolean = false
): string {
  if (showRealNames && isConnected) {
    // Show real name only if connected and user opted in
    return realName;
  }
  
  // Default: show anonymous name
  return generateAnonymousName(userId);
}
