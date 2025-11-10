-- SUPABASE SCHEMA FOR NAVIA
-- Run this in your Supabase SQL Editor to set up tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES (synced with Clerk)
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  graduation_timeline TEXT,
  neurotypes JSONB,
  other_neurotype TEXT,
  ef_challenges JSONB,
  current_goal TEXT,
  current_goals TEXT[], -- Array of goals for multi-select
  job_field TEXT,
  interests TEXT[], -- User's interests for peer matching
  seeking TEXT[], -- What user is looking for in peers
  offers TEXT[], -- What user can offer to peers
  onboarded BOOLEAN DEFAULT FALSE,
  onboarded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PEER CONNECTIONS
-- ============================================
CREATE TABLE peer_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id TEXT NOT NULL REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  user2_id TEXT NOT NULL REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'paused', 'ended')),
  initiated_by TEXT NOT NULL,
  user1_goals TEXT[],
  user2_goals TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  last_checkin TIMESTAMP WITH TIME ZONE,
  CONSTRAINT different_users CHECK (user1_id != user2_id)
);

CREATE INDEX idx_peer_connections_user1 ON peer_connections(user1_id);
CREATE INDEX idx_peer_connections_user2 ON peer_connections(user2_id);
CREATE INDEX idx_peer_connections_status ON peer_connections(status);

-- ============================================
-- PEER MESSAGES
-- ============================================
CREATE TABLE peer_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES peer_connections(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_peer_messages_connection ON peer_messages(connection_id, created_at DESC);
CREATE INDEX idx_peer_messages_sender ON peer_messages(sender_id);

-- ============================================
-- CHECK-INS
-- ============================================
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES peer_connections(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  goals_completed INTEGER NOT NULL,
  total_goals INTEGER NOT NULL,
  reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_checkins_connection ON check_ins(connection_id, created_at DESC);
CREATE INDEX idx_checkins_user ON check_ins(user_id, week_start DESC);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  time_estimate INTEGER NOT NULL, -- in minutes
  category TEXT NOT NULL CHECK (category IN ('career', 'finance', 'daily_life', 'social')),
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL, -- 'user' or 'ai'
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  details TEXT,
  tips TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_user ON tasks(user_id, status, created_at DESC);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);

-- ============================================
-- CHAT MESSAGES (AI conversation history)
-- ============================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('finance', 'career', 'daily_task')),
  persona TEXT NOT NULL,
  metadata JSONB,
  pinecone_id TEXT, -- Reference to Pinecone vector ID
  is_error BOOLEAN DEFAULT FALSE NOT NULL, -- Track error responses (API failures, rate limits)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, created_at DESC);
CREATE INDEX idx_chat_messages_category ON chat_messages(category);
CREATE INDEX idx_chat_messages_pinecone ON chat_messages(pinecone_id);
CREATE INDEX idx_chat_messages_user_success ON chat_messages(user_id, created_at DESC) WHERE is_error = FALSE;

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- User Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

-- Peer Connections: Users can see connections they're part of
CREATE POLICY "Users can view own connections" ON peer_connections
  FOR SELECT USING (
    user1_id = auth.jwt() ->> 'sub' OR 
    user2_id = auth.jwt() ->> 'sub'
  );

CREATE POLICY "Users can create connections" ON peer_connections
  FOR INSERT WITH CHECK (
    user1_id = auth.jwt() ->> 'sub' OR 
    user2_id = auth.jwt() ->> 'sub'
  );

CREATE POLICY "Users can update own connections" ON peer_connections
  FOR UPDATE USING (
    user1_id = auth.jwt() ->> 'sub' OR 
    user2_id = auth.jwt() ->> 'sub'
  );

-- Peer Messages: Users can see messages in their connections
CREATE POLICY "Users can view connection messages" ON peer_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM peer_connections pc
      WHERE pc.id = connection_id
      AND (pc.user1_id = auth.jwt() ->> 'sub' OR pc.user2_id = auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "Users can send messages" ON peer_messages
  FOR INSERT WITH CHECK (sender_id = auth.jwt() ->> 'sub');

-- Check-ins: Users can see check-ins in their connections
CREATE POLICY "Users can view connection checkins" ON check_ins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM peer_connections pc
      WHERE pc.id = connection_id
      AND (pc.user1_id = auth.jwt() ->> 'sub' OR pc.user2_id = auth.jwt() ->> 'sub')
    )
  );

CREATE POLICY "Users can create own checkins" ON check_ins
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Tasks: Users can only see/edit their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can create own tasks" ON tasks
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Chat Messages: Users can only see/create their own messages
CREATE POLICY "Users can view own chat messages" ON chat_messages
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can create own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- REAL-TIME SUBSCRIPTIONS (Enable for chat)
-- ============================================

-- Enable real-time for peer messages
ALTER PUBLICATION supabase_realtime ADD TABLE peer_messages;
