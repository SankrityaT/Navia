// Type definitions for Navia Mobile (same as web app)

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
    details?: string;
    tips?: string;
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
  neurotypes: {
    adhd: boolean;
    autism: boolean;
    dyslexia: boolean;
    anxiety_depression: boolean;
    other: boolean;
    prefer_not_to_say: boolean;
    not_sure: boolean;
  };
  other_neurotype?: string;
  ef_challenges: {
    starting_tasks: boolean;
    time_management: boolean;
    organization: boolean;
    decision_making: boolean;
    emotional_regulation: boolean;
    social_interaction: boolean;
    focus: boolean;
  };
  current_goals: UserGoals;
}

export interface DailyEnergy {
  user_id: string;
  date: string;
  energy_level: number; // 0-100
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
  offers: string[];
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  persona?: string;
  personaIcon?: string;
  timestamp: Date;
  breakdown?: string[];
  resources?: Array<{ title: string; url: string; description?: string }>;
  sources?: Array<{ title: string; url: string; excerpt?: string }>;
}
