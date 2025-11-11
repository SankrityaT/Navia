export interface MockPeer {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  challenges: string[];
  canHelp: string[];
  matchScore: number;
}

export const MOCK_PEERS: MockPeer[] = [
  {
    id: '1',
    name: 'Sage Owl',
    avatar: '🦉',
    bio: 'Navigating job search post-grad. ADHD brain, trying to stay organized and not get overwhelmed by applications.',
    challenges: ['Job Search', 'ADHD', 'Organization'],
    canHelp: ['Resume Tips', 'Interview Prep'],
    matchScore: 95
  },
  {
    id: '2',
    name: 'Clay Fox',
    avatar: '🦊',
    bio: 'Software engineer dealing with burnout. Learning to set boundaries and take breaks without guilt.',
    challenges: ['Burnout', 'Work-Life Balance', 'Perfectionism'],
    canHelp: ['Career Advice', 'Tech Industry'],
    matchScore: 92
  },
  {
    id: '3',
    name: 'Stone Bear',
    avatar: '🐻',
    bio: 'Autistic adult figuring out social situations at work. Looking for others who get the masking exhaustion.',
    challenges: ['Autism', 'Social Anxiety', 'Workplace Communication'],
    canHelp: ['Sensory Strategies', 'Self-Advocacy'],
    matchScore: 88
  },
  {
    id: '4',
    name: 'River Deer',
    avatar: '🦌',
    bio: 'Grad student with ADHD and anxiety. Trying to finish my thesis while managing executive dysfunction.',
    challenges: ['ADHD', 'Anxiety', 'Academic Stress'],
    canHelp: ['Study Strategies', 'Time Management'],
    matchScore: 90
  },
  {
    id: '5',
    name: 'Moss Rabbit',
    avatar: '🐰',
    bio: 'Recently diagnosed with ADHD at 28. Learning what accommodations I need and how to ask for them.',
    challenges: ['Late Diagnosis', 'Self-Advocacy', 'Identity'],
    canHelp: ['Medication Journey', 'Therapy Resources'],
    matchScore: 87
  },
  {
    id: '6',
    name: 'Ember Wolf',
    avatar: '🐺',
    bio: 'Freelancer with ADHD trying to build sustainable routines. The freedom is great but structure is hard.',
    challenges: ['Self-Employment', 'Routine Building', 'Financial Anxiety'],
    canHelp: ['Freelancing Tips', 'Client Management'],
    matchScore: 85
  },
  {
    id: '7',
    name: 'Willow Cat',
    avatar: '🐱',
    bio: 'Parent with ADHD raising neurodivergent kids. Trying to support them while managing my own stuff.',
    challenges: ['Parenting', 'ADHD', 'Family Dynamics'],
    canHelp: ['Parenting Strategies', 'School Advocacy'],
    matchScore: 83
  },
  {
    id: '8',
    name: 'Ash Hawk',
    avatar: '🦅',
    bio: 'Career changer at 35. Autistic and finally pursuing work that aligns with my interests and needs.',
    challenges: ['Career Change', 'Autism', 'Age Anxiety'],
    canHelp: ['Career Pivoting', 'Interview Strategies'],
    matchScore: 86
  },
  {
    id: '9',
    name: 'Tide Seal',
    avatar: '🦭',
    bio: 'Dealing with rejection sensitivity dysphoria. Learning to separate my worth from others\' reactions.',
    challenges: ['RSD', 'Self-Worth', 'Emotional Regulation'],
    canHelp: ['Coping Strategies', 'Mindfulness'],
    matchScore: 89
  },
  {
    id: '10',
    name: 'Fern Turtle',
    avatar: '🐢',
    bio: 'Slow processor in a fast world. Autistic and learning to honor my pace instead of forcing myself to keep up.',
    challenges: ['Processing Speed', 'Autism', 'Self-Acceptance'],
    canHelp: ['Accommodations', 'Self-Compassion'],
    matchScore: 84
  }
];

// Helper function to get a peer by ID
export function getPeerById(id: string): MockPeer | undefined {
  return MOCK_PEERS.find(peer => peer.id === id);
}

// Helper function to shuffle peers (for variety)
export function getShuffledPeers(): MockPeer[] {
  return [...MOCK_PEERS].sort(() => Math.random() - 0.5);
}
