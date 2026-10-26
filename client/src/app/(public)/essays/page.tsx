import type { Metadata } from 'next';
import { getAllEssays } from '@/features/editorial/essays-data';
import { EssaysCatalog } from '@/features/editorial/components/essays-catalog';

export const metadata: Metadata = {
  title: 'Góc Tiểu luận & Suy ngẫm',
  description:
    'Góc nhìn chuyên sâu kết nối triết học, toán học và các ranh giới nhận thức của con người.',
  alternates: {
    canonical: '/essays',
  },
  openGraph: {
    title: 'Góc Tiểu luận & Suy ngẫm',
    description:
      'Góc nhìn chuyên sâu kết nối triết học, toán học và các ranh giới nhận thức của con người.',
    url: '/essays',
  },
};

export default function EssaysArchivePage() {
  const essays = getAllEssays();

  return <EssaysCatalog initialEssays={essays} />;
}
