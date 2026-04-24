// Supabase Edge Function: chat
// Handles AI-powered neuroscience Q&A with modularized logic
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import { getHash, checkCache, updateCache } from './cache.ts';
import { performHybridRAG } from './rag.ts';
import { judgeUserIntent } from './guardrails.ts';
import { getPersonaPrompt } from './prompts.ts';
import { detectExpertiseLevel } from './lens.ts';
import { ExpertiseLevel } from './types.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-1.5-flash';

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

interface ChatRequest {
  message: string;
  expertiseLevel: ExpertiseLevel;
  conversationHistory: { role: string; content: string }[];
  stream?: boolean;
}

// Removed buildSystemPrompt in favor of modular prompts.ts

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

    // 2. Parallel RAG, Safety Check (Intent/Safety), and Optional Expertise Detection
    const tasks: Promise<any>[] = [
      performHybridRAG(supabase, message),
      judgeUserIntent(message, GEMINI_API_KEY!, GEMINI_MODEL)
    ];

    if (expertiseLevel === 'Auto') {
      tasks.push(detectExpertiseLevel(message, GEMINI_API_KEY!, GEMINI_MODEL));
    }

    const [context, safety, detectedLens] = await Promise.all(tasks);
    
    const activeExpertise = (expertiseLevel === 'Auto' && detectedLens) 
      ? detectedLens.level 
      : expertiseLevel;

    const personaPrompt = getPersonaPrompt(activeExpertise || 'Expert', safety.intent);
    
    // Add context and mood mirror to the persona prompt
    const moodInstruction = safety.sentiment === 'frustrated' 
      ? "User seems frustrated. Be extra encouraging, use simpler terms, and offer a supportive analogy." 
      : safety.sentiment === 'skeptical' 
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

    // 3. Gemini Call
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GEMINI_API_KEY}` },
      body: JSON.stringify({ model: GEMINI_MODEL, messages, temperature: 0.3, max_tokens: 2000, stream }),
    });

    if (!geminiResponse.ok) throw new Error(`API Error: ${geminiResponse.status}`);

    if (!stream) {
      const data = await geminiResponse.json();
      const responsePayload = { content: data.choices?.[0]?.message?.content ?? '', citations: data.citations ?? [] };
      await updateCache(supabase, cacheKey, activeExpertise, responsePayload);
      return new Response(JSON.stringify({ ...responsePayload, isMedical: safety.isMedical }), { headers: { 'Content-Type': 'application/json' } });
    }

    // 4. Streaming
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
        if (fullContent) await updateCache(supabase, cacheKey, activeExpertise, { content: fullContent, citations });
      } finally {
        writer.close();
      }
    })();

    return new Response(readable, { headers: { 'Content-Type': 'text/event-stream' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
