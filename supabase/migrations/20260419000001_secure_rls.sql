-- 20260419000001_secure_rls.sql
-- Harden chat_sessions
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.chat_sessions;
DROP POLICY IF EXISTS "Allow anonymous insert access" ON public.chat_sessions;
DROP POLICY IF EXISTS "Allow anonymous update access" ON public.chat_sessions;
DROP POLICY IF EXISTS "Allow anonymous delete access" ON public.chat_sessions;

CREATE POLICY "Users can manage their own sessions"
  ON public.chat_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Harden chat_messages
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow anonymous insert access" ON public.chat_messages;
DROP POLICY IF EXISTS "Allow anonymous update access" ON public.chat_messages;

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
