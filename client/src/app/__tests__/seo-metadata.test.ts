import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { SIMULATIONS_REGISTRY } from '@/features/simulations/registry';
import { ESSAYS } from '@/features/editorial/essays-data';
import { SimulationJsonLd } from '@/app/simulations/[slug]/SimulationJsonLd';
import { EssayJsonLd } from '@/app/(public)/essays/[slug]/EssayJsonLd';
import { getAppBaseUrl } from '@/lib/utils';

// @ts-expect-error global flag for react act
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('SEO & Metadata Infrastructure', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('generates a complete dynamic sitemap containing all registered simulations and essays', () => {
    const entries = sitemap();
    const urls = entries.map(e => e.url);
    const baseUrl = getAppBaseUrl();

    // Root and section pages
    expect(urls).toContain(baseUrl);
    expect(urls).toContain(`${baseUrl}/simulations`);
    expect(urls).toContain(`${baseUrl}/essays`);
    expect(urls).toContain(`${baseUrl}/requests`);

    // Every simulation has its own indexed URL
    for (const sim of SIMULATIONS_REGISTRY) {
      expect(urls).toContain(`${baseUrl}/simulations/${sim.slug}`);
    }

    // Every essay has its own indexed URL
    for (const essay of ESSAYS) {
      expect(urls).toContain(`${baseUrl}/essays/${essay.slug || essay.id}`);
    }
  });

  it('generates robots.txt with disallow rules for admin, my-account, and api', () => {
    const rules = robots();

    expect(rules.rules).toBeDefined();
    const agentRules = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;

    expect(agentRules?.userAgent).toBe('*');
    expect(agentRules?.allow).toBe('/');
    expect(agentRules?.disallow).toEqual(['/admin', '/my-account', '/api/']);
    expect(rules.sitemap).toMatch(/\/sitemap\.xml$/);
  });

  it('renders valid Schema.org JSON-LD for simulation with LearningResource, WebApplication, and Breadcrumbs', async () => {
    const sim = SIMULATIONS_REGISTRY[0]!;
    const baseUrl = 'http://localhost:4100';
    const url = `${baseUrl}/simulations/${sim.slug}`;

    await act(async () => {
      root.render(React.createElement(SimulationJsonLd, { simulation: sim, url, baseUrl }));
    });

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent || '{}');

    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@graph']).toHaveLength(2);

    const appNode = parsed['@graph'][0];
    expect(appNode['@type']).toEqual(['LearningResource', 'WebApplication']);
    expect(appNode.name).toBe(sim.title);
    expect(appNode.applicationCategory).toBe('EducationalApplication');
    expect(appNode.operatingSystem).toBe('All');
    expect(appNode.educationalLevel).toBe('All');
    expect(appNode.inLanguage).toBe('vi');
    expect(appNode.url).toBe(url);

    const breadcrumbNode = parsed['@graph'][1];
    expect(breadcrumbNode['@type']).toBe('BreadcrumbList');
    expect(breadcrumbNode.itemListElement).toHaveLength(3);
    expect(breadcrumbNode.itemListElement[0].name).toBe('Trang chủ');
    expect(breadcrumbNode.itemListElement[1].name).toBe('Mô phỏng');
    expect(breadcrumbNode.itemListElement[2].name).toBe(sim.title);
  });

  it('renders valid Schema.org JSON-LD for essay with TechArticle and Breadcrumbs', async () => {
    const essay = ESSAYS[0]!;
    const baseUrl = 'http://localhost:4100';
    const url = `${baseUrl}/essays/${essay.slug || essay.id}`;

    await act(async () => {
      root.render(React.createElement(EssayJsonLd, { essay, url, baseUrl }));
    });

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent || '{}');

    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@graph']).toHaveLength(2);

    const articleNode = parsed['@graph'][0];
    expect(articleNode['@type']).toBe('TechArticle');
    expect(articleNode.headline).toBe(essay.title);
    expect(articleNode.description).toBe(essay.teaser);
    expect(articleNode.inLanguage).toBe('vi');
    expect(articleNode.author.name).toBe('Wonderlab Editorial Team');
    expect(articleNode.publisher.name).toBe('Wonderlab');

    const breadcrumbNode = parsed['@graph'][1];
    expect(breadcrumbNode['@type']).toBe('BreadcrumbList');
    expect(breadcrumbNode.itemListElement).toHaveLength(3);
    expect(breadcrumbNode.itemListElement[0].name).toBe('Trang chủ');
    expect(breadcrumbNode.itemListElement[1].name).toBe('Tiểu luận');
    expect(breadcrumbNode.itemListElement[2].name).toBe(essay.title);
  });

  it('correctly resolves app base URL with environment variable priority and fallback', () => {
    const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    const originalRenderUrl = process.env.RENDER_EXTERNAL_URL;

    try {
      // 1. Prioritizes NEXT_PUBLIC_APP_URL
      process.env.NEXT_PUBLIC_APP_URL = 'https://custom-domain.com/';
      process.env.RENDER_EXTERNAL_URL = 'https://wonderlab-client.onrender.com';
      expect(getAppBaseUrl()).toBe('https://custom-domain.com');

      // 2. Falls back to RENDER_EXTERNAL_URL if NEXT_PUBLIC_APP_URL is empty
      delete process.env.NEXT_PUBLIC_APP_URL;
      expect(getAppBaseUrl()).toBe('https://wonderlab-client.onrender.com');

      // 3. Falls back to http://localhost:4100 if neither is set
      delete process.env.RENDER_EXTERNAL_URL;
      expect(getAppBaseUrl()).toBe('http://localhost:4100');
    } finally {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
      process.env.RENDER_EXTERNAL_URL = originalRenderUrl;
    }
  });

  it('provides Google Search Console ownership verification file in public directory', () => {
    const filePath = path.resolve(
      __dirname,
      '../../../../client/public/google02bb9e8664bf4c93.html',
    );
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8').trim();
    expect(content).toBe('google-site-verification: google02bb9e8664bf4c93.html');
  });
});
