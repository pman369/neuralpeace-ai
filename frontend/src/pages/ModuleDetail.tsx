import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Tag, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { Category, ExpertiseLevel } from '../types';
import { supabase } from '../lib/supabase';

interface ModuleDetail {
  id: string;
  title: string;
  description: string;
  category: Category;
  expertise: ExpertiseLevel;
  imageUrl: string;
  readTime: string;
}

interface ModuleSection {
  id: string;
  section_title: string;
  section_order: number;
  content_md: string;
}

const categoryColors: Record<string, string> = {
  Neuroanatomy: 'bg-tertiary/10 text-tertiary',
  Computational: 'bg-secondary/10 text-secondary',
  Methods: 'bg-primary/10 text-primary',
  Psychology: 'bg-tertiary/10 text-tertiary',
  Therapeutics: 'bg-primary/10 text-primary',
};

export default function ModuleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [sections, setSections] = useState<ModuleSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchModule() {
      try {
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .select('id, title, description, category, expertise, image_url, read_time')
          .eq('id', id)
          .single();

        if (moduleError) throw moduleError;
        if (!moduleData) throw new Error('Module not found');

        setModule({
          id: moduleData.id,
          title: moduleData.title,
          description: moduleData.description,
          category: moduleData.category as Category,
          expertise: moduleData.expertise as ExpertiseLevel,
          imageUrl: moduleData.image_url,
          readTime: moduleData.read_time,
        });

        const { data: sectionsData, error: sectionsError } = await supabase
          .from('module_content')
          .select('id, section_title, section_order, content_md')
          .eq('module_id', id)
          .order('section_order', { ascending: true });

        if (sectionsError) throw sectionsError;
        setSections(sectionsData ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch module';
        setError(message);
        console.error('Error fetching module:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchModule();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="text-on-surface-variant text-lg">Loading module...</div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-700 font-medium text-lg mb-2">Failed to load module</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-primary font-bold hover:underline"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Back to Library
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-24 pb-8 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${categoryColors[module.category]}`}>
              <Tag size={12} className="inline mr-1 -mt-0.5" />
              {module.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/5 text-primary">
              <Layers size={12} className="inline mr-1 -mt-0.5" />
              {module.expertise}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-surface-container-high text-on-surface-variant">
              <Clock size={12} className="inline mr-1 -mt-0.5" />
              {module.readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface font-headline mb-3">
            {module.title}
          </h1>

          {/* Description */}
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-3xl">
            {module.description}
          </p>
        </motion.div>
      </header>

      {/* Module Image */}
      <div className="px-6 max-w-5xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full h-64 md:h-80 overflow-hidden rounded-xl"
        >
          <img
            src={module.imageUrl}
            alt={module.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Content Sections */}
      <div className="px-6 max-w-5xl mx-auto pb-20">
        {sections.length > 0 ? (
          sections.map((section, index) => (
            <motion.section
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className="mb-10"
            >
              <h2 className="text-2xl font-bold text-on-surface font-headline mb-4 pb-2 border-b border-outline-variant/20">
                {section.section_title}
              </h2>
              <MarkdownRenderer content={section.content_md} />
            </motion.section>
          ))
        ) : (
          <div className="text-center py-12 text-on-surface-variant">
            <p className="text-lg">No content available for this module yet.</p>
            <p className="text-sm mt-2">Check back soon or contact an administrator.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full py-8 bg-surface-container-low border-t border-outline-variant/10 flex flex-col items-center justify-center text-center px-6">
        <p className="text-on-surface-variant font-body text-xs leading-relaxed mb-4">
          © 2024 NeuralPeace AI. Educational use only. Not medical advice.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-on-surface-variant/60 font-body text-xs hover:text-primary underline transition-all">Privacy</a>
          <a href="#" className="text-on-surface-variant/60 font-body text-xs hover:text-primary underline transition-all">Terms</a>
          <a href="#" className="text-on-surface-variant/60 font-body text-xs hover:text-primary underline transition-all">Support</a>
        </div>
      </footer>
    </div>
  );
}
