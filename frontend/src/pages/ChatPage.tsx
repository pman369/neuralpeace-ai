import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { updateActiveSession } from '../lib/auth';
import ChatInput from '../components/ChatInput';
import ChatHistory from '../components/ChatHistory';
import ExpertiseSelector from '../components/ExpertiseSelector';
import AtlasSidebar from '../components/AtlasSidebar';
import ChatView from '../components/ChatView';

// Lazy load CitationPanel
const CitationPanel = lazy(() => import('../components/CitationPanel'));

import type { BrainRegion } from '../components/BrainAtlas';
import { ExpertiseLevel } from '../types';
import {
  ChatMessage,
  Citation,
  createSessionId,
  createChatSession,
  fetchConversationHistory,
  fetchChatSessions,
  saveMessage,
  generateAIResponseStream,
  updateSessionMetadata,
} from '../lib/ai';

export default function ChatPage() {
  const { user, profile, refreshProfile } = useAuth();
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
  const [isInitializing, setIsInitializing] = useState(true);

  // Intelligent Atlas Triggers & Region Highlighting
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        const content = lastMessage.content.toLowerCase();
        
        // Auto-open atlas for anatomical responses
        if (content.includes('🎨') || content.includes('visualize') || content.includes('metaphor')) {
          setAtlasOpen(true);
        }

        // Region detection
        if (content.match(/frontal|prefrontal|executive|decision|personality|motor cortex/)) {
          setHighlightRegion('Frontal');
        } else if (content.match(/parietal|sensory|spatial|integration|proprioception/)) {
          setHighlightRegion('Parietal');
        } else if (content.match(/temporal|auditory|language|memory|hippocampus|wernicke/)) {
          setHighlightRegion('Temporal');
        } else if (content.match(/occipital|visual|vision|striate/)) {
          setHighlightRegion('Occipital');
        } else if (content.match(/cerebellum|coordination|balance|motor learning/)) {
          setHighlightRegion('Cerebellum');
        } else {
          setHighlightRegion(null);
        }
      }
    }
  }, [messages]);

  // Initialize a session
  const initSession = useCallback(async (sessionId?: string, expertise?: string) => {
    try {
      const id = sessionId || createSessionId();
      const level = expertise || ((profile?.expertise_level as ExpertiseLevel) ?? 'Expert');
      
      setCurrentSessionId(id);
      setExpertiseLevel(level as ExpertiseLevel);

      // Create in DB if it's a new random ID
      if (!sessionId) {
        await createChatSession(id, level, undefined, user?.id);
      }

      // Load history
      const history = await fetchConversationHistory(id);
      setMessages(history);

      // Persist as active session if authenticated
      if (user?.id && sessionId !== profile?.active_session_id) {
        await updateActiveSession(user.id, id);
        // We don't necessarily need to refresh the whole profile here, 
        // as we already have the state updated locally via setCurrentSessionId
      }
    } catch (err) {
      console.error('Error initializing session:', err);
    } finally {
      setLoading(false);
      setIsInitializing(false);
    }
  }, [profile?.expertise_level, profile?.active_session_id, user?.id]);

  // Load initial session on mount (prioritize active session from profile)
  useEffect(() => {
    if (!isInitializing) return;

    async function load() {
      try {
        // 1. Check profile for active session
        if (profile?.active_session_id) {
          await initSession(profile.active_session_id, profile.expertise_level || undefined);
          return;
        }

        // 2. Check for recent sessions
        const sessions = await fetchChatSessions();
        if (sessions.length > 0) {
          const latest = sessions[0];
          await initSession(latest.id, latest.expertise_level);
        } else {
          // 3. Start fresh
          await initSession();
        }
      } catch (err) {
        console.error('Critical error loading sessions:', err);
        setLoading(false);
      }
    }
    load();
  }, [initSession, profile, isInitializing]);

  const handleNewChat = useCallback(() => {
    setLoading(true);
    sessionStorage.removeItem('chat_session_id');
    initSession();
    setHistoryOpen(false);
  }, [initSession]);

  const handleSelectSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    await initSession(sessionId);
    setHistoryOpen(false);
  }, [initSession]);

  const handleSend = useCallback(
    async (content: string) => {
      if (!currentSessionId) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setGenerating(true);

      try {
        await saveMessage(currentSessionId, 'user', content, expertiseLevel);

        const isFirstMessage = messages.length === 0;
        await updateSessionMetadata(currentSessionId, {
          message_count: messages.length + 2,
          ...(isFirstMessage && { title: content.slice(0, 50) + (content.length > 50 ? '...' : '') }),
        });

        const assistantMsgId = crypto.randomUUID();
        const placeholderMsg: ChatMessage = {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          citations: [],
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, placeholderMsg]);

        const history = messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({ role: m.role, content: m.content }));
        history.push({ role: 'user', content });

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

        await saveMessage(
          currentSessionId,
          'assistant',
          finalContent,
          expertiseLevel,
          finalCitations
        );
      } catch (err) {
        console.error('Error generating response:', err);
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
          <span className="material-symbols-outlined animate-spin">refresh</span>
          <span>Loading conversation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-16 relative">
      <ChatHistory
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        isOpen={historyOpen}
        onToggle={() => setHistoryOpen(!historyOpen)}
      />

      <ExpertiseSelector
        expertiseLevel={expertiseLevel}
        setExpertiseLevel={setExpertiseLevel}
        historyOpen={historyOpen}
        setHistoryOpen={setHistoryOpen}
        atlasOpen={atlasOpen}
        setAtlasOpen={setAtlasOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        <ChatView
          messages={messages}
          generating={generating}
          onCitationClick={setSelectedCitation}
          handleSend={handleSend}
        />

        <AtlasSidebar
          isOpen={atlasOpen}
          highlightRegion={highlightRegion}
        />
      </div>

      <div className="max-w-5xl mx-auto w-full">
        <ChatInput onSend={handleSend} disabled={generating} />
      </div>

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
