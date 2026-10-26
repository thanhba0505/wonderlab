import type { SimulationMeta } from '@/features/simulations/types';

export interface SimulationJsonLdProps {
  simulation: SimulationMeta;
  url: string;
  baseUrl: string;
}

export interface SimulationJsonLdGraph {
  '@context': 'https://schema.org';
  '@graph': [
    {
      '@type': ['LearningResource', 'WebApplication'];
      '@id': string;
      name: string;
      description: string;
      applicationCategory: 'EducationalApplication';
      operatingSystem: 'All';
      educationalLevel: 'All';
      inLanguage: 'vi';
      url: string;
    },
    {
      '@type': 'BreadcrumbList';
      '@id': string;
      itemListElement: Array<{
        '@type': 'ListItem';
        position: number;
        name: string;
        item: string;
      }>;
    },
  ];
}

export function SimulationJsonLd({ simulation, url, baseUrl }: SimulationJsonLdProps) {
  const description = simulation.description || simulation.summary;

  const structuredData: SimulationJsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LearningResource', 'WebApplication'],
        '@id': `${url}#app`,
        name: simulation.title,
        description,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'All',
        educationalLevel: 'All',
        inLanguage: 'vi',
        url,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Trang chủ',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Mô phỏng',
            item: `${baseUrl}/simulations`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: simulation.title,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
      }}
    />
  );
}
