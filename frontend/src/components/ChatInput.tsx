import { FC, useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: FC<ChatInputProps> = ({ onSend, disabled = false }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-outline-variant/15 bg-surface-container-low/50 backdrop-blur-sm p-4">
      <div className="max-w-3xl mx-auto flex gap-3 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about neuroscience concepts, mechanisms, or research..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all disabled:opacity-50 text-sm leading-relaxed"
          style={{ minHeight: '48px', maxHeight: '160px' }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="flex-shrink-0 w-12 h-12 bg-primary text-on-primary rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-container transition-colors"
        >
          <Send size={18} />
        </motion.button>
      </div>
      <p className="text-center text-xs text-outline mt-2 max-w-3xl mx-auto">
        NeuralPeace AI provides educational information only — not medical advice.
      </p>
    </div>
  );
};

export default ChatInput;
