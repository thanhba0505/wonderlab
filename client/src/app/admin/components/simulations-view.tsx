'use client';

import * as React from 'react';
import Link from 'next/link';
import { ExternalLink, Download } from 'lucide-react';
import {
  AppTableFilter,
  AppTag,
  AppButton,
  type AppTableColumn,
  type AppFilterField,
  type AppActiveFilter,
} from '@/components/ui';
import { getAllSimulations } from '@/features/simulations/registry';
import { SimulationMeta } from '@/features/simulations/types';

interface SimulationsViewProps {
  simulationStats?: Record<string, { runs: number; trials: number }>;
}

export function SimulationsView({ simulationStats = {} }: SimulationsViewProps) {
  const allSimulations = React.useMemo(() => getAllSimulations(), []);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [sortColumn, setSortColumn] = React.useState<string>('title');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

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

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const processedSimulations = React.useMemo(() => {
    let result = [...allSimulations];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        s => s.title.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q),
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(s => s.category === selectedCategory);
    }

    result.sort((a, b) => {
      const statsA = simulationStats[a.slug] || { runs: 0, trials: 0 };
      const statsB = simulationStats[b.slug] || { runs: 0, trials: 0 };

      let valA: string | number = '';
      let valB: string | number = '';

      if (sortColumn === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (sortColumn === 'runs') {
        valA = statsA.runs;
        valB = statsB.runs;
      } else if (sortColumn === 'trials') {
        valA = statsA.trials;
        valB = statsB.trials;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [allSimulations, searchQuery, selectedCategory, sortColumn, sortDirection, simulationStats]);

  // Filters
  const filters: AppFilterField[] = [
    {
      id: 'category',
      value: selectedCategory,
      placeholder: 'Lọc theo chuyên mục',
      options: categories.map(cat => ({
        value: cat,
        label: cat === 'all' ? 'Tất cả chuyên mục' : cat.charAt(0).toUpperCase() + cat.slice(1),
      })),
      onChange: setSelectedCategory,
    },
  ];

  const activeFilters: AppActiveFilter[] = [];
  if (selectedCategory !== 'all') {
    activeFilters.push({
      id: 'category',
      label: 'Chuyên mục',
      valueLabel: selectedCategory,
      onRemove: () => setSelectedCategory('all'),
    });
  }

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const columns: AppTableColumn<SimulationMeta>[] = [
    {
      key: 'title',
      header: 'Mô hình / Slug',
      sortable: true,
      render: sim => (
        <div>
          <div className="font-heading font-bold text-slate-900 text-sm leading-tight">
            {sim.title}
          </div>
          <div className="font-mono text-xs text-blue-700 font-semibold mt-0.5">/{sim.slug}</div>
          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-xs font-sans">
            {sim.summary}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Chuyên mục',
      render: sim => (
        <AppTag variant="default" size="sm" className="capitalize">
          {sim.category}
        </AppTag>
      ),
    },
    {
      key: 'difficulty',
      header: 'Độ khó',
      render: sim => (
        <AppTag variant="outline" size="sm" className="font-mono uppercase font-semibold">
          {sim.difficulty}
        </AppTag>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái phát hành',
      align: 'center',
      render: sim => {
        const currentStatus = statusMap[sim.slug] || sim.status;
        const isActive = currentStatus === 'active';
        return (
          <button
            type="button"
            onClick={() => toggleStatus(sim.slug)}
            title="Nhấp để chuyển đổi trạng thái phát hành"
            className="cursor-pointer focus:outline-none"
          >
            <AppTag variant={isActive ? 'emerald' : 'amber'} dot size="sm">
              {isActive ? 'Đang hoạt động' : 'Đang phát triển'}
            </AppTag>
          </button>
        );
      },
    },
    {
      key: 'runs',
      header: 'Lượt chạy thực tế',
      align: 'right',
      sortable: true,
      render: sim => {
        const stats = simulationStats[sim.slug] || { runs: 0, trials: 0 };
        return (
          <span className="font-mono font-bold text-slate-900 tabular-nums">
            {stats.runs.toLocaleString('vi-VN')}
          </span>
        );
      },
    },
    {
      key: 'trials',
      header: 'Mẫu thử Monte Carlo',
      align: 'right',
      sortable: true,
      render: sim => {
        const stats = simulationStats[sim.slug] || { runs: 0, trials: 0 };
        return (
          <span className="font-mono text-slate-600 tabular-nums">
            {stats.trials.toLocaleString('vi-VN')}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center',
      render: sim => (
        <Link href={`/simulations/${sim.slug}`} target="_blank">
          <AppButton
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2.5 text-blue-700 border-blue-200 hover:bg-blue-50"
            rightIcon={<ExternalLink className="h-3 w-3" />}
          >
            Trải nghiệm
          </AppButton>
        </Link>
      ),
    },
  ];

  return (
    <AppTableFilter
      header={{
        badge: (
          <div className="flex items-center gap-2">
            <AppTag variant="blue" size="sm">
              QUẢN LÝ DANH MỤC THÍ NGHIỆM
            </AppTag>
            <span className="text-xs font-mono text-slate-400">
              {allSimulations.length} mô hình toán học
            </span>
          </div>
        ),
        title: 'Cài Đặt & Giám Sát Phòng Thí Nghiệm',
        description:
          'Quản trị trạng thái phát hành, xem lưu lượng chạy thực tế và kiểm thử trực tiếp các mô phỏng.',
        actions: (
          <AppButton
            variant="outline"
            size="sm"
            onClick={handleExportSummary}
            className="text-xs font-semibold gap-1.5 border-slate-300 bg-white shadow-2xs shrink-0"
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Xuất Báo cáo CSV
          </AppButton>
        ),
      }}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Tìm kiếm theo tiêu đề hoặc slug..."
      filters={filters}
      activeFilters={activeFilters}
      onReset={handleResetFilters}
      columns={columns}
      data={processedSimulations}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={handleSort}
      clientSidePagination
      pageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
}
