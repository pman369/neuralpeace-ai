import { supabase } from './supabase';
import type { Json } from './database.types';
import { SemanticScholarResponseSchema } from './schemas';
import { getMockResponseText, mockCitations } from './mocks/ai-responses';
import * as Sentry from '@sentry/react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  expertise_level: string;
  message_count: number;
  updated_at: string;
  created_at: string;
}

export interface Citation {
  title: string;
  authors?: string[];
  year?: number;
  doi?: string;
  journal?: string;
}

export interface ChatRequest {
  message: string;
  expertiseLevel: string;
  conversationHistory: { role: string; content: string }[];
}

export interface ChatResponse {
  content: string;
  citations: Citation[];
}

/**
 * Generate a unique session ID for the current chat session.
 */
export function createSessionId(): string {
  const stored = sessionStorage.getItem('chat_session_id');
  if (stored) return stored;
  
  let id: string;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    id = crypto.randomUUID();
  } else {
    // Fallback for non-secure contexts or older browsers
    id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  sessionStorage.setItem('chat_session_id', id);
  return id;
}

/**
 * Create a new chat session in the database.
 */
export async function createChatSession(
  sessionId: string,
  expertiseLevel: string,
  title?: string,
  userId?: string
): Promise<string> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      id: sessionId,
      title: title ?? 'New Conversation',
      expertise_level: expertiseLevel,
      message_count: 0,
      user_id: userId,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating session:', error);
    return sessionId;
  }
  return data.id;
}

/**
 * Fetch all chat sessions, ordered by most recent.
 */
export async function fetchChatSessions(limit = 20): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('id, title, expertise_level, message_count, updated_at, created_at')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    expertise_level: row.expertise_level ?? 'Expert',
    message_count: row.message_count ?? 0,
    updated_at: row.updated_at,
    created_at: row.created_at,
  }));
}

/**
 * Delete a chat session and its messages.
 */
export async function deleteChatSession(sessionId: string): Promise<boolean> {
  // Delete messages first
  await supabase.from('chat_messages').delete().eq('session_id', sessionId);
  const { error } = await supabase.from('chat_sessions').delete().eq('id', sessionId);
  if (error) {
    console.error('Error deleting session:', error);
    return false;
  }
  return true;
}

/**
 * Update session title and message count.
 */
export async function updateSessionMetadata(
  sessionId: string,
  updates: { title?: string; message_count?: number }
): Promise<void> {
  const { error } = await supabase
    .from('chat_sessions')
    .update(updates)
    .eq('id', sessionId);
  if (error) console.error('Error updating session:', error);
}

/**
 * Fetch conversation history for a session from Supabase.
 */
export async function fetchConversationHistory(
  sessionId: string,
  limit = 50
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, role, content, citations, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching conversation:', error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    role: row.role as 'user' | 'assistant' | 'system',
    content: row.content,
    citations: (row.citations as unknown as Citation[]) ?? [],
    created_at: row.created_at,
  }));
}

/**
 * Save a message to Supabase and return it.
 */
export async function saveMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  expertiseLevel: string,
  citations: Citation[] = []
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      role,
      content,
      expertise_level: expertiseLevel,
      citations: (citations.length > 0 ? citations : []) as unknown as Json,
    })
    .select('id, role, content, citations, created_at')
    .single();

  if (error) {
    console.error('Error saving message:', error);
    return null;
  }

  return {
    id: data.id,
    role: data.role as 'user' | 'assistant' | 'system',
    content: data.content,
    citations: (data.citations as unknown as Citation[]) ?? [],
    created_at: data.created_at,
  };
}

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
export async function generateAIResponse(
  request: ChatRequest
): Promise<ChatResponse> {
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
