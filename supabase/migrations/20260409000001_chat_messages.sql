-- Chat messages table for conversation history
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  expertise_level TEXT DEFAULT 'Expert',
  citations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id, created_at);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write for now (restrict after auth is implemented)
CREATE POLICY "Allow anonymous read access"
  ON public.chat_messages FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access"
  ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access"
  ON public.chat_messages FOR UPDATE USING (true);
