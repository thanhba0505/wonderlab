import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wonderlab.vn';
  const baseUrl = rawBaseUrl.replace(/\/$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/my-account', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
