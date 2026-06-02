import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategoryFilter from './CategoryFilter';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

describe('CategoryFilter', () => {
  it('renders all categories', () => {
    render(<CategoryFilter currentCategory={CATEGORIES[0] as Category} onCategoryChange={vi.fn()} />);
    CATEGORIES.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('calls onCategoryChange when a category is clicked', () => {
    const handleChange = vi.fn();
    render(<CategoryFilter currentCategory={CATEGORIES[0] as Category} onCategoryChange={handleChange} />);
    
    const targetCategory = CATEGORIES[1] as Category;
    fireEvent.click(screen.getByText(targetCategory));
    
    expect(handleChange).toHaveBeenCalledWith(targetCategory);
  });
});
