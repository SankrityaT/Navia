// Type definitions for Navia

export interface Task {
  user_id: string;
  task_id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  time_estimate: number; // in minutes
  category: 'career' | 'finance' | 'daily_life' | 'social';
  parent_task?: string;
  created_by: string;
  created_at: string;
  dependencies?: string[];
  due_date?: string;
  description?: string; // AI-generated task summary
  breakdown?: string[]; // AI-generated step-by-step breakdown
  metadata?: {
    chat_reference?: string;
    [key: string]: any;
  };
}

export interface EFProfile {
  task_initiation: boolean;
  time_management: boolean;
  organization: boolean;
  planning: boolean;
  working_memory: boolean;
}

export interface UserGoals {
  job_searching: boolean;
  managing_finances: boolean;
  independent_living: boolean;
  building_social_connections: boolean;
}

export interface OnboardingData {
  name: string;
  graduation_date: string;
  university: string;
  ef_profile: EFProfile;
  current_goals: UserGoals;
}

export interface DailyEnergy {
  user_id: string;
  date: string;
  energy_level: number; // 0-100
}

export interface PineconeMetadata {
  user_id: string;
  type: 'task' | 'profile' | 'energy' | 'goal' | 'peer_profile' | 'chat_message';
  [key: string]: any;
}

export interface PeerProfile {
  user_id: string;
  name: string;
  graduation_year: number;
  months_post_grad: number;
  neurotype: string[];
  current_struggles: string[];
  career_field?: string;
  location?: string;
  interests: string[];
  seeking: string[]; // What they need help with
  offers: string[]; // What they can help others with (strengths-based)
  availability?: string;
  bio: string;
  match_preferences: {
    age_range?: [number, number];
    similar_struggles: boolean;
    similar_neurotype: 'required' | 'preferred' | 'no_preference';
  };
}

export interface PeerMatch {
  peer: PeerProfile;
  score: number;
  matchReasons: string[];
}

// Connection between two peers (accountability partnership)
export interface PeerConnection {
  connection_id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'active' | 'paused' | 'ended';
  initiated_by: string;
  created_at: string;
  accepted_at?: string;
  goals?: {
    user1_goals: string[];
    user2_goals: string[];
  };
  last_checkin?: string;
}

// Message between peers
export interface PeerMessage {
  message_id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// Check-in record
export interface CheckIn {
  checkin_id: string;
  connection_id: string;
  user_id: string;
  week_start: string;
  goals_completed: number;
  total_goals: number;
  reflection?: string;
  timestamp: string;
}
