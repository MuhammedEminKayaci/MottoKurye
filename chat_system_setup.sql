-- Enable Row Level Security (RLS) is assumed to be enabled by default for new tables in Supabase, but we will strictly define policies.

-- 1. Conversations Table
-- Stores the relationship between a business and a courier.
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(user_id) ON DELETE CASCADE, -- References user_id in businesses
  courier_id UUID REFERENCES couriers(user_id) ON DELETE CASCADE,   -- References user_id in couriers
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate conversations between same pair
  UNIQUE(business_id, courier_id)
);

-- Enable RLS on conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view conversations they are part of
CREATE POLICY "Users can view their own conversations"
  ON conversations
  FOR SELECT
  USING (
    auth.uid() = business_id OR auth.uid() = courier_id
  );

-- Policy 2: Users can insert conversations if they are one of the participants
CREATE POLICY "Users can create conversations they are part of"
  ON conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() = business_id OR auth.uid() = courier_id
  );

-- 2. Messages Table
-- Stores the actual messages within a conversation.
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- The actual user who sent it
  content TEXT NOT NULL CHECK (char_length(content) > 0),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view messages in conversations they belong to
-- We use a scalar subquery to check if the current user is a participant in the message's conversation
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.business_id = auth.uid() OR c.courier_id = auth.uid())
    )
  );

-- Policy 2: Users can insert messages if they are part of the conversation and are the sender
CREATE POLICY "Users can send messages to their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id 
    AND 
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.business_id = auth.uid() OR c.courier_id = auth.uid())
    )
  );

-- Policy 3: Users can update message status (e.g. mark as read) if they are in the conversation
CREATE POLICY "Users can update messages in their conversations"
  ON messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.business_id = auth.uid() OR c.courier_id = auth.uid())
    )
  );

-- 3. Function to update updated_at on conversation when a message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for the function above
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;
CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- 4. Realtime Setup
-- Supabase needs to know which tables to broadcast changes for.
-- (This part usually needs to be done via dashboard "Replication" settings for 'messages' table, 
-- but creating the publication here explicitly if user has permissions)

-- Check if publication exists, if not create/alter (Generic SQL approach, Supabase handles 'supabase_realtime' usually)
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
