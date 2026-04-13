// Supabase Edge Function: embed-knowledge
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

// Initialize the model once
// @ts-ignore
const model = new Supabase.ai.Session('gte-small');

Deno.serve(async (req) => {
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
    const { action, sectionId } = await req.json();

    if (action === 'sync') {
      const { data: sections, error: fetchError } = await supabase
        .from('module_content')
        .select('id, content_md')
        .eq('id', sectionId);

      if (fetchError) throw fetchError;
      if (!sections || sections.length === 0) {
        return new Response(JSON.stringify({ success: true, syncedCount: 0 }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const section = sections[0];
      // Limit text to 500 chars for testing if it's a size issue
      const text = section.content_md.replace(/[#*`]/g, '').trim().substring(0, 1000);
      
      const embedding = await model.run(text, { mean_pool: true, normalize: true });

      const { error: upsertError } = await supabase
        .from('module_embeddings')
        .upsert({
          content_id: section.id,
          embedding: embedding,
        }, { onConflict: 'content_id' });

      if (upsertError) throw upsertError;

      return new Response(JSON.stringify({ success: true, syncedCount: 1 }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
});
