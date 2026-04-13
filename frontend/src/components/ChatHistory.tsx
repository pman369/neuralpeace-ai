import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, MessageSquare, Trash2, Clock } from 'lucide-react';
import type { ChatSession } from '../lib/ai';
import { fetchChatSessions, deleteChatSession } from '../lib/ai';

interface ChatHistoryProps {
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ChatHistory: FC<ChatHistoryProps> = ({
  currentSessionId,
  onSelectSession,
  onNewChat,
  isOpen,
  onToggle,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const data = await fetchChatSessions();
    setSessions(data);
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setDeleting(sessionId);
    const success = await deleteChatSession(sessionId);
    if (success) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        onNewChat();
      }
    }
    setDeleting(null);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed top-20 left-2 z-40 w-9 h-9 rounded-lg bg-surface-container-low border border-outline-variant/15 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all shadow-sm ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <MessageSquare size={16} />
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-16 left-0 z-30 w-72 h-[calc(100vh-4rem)] bg-surface-container-low border-r border-outline-variant/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/10">
              <h3 className="font-semibold text-on-surface text-sm">Conversations</h3>
              <button
                onClick={onNewChat}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-medium hover:bg-primary-container transition-colors"
              >
                <Plus size={12} />
                New
              </button>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto py-2">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-on-surface-variant text-sm">
                  Loading...
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
                  <MessageSquare size={24} className="mb-2 opacity-30" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-0.5 px-2">
                  {sessions.map((session) => {
                    const isActive = session.id === currentSessionId;
                    return (
                      <motion.div
                        key={session.id}
                        whileHover={{ backgroundColor: 'var(--color-surface-container-high)' }}
                        onClick={() => onSelectSession(session.id)}
                        className={`group flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                          isActive
                            ? 'bg-surface-container-highest text-primary'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        <MessageSquare size={14} className="mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{session.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-outline flex items-center gap-0.5">
                              <Clock size={8} />
                              {formatTime(session.updated_at)}
                            </span>
                            <span className="text-[10px] text-outline">
                              {session.message_count} msg{session.message_count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, session.id)}
                          disabled={deleting === session.id}
                          className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-red-500 transition-all flex-shrink-0"
                        >
                          {deleting === session.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatHistory;
