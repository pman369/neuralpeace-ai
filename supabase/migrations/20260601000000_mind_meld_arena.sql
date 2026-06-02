-- 20260420000000_mind_meld_arena.sql
-- Database schema for real-time neuroscience debates and gamification

-- 1. Topics for curated debates
CREATE TABLE public.debate_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT DEFAULT 'General',
  difficulty TEXT DEFAULT 'Practitioner',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Active debate sessions
CREATE TABLE public.debates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES public.debate_topics(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('waiting', 'active', 'finished')) DEFAULT 'waiting',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Debate arguments (messages)
CREATE TABLE public.debate_arguments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id UUID REFERENCES public.debates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  fact_check_score FLOAT, -- AI-moderated score (0-1)
  fallacies TEXT[], -- Array of detected fallacies
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Reputation and Badges (Extend Profiles)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reputation INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;

-- Real-time Configuration
ALTER PUBLICATION supabase_realtime ADD TABLE public.debates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.debate_arguments;

-- RLS Policies
ALTER TABLE public.debate_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debate_arguments ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access to topics" ON public.debate_topics FOR SELECT USING (true);
CREATE POLICY "Allow public read access to debates" ON public.debates FOR SELECT USING (true);
CREATE POLICY "Allow public read access to arguments" ON public.debate_arguments FOR SELECT USING (true);

-- Authenticated write access
CREATE POLICY "Allow users to create debates" ON public.debates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow users to post arguments" ON public.debate_arguments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Seed Initial Topics
INSERT INTO public.debate_topics (title, description, category, difficulty) VALUES
('The Connectome Overhype', 'Is mapping every neuron worth the multi-billion dollar investment compared to circuit-level study?', 'Connectomics', 'Expert'),
('Free Will & Neuro-determinism', 'Do Libet-style experiments prove we lack agency in our decisions?', 'Neuroethics', 'Practitioner'),
('AI vs. Biological Consciousness', 'Can silicon-based architectures ever achieve genuine subjective experience (Qualia)?', 'Computational', 'Scholar');
