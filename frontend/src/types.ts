export type Category = 'Neuroanatomy' | 'Methods' | 'Computational' | 'Psychology' | 'Therapeutics' | 'All Modules';

export type ExpertiseLevel = 'Novice' | 'Practitioner' | 'Expert' | 'Scholar';

export interface Module {
  id: string;
  title: string;
  description: string;
  category: Category;
  expertise: ExpertiseLevel;
  imageUrl: string;
  readTime: string;
}
