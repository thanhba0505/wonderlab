import type { Metadata } from 'next';
import { getAllSimulations } from '@/features/simulations/registry';
import { SimulationsCatalog } from '@/features/simulations/components/simulations-catalog';

export const metadata: Metadata = {
  title: 'Danh mục Phòng Thí nghiệm',
  description:
    'Khám phá các nghịch lý toán học, xác suất thống kê, cơ học lượng tử và lý thuyết trò chơi qua các mô phỏng tương tác.',
  alternates: {
    canonical: '/simulations',
  },
  openGraph: {
    title: 'Danh mục Phòng Thí nghiệm',
    description:
      'Khám phá các nghịch lý toán học, xác suất thống kê, cơ học lượng tử và lý thuyết trò chơi qua các mô phỏng tương tác.',
    url: '/simulations',
  },
};

export default function SimulationsIndexPage() {
  const simulations = getAllSimulations();

  return <SimulationsCatalog initialSimulations={simulations} />;
}
