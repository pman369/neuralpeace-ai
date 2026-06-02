import React, { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import type { BrainRegion } from './BrainAtlas';

// Lazy load heavy BrainAtlas
const BrainAtlas = lazy(() => import('./BrainAtlas'));

interface AtlasSidebarProps {
  isOpen: boolean;
  highlightRegion: BrainRegion;
}

const AtlasSidebar: React.FC<AtlasSidebarProps> = ({ isOpen, highlightRegion }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, width: 0, x: 20 }}
          animate={{ opacity: 1, width: '40%', x: 0 }}
          exit={{ opacity: 0, width: 0, x: 20 }}
          className="hidden lg:block h-full border-l border-outline-variant/10 bg-surface-container-lowest/30 p-4"
        >
          <ErrorBoundary
            fallback={
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-error">visibility_off</span>
                </div>
                <h3 className="text-sm font-bold text-on-surface mb-2">Visualizer Unavailable</h3>
                <p className="text-xs text-on-surface-variant">
                  The 3D Atlas encountered a rendering error. You can still continue your chat
                  session normally.
                </p>
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-on-surface-variant" />
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant">
                      Loading 3D Atlas...
                    </span>
                  </div>
                </div>
              }
            >
              <BrainAtlas highlightRegion={highlightRegion} />
            </Suspense>
          </ErrorBoundary>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AtlasSidebar;
