export type SimulationCategory = 'probability' | 'physics' | 'paradox' | 'game-theory' | 'logic';

export type SimulationDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type SimulationStatus = 'active' | 'in-development';

export interface SimulationMeta {
  slug: string;
  title: string;
  subtitle: string;
  category: SimulationCategory;
  difficulty: SimulationDifficulty;
  estimatedMinutes: number;
  formula: string;
  summary: string;
  description: string;
  tags: string[];
  status: SimulationStatus;
  accentColor: 'blue' | 'amber' | 'emerald' | 'violet';
}
