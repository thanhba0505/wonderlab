import type { EditorialArticle } from '@/types';

export interface EssayJsonLdProps {
  essay: EditorialArticle;
  url: string;
  baseUrl: string;
}

export interface EssayJsonLdGraph {
  '@context': 'https://schema.org';
  '@graph': [
    {
      '@type': 'TechArticle';
      '@id': string;
      headline: string;
      description: string;
      inLanguage: 'vi';
      datePublished?: string;
      author: {
        '@type': 'Organization';
        name: string;
      };
      publisher: {
        '@type': 'Organization';
        name: string;
        url: string;
      };
      url: string;
      mainEntityOfPage: string;
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

export function EssayJsonLd({ essay, url, baseUrl }: EssayJsonLdProps) {
  const publishedDate = essay.publishedDate || '2026-10-20';

  const structuredData: EssayJsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        '@id': `${url}#article`,
        headline: essay.title,
        description: essay.teaser,
        inLanguage: 'vi',
        datePublished: publishedDate,
        author: {
          '@type': 'Organization',
          name: 'Wonderlab Editorial Team',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Wonderlab',
          url: baseUrl,
        },
        url,
        mainEntityOfPage: url,
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
            name: 'Tiểu luận',
            item: `${baseUrl}/essays`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: essay.title,
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
