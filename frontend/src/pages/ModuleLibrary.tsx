import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from '../components/Sidebar';
import ModuleCard from '../components/ModuleCard';
import CategoryFilter from '../components/CategoryFilter';
import { Category, ExpertiseLevel, Module } from '../types';
import { supabase } from '../lib/supabase';

function mapDbModuleToModule(row: {
  id: string;
  title: string;
  description: string;
  category: string;
  expertise: string;
  image_url: string;
  read_time: string;
}): Module {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as Category,
    expertise: row.expertise as ExpertiseLevel,
    imageUrl: row.image_url,
    readTime: row.read_time,
  };
}

export default function ModuleLibrary() {
  const [currentCategory, setCurrentCategory] = useState<Category>('All Modules');
  const [currentExpertise, setCurrentExpertise] = useState<ExpertiseLevel>('Expert');
  const [searchQuery, setSearchQuery] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModules() {
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('id, title, description, category, expertise, image_url, read_time')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setModules((data ?? []).map(mapDbModuleToModule));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch modules';
        setError(message);
        console.error('Error fetching modules:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchModules();
  }, []);

  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const matchesCategory = currentCategory === 'All Modules' || module.category === currentCategory;
      const matchesExpertise = module.expertise === currentExpertise;
      const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           module.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesExpertise && matchesSearch;
    });
  }, [modules, currentCategory, currentExpertise, searchQuery]);

  return (
    <div className="flex flex-1 pt-16">
      <Sidebar
        currentLevel={currentExpertise}
        onLevelChange={setCurrentExpertise}
      />

      <main className="flex-1 lg:ml-64 pb-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Hero Header & Search Section */}
        <header className="mb-12 pt-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-on-surface"
          >
            Neural Library
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-on-surface-variant max-w-2xl text-lg leading-relaxed mb-8"
          >
            Explore the latest frontiers in neuroanatomy, computational modeling, and therapeutic methodologies curated by AI expertise.
          </motion.p>

          {/* Search Bar Component */}
          <div className="relative group max-w-3xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-outline group-focus-within:text-primary transition-colors" size={20} />
            </div>
            <input
              type="text"
              placeholder="Search neural circuits, methods, or papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-200 text-lg outline-none"
            />
          </div>
        </header>

        <CategoryFilter
          currentCategory={currentCategory}
          onCategoryChange={setCurrentCategory}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-on-surface-variant text-lg">Loading modules...</div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <p className="text-red-700 font-medium">Failed to load modules</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* 3-Column Bento Grid of Modules */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 min-h-[400px]">
            <AnimatePresence mode="popLayout">
              {filteredModules.length > 0 ? (
                filteredModules.map((module) => (
                  <ModuleCard key={module.id} module={module} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="col-span-full flex flex-col items-center justify-center py-20 text-on-surface-variant"
                >
                  <div className="material-symbols-outlined text-6xl mb-4 opacity-20">
                    sentiment_dissatisfied
                  </div>
                  <p className="text-lg font-medium">No modules found for this selection</p>
                  <button
                    onClick={() => {
                      setCurrentCategory('All Modules');
                      setSearchQuery('');
                    }}
                    className="mt-4 text-primary font-bold hover:underline"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
