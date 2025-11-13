// Utility to detect if a query is asking about memory recall
// Detects variations of "What am I forgetting?", "What did I say I'd do today?", etc.

/**
 * Check if a query is asking about memory recall
 * Detects various phrasings for forgetting, today's tasks, and patterns
 */
export function isMemoryRecallQuery(query: string): boolean {
  if (!query || typeof query !== 'string') {
    return false;
  }

  const normalizedQuery = query.toLowerCase().trim();

  // Patterns for "What am I forgetting?" type queries
  const forgettingPatterns = [
    'what am i forgetting',
    'what did i forget',
    'what have i forgotten',
    'what am i forgetting about',
    'remind me what i',
    'what did i mention',
    'what did i say',
    'what did i tell you',
    'what did i write',
    'what did i dump',
    'what did i brain dump',
  ];

  // Patterns for "What did I say I'd do today?" type queries
  const todayPatterns = [
    'what did i say i\'d do today',
    'what did i say i would do today',
    'what did i say i\'d do',
    'what did i say i would do',
    'what did i say today',
    'what did i mention today',
    'what did i tell you today',
    'what am i supposed to do today',
    'what should i do today',
    'what did i plan today',
  ];

  // Patterns for "Show my usual patterns" type queries
  const patternsPatterns = [
    'show my usual patterns',
    'show my patterns',
    'what are my patterns',
    'what patterns do i have',
    'show patterns',
    'my patterns',
    'usual patterns',
    'recurring patterns',
  ];

  // Check if query matches any pattern
  const allPatterns = [...forgettingPatterns, ...todayPatterns, ...patternsPatterns];
  
  return allPatterns.some(pattern => normalizedQuery.includes(pattern));
}

/**
 * Determine the query type based on the query content
 * Returns 'forgetting', 'today', 'patterns', or null
 */
export function getMemoryQueryType(query: string): 'forgetting' | 'today' | 'patterns' | null {
  if (!query || typeof query !== 'string') {
    return null;
  }

  const normalizedQuery = query.toLowerCase().trim();

  if (normalizedQuery.includes('pattern')) {
    return 'patterns';
  }

  if (normalizedQuery.includes('today') || normalizedQuery.includes('supposed to do') || normalizedQuery.includes('plan')) {
    return 'today';
  }

  if (normalizedQuery.includes('forget') || normalizedQuery.includes('remind me') || normalizedQuery.includes('mention') || normalizedQuery.includes('say') || normalizedQuery.includes('tell') || normalizedQuery.includes('write') || normalizedQuery.includes('dump')) {
    return 'forgetting';
  }

  return null;
}

