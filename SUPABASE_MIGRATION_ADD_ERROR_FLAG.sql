-- Migration: Add error tracking to chat_messages table
-- Run this in your Supabase SQL Editor

-- Add is_error column to track failed/error responses
ALTER TABLE chat_messages 
ADD COLUMN is_error BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for filtering out errors efficiently
CREATE INDEX idx_chat_messages_user_success ON chat_messages(user_id, created_at DESC) 
WHERE is_error = FALSE;

-- Add comment for documentation
COMMENT ON COLUMN chat_messages.is_error IS 'Tracks if the chat response was an error (API failure, rate limit, etc). Errors are stored for analytics but hidden from user history UI.';

