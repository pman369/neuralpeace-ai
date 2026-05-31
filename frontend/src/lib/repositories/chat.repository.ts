import { supabase } from '../supabase';
import type { Json } from '../database.types';
import { ChatMessage, ChatSession, Citation } from '../ai.types';

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
