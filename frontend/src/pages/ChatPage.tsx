import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Loader2, PanelLeftOpen, PanelLeftClose, Box } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import ChatMessageBubble from '../components/ChatMessageBubble';
import ChatInput from '../components/ChatInput';
import ChatHistory from '../components/ChatHistory';

// Lazy load heavy interactive components
const BrainAtlas = lazy(() => import('../components/BrainAtlas'));
const CitationPanel = lazy(() => import('../components/CitationPanel'));

import type { BrainRegion } from '../components/BrainAtlas';
import { EXPERTISE_LEVELS } from '../constants';
import { ExpertiseLevel } from '../types';
import {
  ChatMessage,
  ChatSession,
  Citation,
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
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expertiseLevel, setExpertiseLevel] = useState<ExpertiseLevel>(
    (profile?.expertise_level as ExpertiseLevel) ?? 'Expert'
  );
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [highlightRegion, setHighlightRegion] = useState<BrainRegion>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  // Simple keyword detection to highlight brain regions
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        const content = lastMessage.content.toLowerCase();
        if (content.includes('frontal') || content.includes('executive') || content.includes('prefrontal')) {
          setHighlightRegion('Frontal');
        } else if (content.includes('parietal') || content.includes('sensory') || content.includes('spatial')) {
          setHighlightRegion('Parietal');
        } else if (content.includes('temporal') || content.includes('auditory') || content.includes('language')) {
          setHighlightRegion('Temporal');
        } else if (content.includes('occipital') || content.includes('visual') || content.includes('vision')) {
          setHighlightRegion('Occipital');
        } else if (content.includes('cerebellum') || content.includes('motor') || content.includes('coordination')) {
          setHighlightRegion('Cerebellum');
        } else {
          setHighlightRegion(null);
        }
      }
    }
  }, [messages]);

  // Sync expertise level from profile
  useEffect(() => {
    if (profile?.expertise_level) {
      setExpertiseLevel(profile.expertise_level as ExpertiseLevel);
    }
  }, [profile?.expertise_level]);

  // Initialize a new session
  const initNewSession = useCallback(async (sessionId?: string, expertise?: string) => {
    try {
      const id = sessionId || createSessionId();
      const level = expertise || ((profile?.expertise_level as ExpertiseLevel) ?? 'Expert');
      setCurrentSessionId(id);
      setExpertiseLevel(level as ExpertiseLevel);

      if (!sessionId) {
        await createChatSession(id, level, undefined, user?.id);
      }

      // Load history for this session
      const history = await fetchConversationHistory(id);
      setMessages(history);
    } catch (err) {
      console.error('Error initializing session:', err);
    } finally {
      setLoading(false);
      hasLoadedRef.current = true;
    }
  }, [profile?.expertise_level, user?.id]);

  // Load sessions on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;

    async function load() {
      try {
        const sessions = await fetchChatSessions();
        if (sessions.length > 0) {
          // Load most recent session
          const latest = sessions[0];
          await initNewSession(latest.id, latest.expertise_level);
        } else {
          await initNewSession();
        }
      } catch (err) {
        console.error('Critical error loading sessions:', err);
        setLoading(false);
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

      {/* Expertise Level Selector & Atlas Toggle */}
      <div className="border-b border-outline-variant/10 bg-surface-container-low/50 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-all flex-shrink-0"
              title="Toggle conversation history"
            >
              {historyOpen ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider hidden sm:inline flex-shrink-0">
              Expertise
            </span>
            <div className="flex gap-1.5">
              {EXPERTISE_LEVELS.map((item) => {
                const isActive = item.level === expertiseLevel;
                return (
                  <button
                    key={item.level}
                    onClick={() => setExpertiseLevel(item.level)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {item.icon}
                    </span>
                    {item.level}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setAtlasOpen(!atlasOpen)}
            className={`p-1.5 rounded-lg transition-all flex items-center gap-2 px-3 flex-shrink-0 ${
              atlasOpen 
                ? 'bg-secondary text-on-secondary shadow-md' 
                : 'text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/20'
            }`}
          >
            <Box size={16} />
            <span className="text-[11px] font-bold uppercase tracking-tight hidden xs:inline">3D Atlas</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Messages + Optional Atlas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages Area */}
        <div className={`flex-1 flex flex-col overflow-y-auto transition-all duration-500 ${atlasOpen ? 'lg:pr-4' : ''}`}>
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
                <p className="text-on-surface-variant leading-relaxed mb-8 text-sm">
                  Ask me anything about neuroscience — from basic neuroanatomy to cutting-edge research.
                  I'll adapt my responses to your expertise level.
                </p>

                {/* Suggested Questions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {[
                    'What is a neuron?',
                    'Explain long-term potentiation',
                    'How does fMRI work?',
                    'Function of the Prefrontal Cortex',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="px-4 py-3 bg-surface-container-lowest border border-outline-variant/15 rounded-xl text-xs text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all font-medium"
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
                  <ChatMessageBubble 
                    key={msg.id} 
                    message={msg} 
                    onCitationClick={setSelectedCitation}
                  />
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

        {/* Brain Atlas Sidebar */}
        <AnimatePresence>
          {atlasOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0, x: 20 }}
              animate={{ opacity: 1, width: '40%', x: 0 }}
              exit={{ opacity: 0, width: 0, x: 20 }}
              className="hidden lg:block h-full border-l border-outline-variant/10 bg-surface-container-lowest/30 p-4"
            >
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-on-surface-variant" />
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant">Loading 3D Atlas...</span>
                  </div>
                </div>
              }>
                <BrainAtlas highlightRegion={highlightRegion} />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="max-w-5xl mx-auto w-full">
        <ChatInput onSend={handleSend} disabled={generating} />
      </div>

      {/* Citation Details Panel */}
      <AnimatePresence>
        {selectedCitation && (
          <Suspense fallback={null}>
            <CitationPanel
              citation={selectedCitation}
              onClose={() => setSelectedCitation(null)}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
