-- Chat sessions table for organizing conversations
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  expertise_level TEXT DEFAULT 'Expert',
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_chat_sessions_user ON public.chat_sessions(user_id, updated_at DESC);
CREATE INDEX idx_chat_sessions_updated ON public.chat_sessions(updated_at DESC);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for now (restrict after auth is fully enforced)
CREATE POLICY "Allow anonymous read access"
  ON public.chat_sessions FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access"
  ON public.chat_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access"
  ON public.chat_sessions FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete access"
  ON public.chat_sessions FOR DELETE USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_session_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_session_update
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_session_update();
