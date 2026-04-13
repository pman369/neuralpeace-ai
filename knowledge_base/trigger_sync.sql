-- SQL to trigger the embed-knowledge edge function
-- Replace <YOUR_PROJECT_REF> and <YOUR_ANON_KEY> with your actual project values
-- This can be run from the Supabase SQL Editor to populate embeddings for RAG

SELECT
  net.http_post(
    url := 'https://vebgatsavuxliewemioe.supabase.co/functions/v1/embed-knowledge',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || '<YOUR_SERVICE_ROLE_KEY>'
    ),
    body := jsonb_build_object('action', 'sync')
  ) as request_id;

-- NOTE: Make sure the pg_net extension is enabled
-- CREATE EXTENSION IF NOT EXISTS pg_net;
