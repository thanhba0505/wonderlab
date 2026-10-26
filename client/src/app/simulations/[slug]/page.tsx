import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllSimulations, getSimulationBySlug } from '@/features/simulations/registry';
import { BirthdaySimulation } from '@/features/birthday-paradox/birthday-simulation';
import { MontyHallSimulation } from '@/features/monty-hall/monty-hall-simulation';
import { DoubleSlitSimulation } from '@/features/double-slit/double-slit-simulation';
import { PrisonersDilemmaSimulation } from '@/features/prisoners-dilemma/prisoners-dilemma-simulation';
import { ZenoSimulation } from '@/features/zeno-paradox/zeno-simulation';
import { ArtGallerySimulation } from '@/features/art-gallery/art-gallery-simulation';
import { PrisonersHatsSimulation } from '@/features/prisoners-hats/prisoners-hats-simulation';
import { CommentSection } from '@/features/simulations/components/comment-section';
import { SimulationMathCard } from '@/features/simulations/components/simulation-math-card';
import { SimulationSection } from '@/features/simulations/components/simulation-section';
import { SimulationJsonLd } from './SimulationJsonLd';
import { getAppBaseUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, FlaskConical, Sparkles } from 'lucide-react';

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
    <div className="flex flex-col gap-6">
      <SimulationJsonLd simulation={sim} url={canonicalUrl} baseUrl={baseUrl} />
      {/* Breadcrumb và Header điều hướng */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <Link href="/" className="flex items-center gap-1 hover:text-slate-800">
            <ArrowLeft className="h-3.5 w-3.5" />
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/simulations" className="hover:text-slate-800">
            Phòng Thí nghiệm
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800 truncate">{sim.title}</span>
        </div>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {sim.title}
              </h1>
              {sim.status === 'active' ? (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Sẵn sàng tương tác
                </Badge>
              ) : (
                <Badge variant="outline" className="text-slate-500 border-slate-300">
                  Đang phát triển
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">{sim.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-slate-500">
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
              <Clock className="h-3.5 w-3.5" />~{sim.estimatedMinutes} phút
            </span>
            <span className="bg-slate-100 px-2 py-1 rounded capitalize">
              Độ khó: {sim.difficulty}
            </span>
          </div>
        </div>

        {/* Tóm tắt & Mô hình toán học đa tầng, phân số, số mũ */}
        <div className="mt-2">
          <SimulationMathCard slug={sim.slug} summary={sim.summary} />
        </div>
      </div>

      {/* Vùng hiển thị tương tác */}
      {sim.slug === 'birthday-paradox' && <BirthdaySimulation />}
      {sim.slug === 'monty-hall' && <MontyHallSimulation />}
      {sim.slug === 'double-slit' && <DoubleSlitSimulation />}
      {sim.slug === 'prisoners-dilemma' && <PrisonersDilemmaSimulation />}
      {sim.slug === 'zeno-paradox' && <ZenoSimulation />}
      {sim.slug === 'art-gallery' && <ArtGallerySimulation />}
      {sim.slug === 'prisoners-hats' && <PrisonersHatsSimulation />}

      {/* Hiển thị cho các mô phỏng đang phát triển */}
      {sim.status === 'in-development' && (
        <div className="lab-card rounded-xl border-slate-300 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-4 border border-slate-200">
            <FlaskConical className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="font-heading text-lg font-bold text-slate-900">
            Phòng Thí nghiệm Đang Được Thiết lập
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 leading-relaxed">
            {sim.description}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/simulations/birthday-paradox">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Trải nghiệm Nghịch lý Ngày sinh
              </Button>
            </Link>
            <Link href="/simulations/monty-hall">
              <Button variant="outline" className="border-slate-300">
                Thử nghiệm Monty Hall
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Đường phân cách trước phần thảo luận */}
      <hr className="border-slate-200/80 my-2" />

      {/* Title Bình Luận & Thảo Luận - Không số đầu, không khung, nổi bật */}
      <SimulationSection
        dotColor="indigo"
        title="Góc Thảo Luận & Bình Luận Khoa Học"
        subtitle="Không gian trao đổi đa chiều, chia sẻ trực giác và phản biện cùng cộng đồng nghiên cứu"
      >
        <CommentSection simulationSlug={sim.slug} />
      </SimulationSection>
    </div>
  );
}
