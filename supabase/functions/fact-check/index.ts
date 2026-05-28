import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { performHybridRAG } from '../chat/rag.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
const PERPLEXITY_MODEL = Deno.env.get('PERPLEXITY_MODEL') || 'sonar';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { argumentId, content } = await req.json();
    if (!argumentId || !content) throw new Error('Missing argumentId or content');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // 1. Fetch related knowledge (Reusing the Chat RAG utility)
    const context = await performHybridRAG(supabase, content);

    // 2. Ask Perplexity to fact-check based on context
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: PERPLEXITY_MODEL,
        messages: [
          { 
            role: 'system', 
            content: `You are an impartial scientific AI moderator for the Mind Meld Arena. 
Evaluate the user's neuroscience argument based on the provided context.
Return ONLY a JSON object with:
- "score": A float between 0.0 (completely inaccurate) and 1.0 (scientifically robust).
- "reasoning": A brief 1-2 sentence explanation of the score.

Context from Knowledge Base:
${context}` 
          },
          { role: 'user', content }
        ],
        temperature: 0,
        max_tokens: 150,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      console.error(await response.text());
      throw new Error(`LLM Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    // 3. Update the argument record
    const { error } = await supabase
      .from('debate_arguments')
      .update({ fact_check_score: result.score || 0 })
      .eq('id', argumentId);

    if (error) throw error;

    return new Response(JSON.stringify(result), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error: any) {
    console.error('Fact-check failed:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
