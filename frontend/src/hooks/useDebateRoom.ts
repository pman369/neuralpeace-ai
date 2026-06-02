import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { DebateArgument } from '../lib/database.types.supplement';

export function useDebateRoom(debateId: string | undefined) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DebateArgument[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [modelLoadingProgress, setModelLoadingProgress] = useState(0);
  const [debateStatus, setDebateStatus] = useState<string | null>('active');
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize Web Worker for Fallacy Detection
    workerRef.current = new Worker(new URL('../lib/fallacyWorker.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current.addEventListener('message', async (e) => {
      if (e.data.status === 'progress') {
        setModelLoadingProgress(e.data.progress.progress || 0);
      } else if (e.data.status === 'complete') {
        const { messageId, fallacies } = e.data;
        if (fallacies && fallacies.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('debate_arguments').update({ fallacies }).eq('id', messageId);
        }
      }
    });

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (!debateId) return;

    // 1. Initial Load
    async function loadData() {
      try {
        const [debateRes, argsRes] = await Promise.all([
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase as any).from('debates').select('status').eq('id', debateId).single(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase as any)
            .from('debate_arguments')
            .select('*')
            .eq('debate_id', debateId)
            .order('created_at', { ascending: true }),
        ]);

        if (!debateRes.error && debateRes.data) setDebateStatus(debateRes.data.status);
        if (!argsRes.error && argsRes.data) setMessages(argsRes.data as DebateArgument[]);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // 2. Real-time Subscription
    const channel = supabase
      .channel(`debate_${debateId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'debate_arguments',
          filter: `debate_id=eq.${debateId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as DebateArgument]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'debates',
          filter: `id=eq.${debateId}`,
        },
        (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (payload.new && (payload.new as any).status) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setDebateStatus((payload.new as any).status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [debateId]);

  const sendArgument = async (text: string) => {
    if (!text.trim() || !user || !debateId || sending) return;

    setSending(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('debate_arguments')
      .insert({
        debate_id: debateId,
        user_id: user.id,
        content: text.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to post argument:', error);
    } else {
      if (workerRef.current && data) {
        workerRef.current.postMessage({
          text: data.content,
          messageId: data.id,
        });
      }

      supabase.functions
        .invoke('fact-check', {
          body: { argumentId: data.id, content: data.content },
        })
        .then(({ error }) => {
          if (error) console.error('Fact-check invocation failed:', error);
        });
    }
    setSending(false);
  };

  const endDebate = async () => {
    if (!debateId || debateStatus === 'closed') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('debates')
      .update({ status: 'closed', ended_at: new Date().toISOString() })
      .eq('id', debateId);

    if (error) {
      console.error('Failed to end debate:', error);
    } else {
      setDebateStatus('closed');
    }
  };

  return {
    messages,
    loading,
    sending,
    modelLoadingProgress,
    debateStatus,
    sendArgument,
    endDebate,
    user,
  };
}
