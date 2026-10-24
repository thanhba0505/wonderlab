'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Download, Filter } from 'lucide-react';
import { getAllSimulations } from '@/features/simulations/registry';

interface SimulationsViewProps {
  simulationStats?: Record<string, { runs: number; trials: number }>;
}

export function SimulationsView({ simulationStats = {} }: SimulationsViewProps) {
  const allSimulations = React.useMemo(() => getAllSimulations(), []);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [statusMap, setStatusMap] = React.useState<Record<string, 'active' | 'in-development'>>(
    () => {
      const initial: Record<string, 'active' | 'in-development'> = {};
      for (const sim of allSimulations) {
        initial[sim.slug] = sim.status;
      }
      return initial;
    },
  );

  const categories = React.useMemo(() => {
    const set = new Set(allSimulations.map(s => s.category));
    return ['all', ...Array.from(set)];
  }, [allSimulations]);

  const filteredSimulations = React.useMemo(() => {
    if (selectedCategory === 'all') return allSimulations;
    return allSimulations.filter(s => s.category === selectedCategory);
  }, [allSimulations, selectedCategory]);

  const toggleStatus = (slug: string) => {
    setStatusMap(prev => ({
      ...prev,
      [slug]: prev[slug] === 'active' ? 'in-development' : 'active',
    }));
  };

  const handleExportSummary = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Slug,Title,Category,Status,Difficulty,TotalRuns,TotalTrials']
        .concat(
          allSimulations.map(sim => {
            const stats = simulationStats[sim.slug] || { runs: 0, trials: 0 };
            return `"${sim.slug}","${sim.title}","${sim.category}","${statusMap[sim.slug]}","${sim.difficulty}",${stats.runs},${stats.trials}`;
          }),
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wonderlab_simulations_summary_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-300/85 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">QUẢN LÝ DANH MỤC THÍ NGHIỆM</Badge>
            <span className="text-xs font-mono text-slate-400">
              {allSimulations.length} mô hình toán học
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 mt-1">
            Cài Đặt & Giám Sát Phòng Thí Nghiệm
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans mt-0.5">
            Quản trị trạng thái phát hành, xem lưu lượng chạy thực tế và kiểm thử trực tiếp các mô
            phỏng.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportSummary}
          className="text-xs font-semibold gap-1.5 border-slate-300 bg-white shadow-2xs shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          Xuất Báo cáo CSV
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <Filter className="h-3.5 w-3.5 text-slate-400 mr-1" />
        <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] mr-2">
          Chuyên mục:
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors capitalize ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'Tất cả' : cat}
          </button>
        ))}
      </div>

      {/* Simulations Table */}
      <Card className="border-slate-300/85 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 font-mono text-[11px] uppercase tracking-wider text-slate-500">
                <th className="p-4">Mô hình / Slug</th>
                <th className="p-4">Chuyên mục</th>
                <th className="p-4">Độ khó</th>
                <th className="p-4 text-center">Trạng thái phát hành</th>
                <th className="p-4 text-right">Lượt chạy thực tế</th>
                <th className="p-4 text-right">Mẫu thử Monte Carlo</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredSimulations.map(sim => {
                const currentStatus = statusMap[sim.slug] || sim.status;
                const stats = simulationStats[sim.slug] || { runs: 0, trials: 0 };

                return (
                  <tr key={sim.slug} className="hover:bg-slate-50/60 transition-colors">
                    {/* Title & Slug */}
                    <td className="p-4">
                      <div className="font-heading font-bold text-slate-900 text-sm">
                        {sim.title}
                      </div>
                      <div className="font-mono text-[11px] text-blue-700 font-semibold mt-0.5">
                        /{sim.slug}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-xs font-sans">
                        {sim.summary}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize text-slate-700 bg-slate-50">
                        {sim.category}
                      </Badge>
                    </td>

                    {/* Difficulty */}
                    <td className="p-4 font-mono uppercase text-[10px] font-semibold text-slate-600">
                      {sim.difficulty}
                    </td>

                    {/* Status Toggle */}
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleStatus(sim.slug)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono transition-colors border ${
                          currentStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Nhấp để thay đổi trạng thái"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            currentStatus === 'active' ? 'bg-emerald-600' : 'bg-amber-500'
                          }`}
                        />
                        {currentStatus === 'active' ? 'Đang hoạt động' : 'Đang phát triển'}
                      </button>
                    </td>

                    {/* Total Runs */}
                    <td className="p-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {stats.runs.toLocaleString('vi-VN')}
                    </td>

                    {/* Total Trials */}
                    <td className="p-4 text-right font-mono text-slate-600 tabular-nums">
                      {stats.trials.toLocaleString('vi-VN')}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <Link href={`/simulations/${sim.slug}`} target="_blank">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2.5 text-blue-700 border-blue-200 hover:bg-blue-50"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Trải nghiệm
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
