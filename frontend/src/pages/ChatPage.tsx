import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Loader2, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import ChatMessageBubble from '../components/ChatMessageBubble';
import ChatInput from '../components/ChatInput';
import ChatHistory from '../components/ChatHistory';
import { EXPERTISE_LEVELS } from '../constants';
import { ExpertiseLevel } from '../types';
import {
  ChatMessage,
  ChatSession,
  createSessionId,
  createChatSession,
  fetchConversationHistory,
  fetchChatSessions,
  saveMessage,
  generateAIResponse,
  generateAIResponseStream,
  updateSessionMetadata,
} from '../lib/ai';

export default function ChatPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expertiseLevel, setExpertiseLevel] = useState<ExpertiseLevel>(
    (profile?.expertise_level as ExpertiseLevel) ?? 'Expert'
  );
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync expertise level from profile
  useEffect(() => {
    if (profile?.expertise_level) {
      setExpertiseLevel(profile.expertise_level as ExpertiseLevel);
    }
  }, [profile?.expertise_level]);

  // Initialize a new session
  const initNewSession = useCallback(async (sessionId?: string, expertise?: string) => {
    const id = sessionId || createSessionId();
    const level = expertise || ((profile?.expertise_level as ExpertiseLevel) ?? 'Expert');
    setCurrentSessionId(id);
    setExpertiseLevel(level as ExpertiseLevel);

    if (!sessionId) {
      await createChatSession(id, level);
    }

    // Load history for this session
    const history = await fetchConversationHistory(id);
    setMessages(history);
    setLoading(false);
  }, [profile?.expertise_level]);

  // Load sessions on mount
  useEffect(() => {
    async function load() {
      const sessions = await fetchChatSessions();
      if (sessions.length > 0) {
        // Load most recent session
        const latest = sessions[0];
        await initNewSession(latest.id, latest.expertise_level);
      } else {
        await initNewSession();
      }
    }
    load();
  }, [initNewSession]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewChat = useCallback(() => {
    setLoading(true);
    sessionStorage.removeItem('chat_session_id');
    initNewSession();
    setHistoryOpen(false);
  }, [initNewSession]);

  const handleSelectSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    await initNewSession(sessionId);
    setHistoryOpen(false);
  }, [initNewSession]);

  const handleSend = useCallback(
    async (content: string) => {
      if (!currentSessionId) return;

      // Add user message immediately
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setGenerating(true);

      try {
        // Save user message to DB
        await saveMessage(currentSessionId, 'user', content, expertiseLevel);

        // Update session: increment message count, set title from first message
        const isFirstMessage = messages.length === 0;
        await updateSessionMetadata(currentSessionId, {
          message_count: messages.length + 2,
          ...(isFirstMessage && { title: content.slice(0, 50) + (content.length > 50 ? '...' : '') }),
        });

        // Create a placeholder assistant message
        const assistantMsgId = crypto.randomUUID();
        const placeholderMsg: ChatMessage = {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          citations: [],
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, placeholderMsg]);

        // Build conversation history for AI context
        const history = messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({ role: m.role, content: m.content }));
        history.push({ role: 'user', content });

        // Generate streaming AI response
        const stream = generateAIResponseStream({
          message: content,
          expertiseLevel,
          conversationHistory: history,
        });

        let finalContent = '';
        let finalCitations: any[] = [];

        for await (const chunk of stream) {
          if (chunk.content !== undefined) {
            finalContent = chunk.content;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, content: finalContent } : m
              )
            );
          }
          if (chunk.citations !== undefined) {
            finalCitations = chunk.citations;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, citations: finalCitations } : m
              )
            );
          }
        }

        // Save the final completed message to DB
        await saveMessage(
          currentSessionId,
          'assistant',
          finalContent,
          expertiseLevel,
          finalCitations
        );
      } catch (err) {
        console.error('Error generating response:', err);
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '⚠️ Sorry, I encountered an error generating a response. Please try again.',
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setGenerating(false);
      }
    },
    [currentSessionId, messages, expertiseLevel]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Loader2 size={20} className="animate-spin" />
          <span>Loading conversation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-16 relative">
      {/* Chat History Sidebar */}
      <ChatHistory
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        isOpen={historyOpen}
        onToggle={() => setHistoryOpen(!historyOpen)}
      />

      {/* Expertise Level Selector */}
      <div className="border-b border-outline-variant/10 bg-surface-container-low/50 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-all"
            title="Toggle conversation history"
          >
            {historyOpen ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Expertise:
          </span>
          <div className="flex gap-1.5 overflow-x-auto">
            {EXPERTISE_LEVELS.map((item) => {
              const isActive = item.level === expertiseLevel;
              return (
                <button
                  key={item.level}
                  onClick={() => setExpertiseLevel(item.level)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                >
                  <span className="material-symbols-outlined text-[12px] align-middle mr-1">
                    {item.icon}
                  </span>
                  {item.level}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-lg"
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot size={32} className="text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-on-surface font-headline mb-3">
                Neuroscience AI Assistant
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-8">
                Ask me anything about neuroscience — from basic neuroanatomy to cutting-edge research.
                I'll adapt my responses to your expertise level.
              </p>

              {/* Suggested Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {[
                  'What is a neuron?',
                  'Explain long-term potentiation',
                  'How does fMRI work?',
                  'What are the ethical implications of BCIs?',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="px-4 py-3 bg-surface-container-lowest border border-outline-variant/15 rounded-xl text-sm text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full px-6 py-6 space-y-6">
            <AnimatePresence>
              {messages.map((msg) => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {generating && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-secondary" />
                  <span className="text-sm text-on-surface-variant">Thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput onSend={handleSend} disabled={generating} />
    </div>
  );
}
