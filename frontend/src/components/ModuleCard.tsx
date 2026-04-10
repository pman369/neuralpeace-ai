import { ReactNode, FC } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Zap, Microscope, Brain, Activity } from 'lucide-react';
import { Module } from '../types';

interface ModuleCardProps {
  module: Module;
}

const categoryStyles: Record<string, string> = {
  Neuroanatomy: 'bg-tertiary/10 text-tertiary',
  Computational: 'bg-secondary/10 text-secondary',
  Methods: 'bg-primary/10 text-primary',
  Psychology: 'bg-tertiary/10 text-tertiary',
  Therapeutics: 'bg-primary/10 text-primary',
};

const expertiseIcons: Record<string, ReactNode> = {
  Novice: <Brain size={14} />,
  Practitioner: <Zap size={14} />,
  Expert: <Microscope size={14} />,
  Scholar: <Activity size={14} />,
};

const ModuleCard: FC<ModuleCardProps> = ({ module }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group bg-surface-container-lowest rounded-xl p-6 flex flex-col h-full border border-outline-variant/15 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${categoryStyles[module.category]}`}>
          {module.category}
        </span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/5 px-2 py-1 rounded-md">
          {expertiseIcons[module.expertise]}
          {module.expertise}
        </span>
      </div>

      <div className="w-full h-40 mb-5 overflow-hidden rounded-lg">
        <img 
          src={module.imageUrl} 
          alt={module.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
        {module.title}
      </h3>
      
      <p className="text-on-surface-variant text-sm leading-relaxed mb-6 flex-grow">
        {module.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
        <span className="text-xs text-outline font-medium">{module.readTime}</span>
        <Link
          to={`/module/${module.id}`}
          className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
        >
          Explore <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};

export default ModuleCard;
