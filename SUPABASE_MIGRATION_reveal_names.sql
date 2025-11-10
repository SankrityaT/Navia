-- Migration: Add name reveal tracking to peer_connections
-- This allows users to optionally reveal their real names in chat

ALTER TABLE peer_connections 
ADD COLUMN user1_revealed_name BOOLEAN DEFAULT FALSE,
ADD COLUMN user2_revealed_name BOOLEAN DEFAULT FALSE,
ADD COLUMN user1_revealed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN user2_revealed_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN peer_connections.user1_revealed_name IS 'Whether user1 has chosen to reveal their real name';
COMMENT ON COLUMN peer_connections.user2_revealed_name IS 'Whether user2 has chosen to reveal their real name';
COMMENT ON COLUMN peer_connections.user1_revealed_at IS 'When user1 revealed their name';
COMMENT ON COLUMN peer_connections.user2_revealed_at IS 'When user2 revealed their name';
