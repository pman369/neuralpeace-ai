-- Migration: Create view for module progress
CREATE OR REPLACE VIEW public.module_progress_view AS
SELECT 
    m.id,
    m.title,
    m.description,
    m.category,
    m.expertise,
    m.image_url,
    m.read_time,
    m.created_at,
    ump.user_id,
    COALESCE(ump.completed, false) as completed,
    ump.last_read_at
FROM public.modules m
LEFT JOIN public.user_module_progress ump ON m.id = ump.module_id;

-- RLS for the view
ALTER VIEW public.module_progress_view SET (security_invoker = on);

-- Note: In Supabase, views with security_invoker = on respect RLS of underlying tables.
-- Alternatively, we can define a policy if needed, but security_invoker is preferred for standard joins.
