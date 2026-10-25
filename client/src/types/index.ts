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

export interface EditorialCallout {
  type: 'quote' | 'insight' | 'math' | 'simulation-link';
  title?: string;
  text: string;
  author?: string;
  simulationSlug?: string;
  simulationTitle?: string;
}

export interface EditorialSectionBlock {
  id: string;
  heading: string;
  paragraphs: string[];
  callout?: EditorialCallout;
}

export interface EditorialLinkedSimulation {
  slug: string;
  title: string;
  description: string;
  badge: string;
}

export interface EditorialArticle {
  id: string;
  slug?: string;
  issueNumber?: string;
  title: string;
  subtitle: string;
  readTimeMinutes: number;
  publishedDate?: string;
  category?: ContentCategory;
  categoryLabel?: string;
  teaser: string;
  quote: string;
  quoteAuthor?: string;
  sections?: EditorialSectionBlock[];
  linkedSimulations?: EditorialLinkedSimulation[];
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
