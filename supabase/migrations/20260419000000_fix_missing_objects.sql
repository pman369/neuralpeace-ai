-- 20260419000000_fix_missing_objects.sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create module_embeddings table for vector search
CREATE TABLE IF NOT EXISTS public.module_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.module_content(id) ON DELETE CASCADE NOT NULL,
  embedding vector(384) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT module_embeddings_content_id_key UNIQUE (content_id)
);

CREATE INDEX IF NOT EXISTS idx_module_embeddings_embedding ON public.module_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Create query_cache table for AI response caching
CREATE TABLE IF NOT EXISTS public.query_cache (
  query_hash TEXT PRIMARY KEY,
  response_json JSONB NOT NULL,
  expertise_level TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_query_cache_hash ON public.query_cache(query_hash);

-- Create keyword_match_module_content for hybrid search
CREATE OR REPLACE FUNCTION public.keyword_match_module_content(
  query_text TEXT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  module_id UUID,
  section_title TEXT,
  content_md TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mc.id,
    mc.module_id,
    mc.section_title,
    mc.content_md,
    ts_rank(to_tsvector('english', mc.section_title || ' ' || mc.content_md), plainto_tsquery('english', query_text)) AS similarity
  FROM public.module_content mc
  WHERE
    to_tsvector('english', mc.section_title || ' ' || mc.content_md) @@ plainto_tsquery('english', query_text)
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- RLS for new tables
ALTER TABLE public.module_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role access to embeddings"
  ON public.module_embeddings
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read-only access to query_cache"
  ON public.query_cache
  FOR SELECT
  USING (true);

CREATE POLICY "Allow service role to manage query_cache"
  ON public.query_cache
  TO service_role
  USING (true)
  WITH CHECK (true);
