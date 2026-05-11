ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_session_id UUID REFERENCES public.chat_sessions(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.active_session_id IS 'Persists the last active chat session for cross-device continuity.';
