import { supabase } from '../supabase';
import { SemanticScholarResponseSchema } from '../schemas';
import { getMockResponseText, mockCitations } from '../mocks/ai-responses';
import * as Sentry from '@sentry/react';
import { ChatRequest, ChatResponse, Citation } from '../ai.types';

/**
 * Fetch paper metadata from Semantic Scholar API.
 */
export async function fetchCitationDetails(citation: Citation) {
  try {
    let query = '';
    if (citation.doi) {
      query = `DOI:${citation.doi}`;
    } else {
      query = citation.title;
    }

    const response = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(
        query
      )}&fields=title,authors,year,abstract,citationCount,influentialCitationCount,externalIds,venue&limit=1`
    );

    if (!response.ok) return null;

    const rawData = await response.json();
    const data = SemanticScholarResponseSchema.parse(rawData);

    if (!data.data || data.data.length === 0) return null;

    const paper = data.data[0];
    return {
      title: paper.title ?? '',
      abstract: paper.abstract,
      citationCount: paper.citationCount,
      influentialCitationCount: paper.influentialCitationCount,
      venue: paper.venue,
      year: paper.year,
      authors: paper.authors?.map((a) => a.name) || [],
    };
  } catch (error) {
    console.error('Error fetching citation details:', error);
    return null;
  }
}

/**
 * Call the AI backend to generate a streaming response.
 */
export async function* generateAIResponseStream(
  request: ChatRequest
): AsyncGenerator<{ content?: string; citations?: Citation[]; done?: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { ...request, stream: true },
    });

    if (error || !data || !(data instanceof ReadableStream)) {
      console.warn('Edge function streaming unavailable, using fallback:', error);
      Sentry.captureException(error || new Error('Edge function streaming unavailable'));
      const fallback = getFallbackResponse(request);
      yield { content: fallback.content, citations: fallback.citations, done: true };
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.replace('data: ', '').trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content ?? '';
            const citations = parsed.citations ?? [];

            if (content) {
              accumulatedContent += content;
              yield { content: accumulatedContent };
            }
            if (citations.length > 0) {
              yield { citations };
            }
          } catch (e) {
            console.error('Error parsing stream chunk:', e, jsonStr);
          }
        }
      }
    }

    yield { done: true };
  } catch (err) {
    console.error('Streaming error:', err);
    Sentry.captureException(err);
    const fallback = getFallbackResponse(request);
    yield { content: fallback.content, citations: fallback.citations, done: true };
  }
}

/**
 * Call the AI backend to generate a response.
 * Falls back to a mock response if the edge function is unavailable.
 */
export async function generateAIResponse(request: ChatRequest): Promise<ChatResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: request,
    });

    if (error || !data) {
      console.warn('Edge function unavailable, using fallback:', error);
      Sentry.captureException(error || new Error('Edge function unavailable'));
      return getFallbackResponse(request);
    }

    return {
      content: data.content ?? data.response ?? data.message ?? '',
      citations: data.citations ?? [],
    };
  } catch (err) {
    Sentry.captureException(err);
    return getFallbackResponse(request);
  }
}

/**
 * Fallback response when the AI backend is unavailable.
 */
function getFallbackResponse(request: ChatRequest): ChatResponse {
  return {
    content: getMockResponseText(request.expertiseLevel, request.message),
    citations: mockCitations,
  };
}
