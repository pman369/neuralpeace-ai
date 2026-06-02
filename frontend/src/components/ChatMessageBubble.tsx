import { FC, memo } from 'react';
import { motion } from 'motion/react';
import { Brain, User } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import CitationList from './CitationList';
import type { ChatMessage, Citation } from '../lib/ai';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onCitationClick?: (citation: Citation) => void;
}

const ChatMessageBubble: FC<ChatMessageBubbleProps> = memo(({ message, onCitationClick }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary'
        }`}
      >
        {isUser ? <User size={16} /> : <Brain size={16} />}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-5 py-3 ${
            isUser
              ? 'bg-primary text-on-primary rounded-tr-sm'
              : 'bg-surface-container-lowest text-on-surface border border-outline-variant/15 rounded-tl-sm shadow-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {/* Citations (assistant only) */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <CitationList citations={message.citations} onCitationClick={onCitationClick} />
        )}

        {/* Timestamp */}
        <span className="text-xs text-outline mt-1.5 px-1">
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  );
});

ChatMessageBubble.displayName = 'ChatMessageBubble';

export default ChatMessageBubble;

