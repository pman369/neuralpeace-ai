// Supabase Edge Function: chat
// Handles AI-powered neuroscience Q&A with modularized logic
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { getHash, checkCache, updateCache } from './cache.ts';
import { performHybridRAG } from './rag.ts';
import { judgeMedicalAdvice } from './guardrails.ts';

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

function buildSystemPrompt(expertiseLevel: string, isMedical: boolean, context?: string): string {
  const basePrompt = `You are NeuralPeace AI, an expert-level neuroscience assistant. Use valid peer-reviewed research and the context below.`;
  const contextPrompt = context ? `\n\n**Context:**\n${context}` : '';
  const expertisePrompts: Record<string, string> = {
    Novice: `Use simple analogies, avoid jargon.`,
    Practitioner: `Focus on mechanisms and recent findings.`,
    Expert: `Detailed technical analysis, cite DOIs.`,
    Scholar: `Cross-disciplinary historical context and paradigm shifts.`,
  };
  const ethicalDisclaimer = `\n\n**Educational Tool ONLY. Not Medical Advice.**`;
  const medicalWarning = isMedical ? `\n\n**USER ASKED MEDICAL QUESTION.** Start with disclaimer. Recommend a doctor.` : '';

  return basePrompt + contextPrompt + (expertisePrompts[expertiseLevel] ?? expertisePrompts['Practitioner']) + medicalWarning + ethicalDisclaimer;
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

    if (!message) return new Response(JSON.stringify({ error: 'Message required' }), { status: 400 });

    // 1. Caching
    const cacheKey = await getHash(`${expertiseLevel}:${message}`);
    const cachedResponse = await checkCache(supabase, cacheKey, expertiseLevel);
    if (cachedResponse) {
      console.log('Cache hit:', cacheKey);
      if (stream) {
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              choices: [{ delta: { content: cachedResponse.content } }],
              citations: cachedResponse.citations 
            })}\n\ndata: [DONE]\n\n`));
            controller.close();
          },
        });
        return new Response(readable, { headers: { 'Content-Type': 'text/event-stream' } });
      }
      return new Response(JSON.stringify({ ...cachedResponse, cached: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Parallel RAG and Safety Check
    const [context, safety] = await Promise.all([
      performHybridRAG(supabase, message),
      judgeMedicalAdvice(message, PERPLEXITY_API_KEY!, PERPLEXITY_MODEL)
    ]);

    const systemPrompt = buildSystemPrompt(expertiseLevel || 'Expert', safety.isMedical, context);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message },
    ];

    // 3. Perplexity Call
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${PERPLEXITY_API_KEY}` },
      body: JSON.stringify({ model: PERPLEXITY_MODEL, messages, temperature: 0.3, max_tokens: 2000, stream }),
    });

    if (!perplexityResponse.ok) throw new Error(`API Error: ${perplexityResponse.status}`);

    if (!stream) {
      const data = await perplexityResponse.json();
      const responsePayload = { content: data.choices?.[0]?.message?.content ?? '', citations: data.citations ?? [] };
      await updateCache(supabase, cacheKey, expertiseLevel, responsePayload);
      return new Response(JSON.stringify({ ...responsePayload, isMedical: safety.isMedical }), { headers: { 'Content-Type': 'application/json' } });
    }

    // 4. Streaming
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = perplexityResponse.body?.getReader();

    (async () => {
      let fullContent = '';
      let citations = [];
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.replace('data: ', '');
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              fullContent += parsed.choices?.[0]?.delta?.content ?? '';
              if (parsed.citations) citations = parsed.citations;
              await writer.write(encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`));
            } catch {}
          }
        }
        await writer.write(encoder.encode('data: [DONE]\n\n'));
        if (fullContent) await updateCache(supabase, cacheKey, expertiseLevel, { content: fullContent, citations });
      } finally {
        writer.close();
      }
    })();

    return new Response(readable, { headers: { 'Content-Type': 'text/event-stream' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
