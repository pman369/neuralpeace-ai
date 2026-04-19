-- Migration: Fix session_id type and add Foreign Key
-- 1. Drop dependent policies first
DROP POLICY IF EXISTS "Users can view messages from their sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages into their sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can read messages in own sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in own sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update messages in own sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view messages in own sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow anonymous insert access" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow anonymous update access" ON public.chat_messages;

-- 2. Change session_id column type to UUID
ALTER TABLE public.chat_messages 
  ALTER COLUMN session_id TYPE UUID USING session_id::uuid;

-- 3. Add Foreign Key constraint
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_session_id_fkey;
ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_session_id_fkey 
  FOREIGN KEY (session_id) 
  REFERENCES public.chat_sessions(id) 
  ON DELETE CASCADE;

-- 4. Recreate RLS policies
CREATE POLICY "Users can view messages from their sessions"
  ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = public.chat_messages.session_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages into their sessions"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = public.chat_messages.session_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.chat_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = public.chat_messages.session_id
      AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = public.chat_messages.session_id
      AND s.user_id = auth.uid()
    )
  );
