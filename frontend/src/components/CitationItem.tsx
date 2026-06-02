import { FC, memo } from 'react';
import type { Citation } from '../lib/ai';

interface CitationItemProps {
  citation: Citation;
  onClick?: () => void;
}

const CitationItem: FC<CitationItemProps> = memo(({ citation, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-2 text-left text-sm text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high active:scale-[0.98] transition-all rounded-lg px-3 py-2 border border-transparent hover:border-primary/20 group cursor-pointer"
    >
      <span className="text-primary font-bold text-xs mt-0.5 flex-shrink-0">
        [{citation.year ?? 'n.d.'}]
      </span>
      <div className="flex-1 min-w-0">
        <p className="truncate group-hover:text-primary transition-colors">{citation.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-bold text-outline uppercase tracking-tight">
            Click for details
          </span>
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

export default CitationItem;
