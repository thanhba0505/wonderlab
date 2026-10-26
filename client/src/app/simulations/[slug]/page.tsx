import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllSimulations, getSimulationBySlug } from '@/features/simulations/registry';
import { SimulationJsonLd } from './SimulationJsonLd';
import { getAppBaseUrl } from '@/lib/utils';
import { SimulationView } from './SimulationView';

interface SimulationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const simulations = getAllSimulations();
  return simulations.map(sim => ({
    slug: sim.slug,
  }));
}

export async function generateMetadata({ params }: SimulationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sim = getSimulationBySlug(slug);

  if (!sim) {
    return {
      title: 'Không tìm thấy mô phỏng',
    };
  }

  const description = sim.description || sim.summary;

  return {
    title: sim.title,
    description,
    alternates: {
      canonical: `/simulations/${slug}`,
    },
    openGraph: {
      title: sim.title,
      description,
      url: `/simulations/${slug}`,
      type: 'article',
      tags: sim.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: sim.title,
      description,
    },
  };
}

export default async function SimulationPage({ params }: SimulationPageProps) {
  const { slug } = await params;
  const sim = getSimulationBySlug(slug);

  if (!sim) {
    notFound();
  }

  const baseUrl = getAppBaseUrl();
  const canonicalUrl = `${baseUrl}/simulations/${slug}`;

  return (
    <>
      <SimulationJsonLd simulation={sim} url={canonicalUrl} baseUrl={baseUrl} />
      <SimulationView slug={slug} initialSim={sim} />
    </>
  );
}
