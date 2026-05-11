export * from './ai.types';
export * from './repositories/chat.repository';
export * from './services/ai.service';

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
