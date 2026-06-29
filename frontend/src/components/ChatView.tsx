import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Loader2 } from 'lucide-react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import ChatMessageBubble from './ChatMessageBubble';
import { ChatMessage, Citation } from '../lib/ai.types';

interface ChatViewProps {
  messages: ChatMessage[];
  generating: boolean;
  onCitationClick: (citation: Citation) => void;
  handleSend: (content: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({
  messages,
  generating,
  onCitationClick,
  handleSend,
}) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      virtuosoRef.current?.scrollToIndex({
        index: messages.length - 1,
        behavior: 'smooth',
      });
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
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
    );
  }

  return (
    <Virtuoso
      ref={virtuosoRef}
      data={messages}
      className="flex-1 no-scrollbar"
      computeItemKey={(index, msg) => msg.id}
      initialTopMostItemIndex={messages.length - 1}
      itemContent={(index, msg) => (
        <div
          className={`px-6 ${index === 0 ? 'pt-6' : ''} ${index === messages.length - 1 ? 'pb-6' : 'pb-6'}`}
        >
          <div className="max-w-3xl mx-auto w-full">
            <ChatMessageBubble message={msg} onCitationClick={onCitationClick} />
          </div>
        </div>
      )}
      components={{
        Footer: () => (
          <div className="max-w-3xl mx-auto w-full px-6 pb-8">
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
          </div>
        ),
      }}
    />
  );
};

export default ChatView;
