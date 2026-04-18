// Supabase Edge Function: chat
// Handles AI-powered neuroscience Q&A with ethical guardrails, streaming, caching, and keyword-based RAG
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
const PERPLEXITY_MODEL = Deno.env.get('PERPLEXITY_MODEL') || 'sonar';

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

interface ChatRequest {
  message: string;
  expertiseLevel: string;
  conversationHistory: { role: string; content: string }[];
  stream?: boolean;
}

// Simple hash function for caching
async function getHash(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Ethical guardrail: detect medical advice requests
const MEDICAL_KEYWORDS = [
  'diagnose', 'diagnosis', 'treatment', 'prescribe', 'medication',
  'should i take', 'my symptoms', 'my doctor', 'cure', 'therapy',
  'clinical trial', 'patient', 'disease treatment', 'what should i do',
];

function detectMedicalAdvice(message: string): boolean {
  const lower = message.toLowerCase();
  return MEDICAL_KEYWORDS.some((kw) => lower.includes(kw));
}

// Build system prompt based on expertise level and context
function buildSystemPrompt(expertiseLevel: string, isMedical: boolean, context?: string): string {
  const basePrompt = `You are NeuralPeace AI, an expert-level neuroscience assistant.

Your role is to provide accurate, evidence-based educational information about neuroscience topics. You draw from peer-reviewed research, established textbooks, and the specific curated knowledge base provided below.`;

  const contextPrompt = context ? `\n\n**Curated Knowledge Base Context:**\n${context}\n\nUse the above context to inform your answer if relevant. If the context doesn't apply, rely on your broad training data.` : '';

  const expertisePrompts: Record<string, string> = {
    Novice: `
**Expertise Level: Novice**
- Use simple analogies and everyday examples
- Minimize jargon; explain technical terms when necessary
- Focus on big-picture concepts and why they matter
- Keep responses concise and engaging
- Use bullet points and clear structure`,

    Practitioner: `
**Expertise Level: Practitioner**
- Use technical terms with brief explanations
- Focus on mechanisms and processes
- Include relevant research findings and their implications
- Connect concepts across subfields
- Provide structured, detailed explanations`,

    Expert: `
**Expertise Level: Expert**
- Use advanced terminology without explanation
- Include methodological critique and limitations
- Discuss competing theories and ongoing debates
- Reference specific studies, DOIs, and methodological approaches
- Address nuance, controversy, and open questions in the field`,

    Scholar: `
**Expertise Level: Scholar**
- Provide comprehensive, literature-grounded analysis
- Discuss historical context and paradigm shifts
- Include cross-disciplinary connections
- Address philosophical and ethical dimensions
- Reference primary literature extensively`,
  };

  const ethicalDisclaimer = `
**Ethical Guidelines:**
- This is an EDUCATIONAL tool, NOT a medical advisory system
- Always emphasize that your responses for learning purposes only
- For health-related concerns, users should consult qualified healthcare professionals
- Do not provide individualized medical advice`;

  const medicalWarning = `
**IMPORTANT: The user appears to be asking a medical/clinical question.**
You MUST:
1. Begin with a clear disclaimer that you cannot provide medical advice
2. Provide educational information about the relevant neuroscience concepts
3. Strongly recommend consulting a qualified healthcare professional
4. Do NOT suggest diagnoses, treatments, or medication changes`;

  return (
    basePrompt +
    contextPrompt +
    (expertisePrompts[expertiseLevel] ?? expertisePrompts['Practitioner']) +
    (isMedical ? medicalWarning : '') +
    ethicalDisclaimer
  );
}

serve(async (req) => {
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
    const body: ChatRequest = await req.json();
    const { message, expertiseLevel, conversationHistory, stream = true } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Hybrid RAG: Semantic search + Keyword fallback/boost
    let context = '';
    try {
      // @ts-ignore
      const model = new Supabase.ai.Session('gte-small');
      const queryEmbedding = await model.run(message, { mean_pool: true, normalize: true });
      
      const [semanticRes, keywordRes] = await Promise.all([
        supabase.rpc('match_module_embeddings', {
          query_embedding: queryEmbedding,
          match_threshold: 0.65,
          match_count: 3
        }),
        supabase.rpc('keyword_match_module_content', {
          query_text: message,
          match_count: 2
        })
      ]);

      const ragResults = new Map<string, string>();

      if (!semanticRes.error && semanticRes.data) {
        semanticRes.data.forEach((m: any) => {
          ragResults.set(m.section_title, `[Topic: ${m.section_title}] (Relevance: ${(m.similarity * 100).toFixed(1)}%)\n${m.content_md}`);
        });
      }

      if (!keywordRes.error && keywordRes.data) {
        keywordRes.data.forEach((m: any) => {
          if (!ragResults.has(m.section_title)) {
            ragResults.set(m.section_title, `[Topic: ${m.section_title}] (Keyword Match)\n${m.content_md}`);
          }
        });
      }

      context = Array.from(ragResults.values()).join('\n\n');
      console.log(`RAG context length: ${context.length} characters.`);
    } catch (ragError) {
      console.warn('Hybrid RAG search failed:', ragError);
    }

    // 2. Build Prompt
    const isMedical = detectMedicalAdvice(message);
    const systemPrompt = buildSystemPrompt(expertiseLevel || 'Expert', isMedical, context);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    // 3. Caching logic
    const cacheKey = await getHash(`${expertiseLevel}:${message}`);
    const { data: cached } = await supabase
      .from('query_cache')
      .select('response_json, created_at')
      .eq('query_hash', cacheKey)
      .eq('expertise_level', expertiseLevel)
      .maybeSingle();

    if (cached) {
      const createdAt = new Date(cached.created_at);
      const diffHrs = (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      if (diffHrs < 24) {
        console.log('Serving from cache:', cacheKey);
        if (stream) {
          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            start(controller) {
              const chunk = `data: ${JSON.stringify({ 
                choices: [{ delta: { content: cached.response_json.content } }],
                citations: cached.response_json.citations 
              })}\n\ndata: [DONE]\n\n`;
              controller.enqueue(encoder.encode(chunk));
              controller.close();
            },
          });
          return new Response(readable, {
            headers: { 'Content-Type': 'text/event-stream', 'Access-Control-Allow-Origin': '*' }
          });
        }
        return new Response(JSON.stringify({ ...cached.response_json, isMedical, cached: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    if (!PERPLEXITY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Perplexity API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Call Perplexity API
    console.log('Calling Perplexity API...');
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: PERPLEXITY_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 2000,
        stream: stream,
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      throw new Error(`Perplexity API error: ${perplexityResponse.status} ${errorText}`);
    }

    if (!stream) {
      const data = await perplexityResponse.json();
      const responsePayload = {
        content: data.choices?.[0]?.message?.content ?? '',
        citations: data.citations ?? [],
      };

      await supabase.from('query_cache').upsert({
        query_hash: cacheKey,
        response_json: responsePayload,
        expertise_level: expertiseLevel,
      }, { onConflict: 'query_hash' });

      return new Response(JSON.stringify({ ...responsePayload, isMedical }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 5. Setup streaming
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = perplexityResponse.body?.getReader();

    if (!reader) throw new Error('Failed to get reader from Perplexity response');

    (async () => {
      let fullContent = '';
      let citations = [];
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;
            
            const jsonStr = trimmedLine.replace('data: ', '');
            if (jsonStr === '[DONE]') {
              await writer.write(encoder.encode('data: [DONE]\n\n'));
              continue;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              fullContent += parsed.choices?.[0]?.delta?.content ?? '';
              if (parsed.citations) citations = parsed.citations;
              await writer.write(encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`));
            } catch (e) { /* partial JSON */ }
          }
        }

        if (fullContent) {
          await supabase.from('query_cache').upsert({
            query_hash: cacheKey,
            response_json: { content: fullContent, citations },
            expertise_level: expertiseLevel,
          }, { onConflict: 'query_hash' });
        }
      } catch (err) {
        console.error('Stream error:', err);
      } finally {
        writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    });
  }
});
