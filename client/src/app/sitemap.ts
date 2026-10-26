import type { MetadataRoute } from 'next';
import { SIMULATIONS_REGISTRY } from '@/features/simulations/registry';
import { ESSAYS } from '@/features/editorial/essays-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const rawBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wonderlab.vn';
  const baseUrl = rawBaseUrl.replace(/\/$/, '');
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/simulations`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/essays`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/requests`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  const simulationRoutes: MetadataRoute.Sitemap = SIMULATIONS_REGISTRY.map(sim => ({
    url: `${baseUrl}/simulations/${sim.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const essayRoutes: MetadataRoute.Sitemap = ESSAYS.map(essay => ({
    url: `${baseUrl}/essays/${essay.slug || essay.id}`,
    lastModified: essay.publishedDate ? new Date(essay.publishedDate) : now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...simulationRoutes, ...essayRoutes];
}
