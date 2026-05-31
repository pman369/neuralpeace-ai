import { Json } from './database.types';

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
  queryEmbedding?: number[];
}

export interface ChatResponse {
  content: string;
  citations: Citation[];
}
