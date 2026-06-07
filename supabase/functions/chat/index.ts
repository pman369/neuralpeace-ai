// Supabase Edge Function: chat
// Handles AI-powered neuroscience Q&A with modularized logic
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { getHash, checkCache, updateCache } from './cache.ts';
import { performHybridRAG } from './rag.ts';
import { analyzeMessage } from './guardrails.ts';
import { enqueueGemini } from './batcher.ts';
import { getPersonaPrompt } from './prompts.ts';
import { chatRateLimiter } from './rateLimiter.ts';
import { validateChatRequest } from './validator.ts';

import { ExpertiseLevel } from './types.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { Logger } from '../_shared/logger.ts';

const logger = new Logger();

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-1.5-flash';

interface ChatRequest {
  message: string;
  expertiseLevel: ExpertiseLevel;
  conversationHistory: { role: string; content: string }[];
  stream?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Client for user authentication and RLS
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Rate Limiting
    const rateLimitKey = user.id || req.headers.get('x-forwarded-for') || 'anonymous';
    if (chatRateLimiter.isLimitExceeded(rateLimitKey)) {
      logger.warn('Rate limit exceeded', { userId: user.id });
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admin client for global cache (if needed to bypass cache RLS)
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Payload Parsing & Validation
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const valErrors = validateChatRequest(body);
    if (valErrors.length > 0) {
      logger.warn('Validation failed', { errors: valErrors });
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: valErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, expertiseLevel, conversationHistory, stream = true, queryEmbedding: clientEmbedding } = body;

    // 1. Caching
    const cacheKey = await getHash(`${expertiseLevel}:${message}`);
    const cachedResponse = await checkCache(supabaseAdmin, cacheKey, expertiseLevel);
    if (cachedResponse) {
      logger.info('Cache hit', { cacheKey, expertiseLevel });
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
        return new Response(readable, { headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' } });
      }
      return new Response(JSON.stringify({ ...cachedResponse, cached: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. Parallel RAG and Coalesced Message Analysis (Combined Intent, Safety, & Expertise Detection)
    const tasks: Promise<any>[] = [
      performHybridRAG(supabase, message, clientEmbedding),
      analyzeMessage(message, GEMINI_API_KEY!, expertiseLevel === 'Auto', GEMINI_MODEL)
    ];

    const [context, analysis] = await Promise.all(tasks);
    
    const activeExpertise = (expertiseLevel === 'Auto' && analysis.detectedExpertise) 
      ? analysis.detectedExpertise as ExpertiseLevel
      : expertiseLevel;

    const personaPrompt = getPersonaPrompt(activeExpertise || 'Expert', analysis.intent);
    
    // Add context and mood mirror to the persona prompt
    const moodInstruction = analysis.sentiment === 'frustrated' 
      ? "User seems frustrated. Be extra encouraging, use simpler terms, and offer a supportive analogy." 
      : analysis.sentiment === 'skeptical' 
        ? "User is skeptical. Focus heavily on evidence, experimental data, and technical rigor." 
        : "";

    const systemPrompt = `${personaPrompt}
      
${moodInstruction}

Context from Knowledge Base:
${context}
      
Answer based on the context provided. If unsure, state it. Cite sources using [1], [2], etc.
Educational Tool ONLY. Not Medical Advice.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message },
    ];

    // 3. Gemini Call (batched for non‑streaming)
    let geminiResult: { content: string; citations: any[] };
    if (!stream) {
      // Use the batcher to coalesce rapid requests
      const geminiPayload = {
        role: 'user',
        content: message,
      };
      const systemMessage = { role: 'system', content: systemPrompt };
      const batchResult = await enqueueGemini([systemMessage, geminiPayload], false, GEMINI_API_KEY!, GEMINI_MODEL);
      geminiResult = { content: batchResult.content, citations: batchResult.citations };
      // Cache the non‑stream response
      await updateCache(supabaseAdmin, cacheKey, activeExpertise, { content: geminiResult.content, citations: geminiResult.citations });
      return new Response(JSON.stringify({ ...geminiResult, isMedical: analysis.isMedical }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } else {
      // Fallback to original streaming implementation for now
      const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GEMINI_API_KEY}` },
        body: JSON.stringify({ model: GEMINI_MODEL, messages, temperature: 0.3, max_tokens: 2000, stream }),
      });
      if (!geminiResponse.ok) throw new Error(`API Error: ${geminiResponse.status}`);
      // Streaming logic (unchanged)
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const reader = geminiResponse.body?.getReader();
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
          if (fullContent) await updateCache(supabaseAdmin, cacheKey, activeExpertise, { content: fullContent, citations });
        } finally {
          writer.close();
        }
      })();
      return new Response(readable, { headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' } });
    }
  } catch (error) {
    logger.error('Chat function error', { error: error.message });
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
