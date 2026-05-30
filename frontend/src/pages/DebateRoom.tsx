import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import type { DebateArgument } from '../lib/database.types.supplement';
import { 
  Send, 
  ArrowLeft, 
  AlertCircle, 
  ShieldCheck, 
  Loader2,
  BrainCircuit,
  Flag
} from 'lucide-react';


export default function DebateRoom() {
  const { id: debateId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<DebateArgument[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [modelLoadingProgress, setModelLoadingProgress] = useState(0);
  const [debateStatus, setDebateStatus] = useState<string | null>('active');
  const scrollRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize Web Worker for Fallacy Detection
    workerRef.current = new Worker(new URL('../lib/fallacyWorker.ts', import.meta.url), {
      type: 'module'
    });

    workerRef.current.addEventListener('message', async (e) => {
      if (e.data.status === 'progress') {
        // Track model loading progress
        setModelLoadingProgress(e.data.progress.progress || 0);
      } else if (e.data.status === 'complete') {
        const { messageId, fallacies } = e.data;
        if (fallacies && fallacies.length > 0) {
          // Update the argument in Supabase with the detected fallacies
          await supabase.from('debate_arguments')
            .update({ fallacies })
            .eq('id', messageId);
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [debateRes, argsRes] = await Promise.all([
          (supabase as any).from('debates').select('status').eq('id', debateId).single(),
          (supabase as any).from('debate_arguments').select('*').eq('debate_id', debateId).order('created_at', { ascending: true })
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
          filter: `debate_id=eq.${debateId}`
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
          filter: `id=eq.${debateId}`
        },
        (payload) => {
          if (payload.new && (payload.new as any).status) {
            setDebateStatus((payload.new as any).status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [debateId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || !debateId || sending) return;

    setSending(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).from('debate_arguments').insert({
      debate_id: debateId,
      user_id: user.id,
      content: inputValue.trim()
    }).select().single();

    if (error) {
      console.error('Failed to post argument:', error);
    } else {
      setInputValue('');
      // Trigger client-side fallacy detection
      if (workerRef.current && data) {
        workerRef.current.postMessage({
          text: data.content,
          messageId: data.id
        });
      }

      // Trigger server-side fact checking
      supabase.functions.invoke('fact-check', {
        body: { argumentId: data.id, content: data.content }
      }).then(({ error }) => {
        if (error) console.error('Fact-check invocation failed:', error);
      });
    }
    setSending(false);
  };

  const handleEndDebate = async () => {
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-16 h-screen overflow-hidden bg-surface">
      {/* Header */}
      <header className="px-6 py-4 border-b border-outline-variant/15 bg-surface-container-low flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/debate')}
            className="p-2 hover:bg-surface-container-highest rounded-full transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-on-surface">Scientific Debate Arena</h2>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Real-time Session
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {debateStatus === 'active' && (
            <button 
              onClick={handleEndDebate}
              className="px-4 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold rounded-full border border-red-500/20 flex items-center gap-2 transition-all"
            >
              <Flag size={14} />
              End Debate
            </button>
          )}
          {modelLoadingProgress > 0 && modelLoadingProgress < 100 && (
            <div className="text-[10px] text-on-surface-variant font-bold uppercase">
              Loading AI Models: {Math.round(modelLoadingProgress)}%
            </div>
          )}
          <div className="px-4 py-1.5 bg-secondary/10 text-secondary text-xs font-bold rounded-full border border-secondary/20 flex items-center gap-2">
            <BrainCircuit size={14} />
            AI Moderator Active
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        <div className="max-w-4xl mx-auto w-full space-y-8">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isOwn = msg.user_id === user?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm border ${
                    isOwn 
                      ? 'bg-primary text-on-primary border-primary/20 rounded-tr-none' 
                      : 'bg-surface-container-high text-on-surface border-outline-variant/20 rounded-tl-none'
                  }`}>
                    <p className="leading-relaxed text-sm">{msg.content}</p>
                    
                    {/* AI Moderation Status */}
                    {(msg.fallacies?.length || msg.fact_check_score) && (
                      <div className={`mt-4 pt-3 border-t flex flex-col gap-2 ${
                        isOwn ? 'border-on-primary/10' : 'border-outline-variant/10'
                      }`}>
                        {msg.fallacies?.map((fallacy) => (
                          <div key={fallacy} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight text-red-400">
                            <AlertCircle size={10} />
                            Potential Fallacy: {fallacy}
                          </div>
                        ))}
                        {msg.fact_check_score && (
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight text-green-400">
                            <ShieldCheck size={10} />
                            Scientific Accuracy: {Math.round(msg.fact_check_score * 100)}%
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="mt-2 text-[10px] text-outline px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <footer className="p-6 bg-surface-container-low border-t border-outline-variant/15">
        {debateStatus === 'closed' ? (
          <div className="max-w-4xl mx-auto flex gap-4 p-4 items-center justify-center text-on-surface-variant bg-surface-container-highest rounded-2xl border border-outline-variant/30">
            <Flag size={20} className="text-primary" />
            <span className="font-bold">This debate has concluded. Badges and reputation have been awarded!</span>
          </div>
        ) : (
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-4">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Present your argument... (citing sources is encouraged)"
              className="flex-1 bg-surface-container-lowest border border-outline/20 rounded-2xl px-6 py-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || sending}
              className="bg-primary text-on-primary p-4 rounded-2xl shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
            >
              {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </form>
        )}
      </footer>
    </div>
  );
}
