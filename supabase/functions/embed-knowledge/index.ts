// Supabase Edge Function: embed-knowledge
// Generates embeddings for knowledge base content using Supabase AI
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

// Initialize the AI session (gte-small is built-in)
const model = new Supabase.ai.Session('gte-small');

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { action } = await req.json();

    if (action === 'sync') {
      // 1. Fetch all module content without embeddings
      const { data: sections, error: fetchError } = await supabase
        .from('module_content')
        .select('id, content_md')
        .order('id');

      if (fetchError) throw fetchError;

      let syncedCount = 0;

      // 2. Generate embeddings and update
      for (const section of sections || []) {
        // Simple cleaning of markdown
        const text = section.content_md.replace(/[#*`]/g, '').trim();
        
        // Generate embedding
        const embedding = await model.run(text, { mean_pool: true, normalize: true });

        // Update database
        const { error: updateError } = await supabase
          .from('module_embeddings')
          .upsert({
            content_id: section.id,
            embedding: embedding,
          });

        if (!updateError) syncedCount++;
      }

      return new Response(JSON.stringify({ success: true, syncedCount }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Embed function error:', error);
    return new Response(
      JSON.stringify({ error: error.message ?? 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
