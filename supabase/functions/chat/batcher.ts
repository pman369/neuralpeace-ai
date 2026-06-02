import type { ChatMessage } from './types.ts';

/**
 * Simple Gemini request batcher.
 *
 * It groups incoming chat requests that arrive within a short time window
 * (default 100 ms) and executes them sequentially. This reduces the number of
 * concurrent Gemini fetches and provides a single place to add true multi‑request
 * batching later.
 */

type GeminiResult = {
  content: string;
  citations: any[];
};

type BatchItem = {
  messages: ChatMessage[];
  stream: boolean;
  resolve: (value: GeminiResult) => void;
  reject: (reason?: any) => void;
};

const BATCH_WINDOW_MS = Number(Deno.env.get('GEMINI_BATCH_WINDOW_MS') || '100');
const MAX_BATCH_SIZE = Number(Deno.env.get('GEMINI_BATCH_MAX_SIZE') || '10');

let queue: BatchItem[] = [];
let timer: number | null = null;

/**
 * Enqueue a request to the Gemini API.
 * Returns a promise that resolves with the Gemini result.
 */
export async function enqueueGemini(
  messages: ChatMessage[],
  stream: boolean,
  apiKey: string,
  model: string = 'gemini-1.5-flash'
): Promise<GeminiResult> {
  return new Promise<GeminiResult>((resolve, reject) => {
    queue.push({ messages, stream, resolve, reject });
    if (!timer) {
      timer = setTimeout(processQueue, BATCH_WINDOW_MS) as unknown as number;
    }
  });
}

async function processQueue() {
  timer = null;
  const currentBatch = queue.splice(0, MAX_BATCH_SIZE);
  // Process each item sequentially (still reduces concurrent load)
  for (const item of currentBatch) {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Deno.env.get('GEMINI_API_KEY')}` },
        body: JSON.stringify({ model, messages: item.messages, temperature: 0.3, max_tokens: 2000, stream: item.stream }),
      });
      if (!response.ok) throw new Error(`Gemini API error ${response.status}`);
      if (item.stream) {
        // Streaming not supported in batcher – fallback to non‑streaming path
        throw new Error('Streaming not supported in batcher');
      }
      const data = await response.json();
      const result: GeminiResult = { content: data.choices?.[0]?.message?.content ?? '', citations: data.citations ?? [] };
      item.resolve(result);
    } catch (e) {
      item.reject(e);
    }
  }
  // If more items remain, schedule next batch
  if (queue.length > 0) {
    timer = setTimeout(processQueue, BATCH_WINDOW_MS) as unknown as number;
  }
}
