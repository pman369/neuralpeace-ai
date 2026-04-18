-- 20260418000100_rpc_semantic_match.sql
CREATE OR REPLACE FUNCTION public.match_module_embeddings(
  query_embedding vector(384),
  match_threshold FLOAT,
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
    1 - (me.embedding <=> query_embedding) AS similarity
  FROM public.module_content mc
  JOIN public.module_embeddings me ON mc.id = me.content_id
  WHERE 1 - (me.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
