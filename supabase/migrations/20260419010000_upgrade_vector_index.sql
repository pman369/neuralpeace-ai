-- 20260419000100_upgrade_vector_index.sql
-- Upgrade from IVFFlat to HNSW for better performance and easier maintenance

DROP INDEX IF EXISTS public.idx_module_embeddings_embedding;

CREATE INDEX idx_module_embeddings_embedding 
ON public.module_embeddings 
USING hnsw (embedding vector_cosine_ops);
