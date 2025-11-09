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
  seeking: string[];
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
