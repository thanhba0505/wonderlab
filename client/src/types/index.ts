export type ContentCategory =
  'science' | 'probability' | 'logic' | 'paradox' | 'puzzles' | 'mind-games';

export interface CategoryInfo {
  id: ContentCategory;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  accentColor: 'cyan' | 'violet' | 'amber' | 'emerald';
  countLabel: string;
}

export interface CuratedExperience {
  id: string;
  title: string;
  summary: string;
  category: ContentCategory;
  estimatedMinutes: number;
  highlightTag: string;
  concept: string;
  href?: string;
}

export interface EditorialArticle {
  id: string;
  title: string;
  subtitle: string;
  readTimeMinutes: number;
  teaser: string;
  quote: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string | null;
  role: 'ADMIN' | 'USER';
  isEmailVerified?: boolean;
  hasPassword?: boolean;
  isGoogleLinked?: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}
