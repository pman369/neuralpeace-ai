import { motion } from 'motion/react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

interface CategoryFilterProps {
  currentCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export default function CategoryFilter({ currentCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <section className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
      {CATEGORIES.map((category) => {
        const isActive = currentCategory === category;
        return (
          <motion.button
            key={category}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(category)}
            className={`
              px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap
              ${isActive 
                ? 'bg-primary text-on-primary shadow-md shadow-primary/20' 
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }
            `}
          >
            {category}
          </motion.button>
        );
      })}
    </section>
  );
}
