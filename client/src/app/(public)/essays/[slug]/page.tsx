import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllEssays, getEssayBySlug } from '@/features/editorial/essays-data';
import { ReadingProgressBar } from '@/features/editorial/components/reading-progress-bar';
import { TableOfContents } from '@/features/editorial/components/table-of-contents';
import { SimulationBridgeCard } from '@/features/editorial/components/simulation-bridge-card';
import { CommentSection } from '@/features/simulations/components/comment-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Quote,
  Lightbulb,
  Atom,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface EssayPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const essays = getAllEssays();
  return essays.map(essay => ({
    slug: essay.slug || essay.id,
  }));
}

export async function generateMetadata({ params }: EssayPageProps): Promise<Metadata> {
  const { slug } = await params;
  const essay = getEssayBySlug(slug);

  if (!essay) {
    return {
      title: 'Không tìm thấy tiểu luận — Wonderlab',
    };
  }

  return {
    title: `${essay.title} — Wonderlab Editorial`,
    description: essay.teaser,
    openGraph: {
      title: essay.title,
      description: essay.teaser,
      type: 'article',
      publishedTime: essay.publishedDate,
    },
  };
}

export default async function EssayPage({ params }: EssayPageProps) {
  const { slug } = await params;
  const essay = getEssayBySlug(slug);

  if (!essay) {
    notFound();
  }

  const allEssays = getAllEssays();
  const currentIndex = allEssays.findIndex(e => e.id === essay.id);
  const prevEssay = currentIndex > 0 ? allEssays[currentIndex - 1] : null;
  const nextEssay = currentIndex < allEssays.length - 1 ? allEssays[currentIndex + 1] : null;

  return (
    <>
      <ReadingProgressBar />

      <div className="flex flex-col gap-8 xl:gap-10 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 border-b border-slate-200 pb-4">
          <Link href="/" className="flex items-center gap-1 hover:text-slate-800 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/essays" className="hover:text-slate-800 transition-colors">
            Tiểu luận & Suy ngẫm
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
            Tiểu luận #{essay.issueNumber}
          </span>
        </div>

        {/* Hero Header */}
        <header className="space-y-4 max-w-4xl xl:max-w-5xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="cyan" className="font-mono text-xs font-bold">
              <Atom className="mr-1 h-3.5 w-3.5" />
              Tiểu luận #{essay.issueNumber}
            </Badge>
            {essay.categoryLabel && (
              <Badge variant="outline" className="text-xs text-slate-600 border-slate-300">
                {essay.categoryLabel}
              </Badge>
            )}
            <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{essay.readTimeMinutes} phút đọc</span>
            </div>
            {essay.publishedDate && (
              <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{essay.publishedDate}</span>
              </div>
            )}
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-[40px] font-extrabold text-slate-900 tracking-tight leading-[1.2]">
            {essay.title}
          </h1>

          <p className="text-sm sm:text-base xl:text-lg font-mono text-blue-700 font-medium">
            {essay.subtitle}
          </p>

          {/* Lead paragraph teaser */}
          <div className="rounded-xl border border-slate-300/85 bg-white p-5 sm:p-6 xl:p-8 shadow-xs space-y-4">
            <p className="text-sm sm:text-base xl:text-lg text-slate-700 leading-relaxed font-sans">
              {essay.teaser}
            </p>

            {/* Key Quote box */}
            <div className="rounded-lg bg-blue-50/80 p-4 sm:p-5 border-l-3 border-blue-600 text-xs sm:text-sm xl:text-base italic text-slate-800 flex items-start gap-3.5">
              <Quote className="h-4 w-4 xl:h-5 xl:w-5 shrink-0 text-blue-600 opacity-80 mt-0.5" />
              <div className="space-y-1">
                <span className="leading-relaxed font-sans">&ldquo;{essay.quote}&rdquo;</span>
                {essay.quoteAuthor && (
                  <div className="not-italic font-mono text-xs xl:text-sm text-slate-500 font-medium">
                    — {essay.quoteAuthor}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Layout with 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          {/* Main Reading Column */}
          <main className="lg:col-span-8 xl:col-span-8 space-y-10 xl:space-y-12">
            {/* Inline Table of Contents for Mobile */}
            <div className="lg:hidden">
              {essay.sections && <TableOfContents sections={essay.sections} />}
            </div>

            {/* Article Sections */}
            {essay.sections?.map((section, idx) => (
              <section key={section.id} id={section.id} className="scroll-mt-20 space-y-4">
                <div className="flex items-baseline gap-2 border-b border-slate-200 pb-2">
                  <span className="font-mono text-xs font-bold text-blue-700">0{idx + 1}.</span>
                  <h2 className="font-heading text-lg font-bold text-slate-900 tracking-tight">
                    {section.heading}
                  </h2>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed font-sans">
                  {section.paragraphs.map((para, pIdx) => (
                    <p key={pIdx}>{para}</p>
                  ))}
                </div>

                {/* Optional Callout */}
                {section.callout && (
                  <div className="pt-2">
                    {section.callout.type === 'insight' && (
                      <div className="rounded-xl border border-amber-200/90 bg-amber-50/60 p-4 text-xs sm:text-sm text-slate-800 space-y-1.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 font-heading font-bold text-amber-900">
                          <Lightbulb className="h-4 w-4 text-amber-600" />
                          <span>{section.callout.title || 'Điểm Nhận Thức Then Chốt'}</span>
                        </div>
                        <p className="font-sans text-slate-700 leading-relaxed">
                          {section.callout.text}
                        </p>
                      </div>
                    )}

                    {section.callout.type === 'quote' && (
                      <div className="rounded-xl border-l-4 border-l-blue-600 bg-slate-100/70 p-4 text-xs sm:text-sm italic text-slate-800 space-y-1">
                        <p className="font-sans leading-relaxed">
                          &ldquo;{section.callout.text}&rdquo;
                        </p>
                        {section.callout.author && (
                          <div className="not-italic font-mono text-xs text-slate-500">
                            — {section.callout.author}
                          </div>
                        )}
                      </div>
                    )}

                    {section.callout.type === 'simulation-link' &&
                      section.callout.simulationSlug && (
                        <SimulationBridgeCard
                          slug={section.callout.simulationSlug}
                          title={section.callout.simulationTitle || 'Phòng Thí nghiệm Liên quan'}
                          description={section.callout.text}
                        />
                      )}
                  </div>
                )}
              </section>
            ))}

            {/* Linked Simulations Block */}
            {essay.linkedSimulations && essay.linkedSimulations.length > 0 && (
              <div className="rounded-xl border border-slate-300/85 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-800">
                  <FlaskConical className="h-4 w-4 text-blue-700" />
                  <span>Phòng Thí nghiệm Trực quan Liên quan</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {essay.linkedSimulations.map(sim => (
                    <Link
                      key={sim.slug}
                      href={`/simulations/${sim.slug}`}
                      className="group block p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all shadow-2xs"
                    >
                      <Badge variant="cyan" className="text-xs mb-2">
                        {sim.badge}
                      </Badge>
                      <h4 className="font-heading text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {sim.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 font-sans line-clamp-2">
                        {sim.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Previous & Next Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200">
              {prevEssay ? (
                <Link
                  href={`/essays/${prevEssay.slug || prevEssay.id}`}
                  className="group flex flex-col p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white shadow-2xs transition-all"
                >
                  <span className="flex items-center gap-1 font-mono text-xs text-slate-400 group-hover:text-blue-600 transition-colors">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Bài tiểu luận trước
                  </span>
                  <span className="font-heading text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors mt-1 line-clamp-2">
                    {prevEssay.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextEssay && (
                <Link
                  href={`/essays/${nextEssay.slug || nextEssay.id}`}
                  className="group flex flex-col items-end text-right p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white shadow-2xs transition-all"
                >
                  <span className="flex items-center gap-1 font-mono text-xs text-slate-400 group-hover:text-blue-600 transition-colors">
                    Bài tiểu luận tiếp theo
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-heading text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors mt-1 line-clamp-2">
                    {nextEssay.title}
                  </span>
                </Link>
              )}
            </div>

            {/* Community Reflections & Comments */}
            <div id="reflections" className="pt-8 border-t border-slate-200 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    Góc Suy Ngẫm & Phản Biện
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-sans">
                  Chia sẻ nhận định, câu hỏi triết học hoặc góc nhìn phản biện khoa học của bạn về
                  tiểu luận này cùng cộng đồng Wonderlab.
                </p>
              </div>

              <CommentSection
                simulationSlug={`essay-${essay.id}`}
                placeholderText="Viết suy ngẫm hoặc góc nhìn phản biện của bạn về bài tiểu luận này..."
              />
            </div>
          </main>

          {/* Sticky Sidebar on Desktop */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-4 sticky top-24 space-y-6">
            {essay.sections && <TableOfContents sections={essay.sections} />}

            {/* Editorial Metadata Card */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-300/85 bg-white shadow-xs space-y-3 font-mono text-xs">
              <h4 className="font-heading font-bold text-slate-800 uppercase tracking-wider text-xs">
                Thông tin xuất bản
              </h4>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Ban biên tập:</span>
                  <span className="font-semibold text-slate-800">Wonderlab Editorial</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Số hiệu:</span>
                  <span className="font-semibold text-blue-700">#{essay.issueNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400">Chủ đề:</span>
                  <span className="font-semibold text-slate-800">{essay.categoryLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thời gian đọc:</span>
                  <span className="font-semibold text-slate-800">
                    ~{essay.readTimeMinutes} phút
                  </span>
                </div>
              </div>
            </div>

            {/* Link back to all essays */}
            <Link href="/essays" className="block">
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                <BookOpen className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                Xem tất cả tiểu luận
              </Button>
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
