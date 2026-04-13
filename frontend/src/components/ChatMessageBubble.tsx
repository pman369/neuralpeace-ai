import { FC, memo } from 'react';
import { motion } from 'motion/react';
import { Brain, User, BookOpen, ExternalLink } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
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
          isUser
            ? 'bg-primary text-on-primary'
            : 'bg-secondary text-on-secondary'
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
          <div className="mt-3 w-full">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
              <BookOpen size={12} />
              References
            </div>
            <div className="space-y-1.5">
              {message.citations.map((citation, idx) => (
                <CitationItem 
                  key={idx} 
                  citation={citation} 
                  onClick={() => onCitationClick?.(citation)}
                />
              ))}
            </div>
          </div>
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

interface CitationItemProps {
  citation: Citation;
  onClick?: () => void;
}

const CitationItem: FC<CitationItemProps> = memo(({ citation, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-2 text-left text-sm text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high active:scale-[0.98] transition-all rounded-lg px-3 py-2 border border-transparent hover:border-primary/20 group"
    >
      <span className="text-primary font-bold text-xs mt-0.5 flex-shrink-0">
        [{citation.year ?? 'n.d.'}]
      </span>
      <div className="flex-1 min-w-0">
        <p className="truncate group-hover:text-primary transition-colors">{citation.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-bold text-outline uppercase tracking-tight">Click for details</span>
          {citation.doi && (
            <span className="text-[10px] text-primary/60 truncate flex items-center gap-0.5">
              DOI: {citation.doi}
            </span>
          )}
        </div>
      </div>
    </button>
  );
});

CitationItem.displayName = 'CitationItem';
