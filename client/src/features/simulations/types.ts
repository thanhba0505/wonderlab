export type SimulationCategory = 'probability' | 'physics' | 'paradox' | 'game-theory' | 'logic';

export type SimulationDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type SimulationStatus = 'active' | 'in-development';

export interface HypothesisOption {
  id: string;
  label: string;
  value: number; // Tỉ lệ dự đoán (ví dụ: 0.1 cho 10%)
  explanation: string;
}

export interface SimulationHypothesisChallenge {
  question: string;
  context: string;
  options: HypothesisOption[];
  theoreticalTruth: number;
  truthExplanation: string;
  biasType:
    | 'linear-scaling-trap'
    | 'uniformity-illusion'
    | 'conditional-probability-fallacy'
    | 'classical-mechanics-bias';
  biasName: string;
  biasDescription: string;
}

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
  hypothesis?: SimulationHypothesisChallenge;
}
