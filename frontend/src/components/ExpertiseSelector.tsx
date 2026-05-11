import React from 'react';
import { PanelLeftOpen, PanelLeftClose, Box } from 'lucide-react';
import { EXPERTISE_LEVELS } from '../constants';
import { ExpertiseLevel } from '../types';

interface ExpertiseSelectorProps {
  expertiseLevel: ExpertiseLevel;
  setExpertiseLevel: (level: ExpertiseLevel) => void;
  historyOpen: boolean;
  setHistoryOpen: (open: boolean) => void;
  atlasOpen: boolean;
  setAtlasOpen: (open: boolean) => void;
}

const ExpertiseSelector: React.FC<ExpertiseSelectorProps> = ({
  expertiseLevel,
  setExpertiseLevel,
  historyOpen,
  setHistoryOpen,
  atlasOpen,
  setAtlasOpen,
}) => {
  return (
    <div className="border-b border-outline-variant/10 bg-surface-container-low/50 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-all flex-shrink-0"
            title="Toggle conversation history"
          >
            {historyOpen ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider hidden sm:inline flex-shrink-0">
            Expertise
          </span>
          <div className="flex gap-1.5">
            {EXPERTISE_LEVELS.map((item) => {
              const isActive = item.level === expertiseLevel;
              return (
                <button
                  key={item.level}
                  onClick={() => setExpertiseLevel(item.level as ExpertiseLevel)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {item.icon}
                  </span>
                  {item.level}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setAtlasOpen(!atlasOpen)}
          className={`p-1.5 rounded-lg transition-all flex items-center gap-2 px-3 flex-shrink-0 ${
            atlasOpen 
              ? 'bg-secondary text-on-secondary shadow-md' 
              : 'text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/20'
          }`}
        >
          <Box size={16} />
          <span className="text-[11px] font-bold uppercase tracking-tight hidden xs:inline">3D Atlas</span>
        </button>
      </div>
    </div>
  );
};

export default ExpertiseSelector;
