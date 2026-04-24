import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { DebateTopic, Debate } from '../lib/database.types.supplement';
import { MessagesSquare, Trophy, Users, Loader2, ArrowRight } from 'lucide-react';


export default function DebateLobby() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<DebateTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTopics() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('debate_topics')
        .select('*')
        .eq('is_active', true);
      
      if (!error && data) setTopics(data as DebateTopic[]);
      setLoading(false);
    }
    loadTopics();
  }, []);

  const handleJoinDebate = async (topicId: string) => {
    // For now, we find an existing 'waiting' or 'active' debate or create one
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('debates')
      .select('id')
      .eq('topic_id', topicId)
      .neq('status', 'finished')
      .limit(1)
      .single();

    if (existing) {
      navigate(`/debate/${(existing as Debate).id}`);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: created } = await (supabase as any)
        .from('debates')
        .insert({ topic_id: topicId, status: 'waiting' })
        .select()
        .single();
      
      if (created) navigate(`/debate/${(created as Debate).id}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-24 px-6 max-w-5xl mx-auto w-full">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-on-surface font-headline mb-4 flex items-center gap-4">
          <MessagesSquare size={32} className="text-secondary" />
          Mind Meld Arena
        </h1>
        <p className="text-on-surface-variant text-lg max-w-2xl">
          Enter the arena to debate neuroscience controversies. Fact-check your peers, 
          avoid logical fallacies, and earn neural reputation.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {topics.map((topic) => (
            <motion.div
              key={topic.id}
              whileHover={{ y: -5 }}
              className="bg-surface-container-low border border-outline-variant/15 rounded-2xl p-6 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full uppercase tracking-widest">
                  {topic.category}
                </span>
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
                  {topic.difficulty}
                </span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-3">{topic.title}</h3>
              <p className="text-sm text-on-surface-variant line-clamp-3 mb-6 flex-1">
                {topic.description}
              </p>
              <button
                onClick={() => handleJoinDebate(topic.id)}
                className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95"
              >
                Join Debate
                <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats Quick View */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-surface-container-highest/90 backdrop-blur-xl border border-outline-variant/20 px-8 py-4 rounded-3xl shadow-2xl flex gap-12 items-center">
        <div className="flex items-center gap-3">
          <Trophy size={18} className="text-secondary" />
          <div>
            <div className="text-[10px] font-bold text-outline uppercase">Reputation</div>
            <div className="text-sm font-bold text-on-surface">1,240</div>
          </div>
        </div>
        <div className="w-px h-8 bg-outline-variant/20" />
        <div className="flex items-center gap-3">
          <Users size={18} className="text-primary" />
          <div>
            <div className="text-[10px] font-bold text-outline uppercase">Active Debates</div>
            <div className="text-sm font-bold text-on-surface">{Math.floor(Math.random() * 10) + 2}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
