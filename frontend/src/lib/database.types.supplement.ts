/**
 * Supplemental database types for tables that post-date the last
 * auto-generated database.types.ts snapshot (Mind Meld Arena tables).
 * When the types file is next regenerated via `supabase gen types`,
 * these declarations should be removed.
 */

export interface DebateTopic {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  is_active: boolean;
  created_at: string;
}

export interface Debate {
  id: string;
  topic_id: string;
  status: 'waiting' | 'active' | 'finished';
  started_at: string | null;
  ended_at: string | null;
  participant_count: number;
  created_at: string;
}

export interface DebateArgument {
  id: string;
  debate_id: string;
  user_id: string;
  content: string;
  fact_check_score: number | null;
  fallacies: string[] | null;
  created_at: string;
}
