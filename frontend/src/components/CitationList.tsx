import { FC } from 'react';
import { BookOpen } from 'lucide-react';
import CitationItem from './CitationItem';
import type { Citation } from '../lib/ai';

interface CitationListProps {
  citations: Citation[];
  onCitationClick?: (citation: Citation) => void;
}

export const CitationList: FC<CitationListProps> = ({ citations, onCitationClick }) => {
  return (
    <div className="mt-3 w-full animate-in fade-in duration-300">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
        <BookOpen size={12} />
        References
      </div>
      <div className="space-y-1.5">
        {citations.map((citation, idx) => (
          <CitationItem
            key={idx}
            citation={citation}
            onClick={() => onCitationClick?.(citation)}
          />
        ))}
      </div>
    </div>
  );
};

export default CitationList;
