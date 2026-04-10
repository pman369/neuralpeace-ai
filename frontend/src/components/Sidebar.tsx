import { motion } from 'motion/react';
import { EXPERTISE_LEVELS } from '../constants';
import { ExpertiseLevel } from '../types';

interface SidebarProps {
  currentLevel: ExpertiseLevel;
  onLevelChange: (level: ExpertiseLevel) => void;
}

export default function Sidebar({ currentLevel, onLevelChange }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col p-4 gap-2 h-screen w-64 fixed left-0 top-16 bg-surface-container font-body text-sm">
      <div className="mb-6 px-2">
        <div className="text-lg font-semibold text-on-surface">Expertise</div>
        <div className="text-xs text-on-surface-variant">Adjust AI depth</div>
      </div>
      
      <nav className="space-y-1">
        {EXPERTISE_LEVELS.map((item) => {
          const isActive = currentLevel === item.level;
          return (
            <motion.div
              key={item.level}
              whileHover={{ x: 4 }}
              onClick={() => onLevelChange(item.level)}
              className={`
                flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-surface-container-lowest text-primary font-semibold shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-container-high'
                }
              `}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>
              <span>{item.level}</span>
            </motion.div>
          );
        })}
      </nav>
    </aside>
  );
}
