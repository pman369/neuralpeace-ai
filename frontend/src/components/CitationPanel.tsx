import { FC, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, ExternalLink, BookOpen, User, Calendar, FileText, Loader2, BarChart3, Quote } from 'lucide-react';
import { Citation, fetchCitationDetails } from '../lib/ai';

interface EnrichedCitation {
  title: string;
  abstract?: string;
  citationCount?: number;
  influentialCitationCount?: number;
  venue?: string;
  year?: number;
  authors?: string[];
}

interface CitationPanelProps {
  citation: Citation | null;
  onClose: () => void;
}

const CitationPanel: FC<CitationPanelProps> = ({ citation, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<EnrichedCitation | null>(null);

  useEffect(() => {
    if (!citation) {
      setDetails(null);
      return;
    }

    async function loadDetails() {
      setLoading(true);
      const data = await fetchCitationDetails(citation!);
      setDetails(data);
      setLoading(false);
    }

    loadDetails();
  }, [citation]);

  if (!citation) return null;

  const displayTitle = details?.title || citation.title;
  const displayYear = details?.year || citation.year;
  const displayVenue = details?.venue || citation.journal;
  const displayAuthors = details?.authors || citation.authors || [];

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-full w-full sm:w-96 bg-surface border-l border-outline-variant/20 z-[100] shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low">
        <div className="flex items-center gap-2 text-primary font-headline font-bold">
          <BookOpen size={20} />
          <span>Research Citation</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Basic Info */}
        <section className="space-y-4">
          <h1 className="text-xl font-headline font-bold leading-tight text-on-surface">
            {displayTitle}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
            <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-full">
              <Calendar size={14} />
              <span>{displayYear ?? 'Year Unknown'}</span>
            </div>
            {displayVenue && (
              <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-full">
                <FileText size={14} />
                <span className="truncate max-w-[150px]">{displayVenue}</span>
              </div>
            )}
          </div>
        </section>

        {/* Intelligence / Abstract */}
        <section className="p-6 bg-secondary/5 border border-secondary/10 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-secondary font-bold">
            <motion.div
              animate={loading ? { rotate: [0, 360] } : {}}
              transition={loading ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
            >
              {loading ? <Loader2 size={18} /> : <BarChart3 size={18} />}
            </motion.div>
            <span>Research Metrics</span>
          </div>

          {loading ? (
            <div className="py-4 flex flex-col items-center gap-3 text-on-surface-variant/60">
              <Loader2 className="animate-spin" size={24} />
              <p className="text-xs font-medium">Querying Semantic Scholar...</p>
            </div>
          ) : details ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Citations</span>
                  <span className="text-2xl font-black text-secondary">
                    {details.citationCount?.toLocaleString() ?? '---'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Highly Influential</span>
                  <span className="text-2xl font-black text-secondary">
                    {details.influentialCitationCount?.toLocaleString() ?? '---'}
                  </span>
                </div>
              </div>

              {details.abstract && (
                <div className="pt-4 border-t border-secondary/10">
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Quote size={12} />
                    Abstract
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-6 italic">
                    "{details.abstract}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant leading-relaxed italic">
              "No additional metrics found for this specific citation. Displaying primary metadata only."
            </p>
          )}
        </section>

        {/* Authors */}
        {displayAuthors.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-outline uppercase tracking-widest flex items-center gap-2">
              <User size={14} />
              Authors
            </h2>
            <div className="flex flex-wrap gap-2">
              {displayAuthors.map((author, i) => (
                <span key={i} className="text-sm bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-lg">
                  {author}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* External Links */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-outline uppercase tracking-widest flex items-center gap-2">
            <ExternalLink size={14} />
            External Resources
          </h2>
          <div className="space-y-2">
            {citation.doi && (
              <a
                href={`https://doi.org/${citation.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 rounded-xl transition-all group"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-outline uppercase">DOI Provider</span>
                  <span className="text-sm font-medium text-primary break-all">{citation.doi}</span>
                </div>
                <ExternalLink size={16} className="text-outline group-hover:text-primary transition-colors" />
              </a>
            )}
            
            <a
              href={`https://scholar.google.com/scholar?q=${encodeURIComponent(citation.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 rounded-xl transition-all group"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-outline uppercase">Search Engine</span>
                <span className="text-sm font-medium text-primary">Google Scholar</span>
              </div>
              <ExternalLink size={16} className="text-outline group-hover:text-primary transition-colors" />
            </a>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-6 bg-surface-container-low border-t border-outline-variant/10">
        <p className="text-[10px] text-outline leading-tight text-center">
          NeuralPeace AI leverages Perplexity AI and Semantic Scholar to curate evidence-based neuroscience data.
        </p>
      </div>
    </motion.aside>
  );
};

export default CitationPanel;
