-- Back the idempotent upserts in knowledge_base/sync_knowledge.py with unique constraints.
-- The script targets ON CONFLICT (title) on modules and ON CONFLICT (module_id, section_order)
-- on module_content, but neither had a matching unique constraint, so every sync aborted with:
--   "there is no unique or exclusion constraint matching the ON CONFLICT specification".
ALTER TABLE public.modules
  ADD CONSTRAINT modules_title_key UNIQUE (title);

ALTER TABLE public.module_content
  ADD CONSTRAINT module_content_module_id_section_order_key UNIQUE (module_id, section_order);
