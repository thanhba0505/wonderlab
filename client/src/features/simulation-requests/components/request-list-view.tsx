'use client';

import * as React from 'react';
import { FlaskConical, Plus, Search, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import {
  fetchSimulationRequests,
  toggleSimulationRequestVote,
  SimulationRequestItem,
  SimulationRequestStatus,
} from '@/lib/simulation-requests-api';
import { RequestCard } from './request-card';
import { RequestModal } from './request-modal';
import { AppButton, AppInput, AppSelect, AppPagination } from '@/components/ui';
import { SIMULATION_CATEGORIES } from '../constants';
import { cn } from '@/lib/utils';

const STATUS_TABS: Array<{ id: string; label: string; status?: SimulationRequestStatus }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ xem xét', status: 'PENDING' },
  { id: 'UNDER_REVIEW', label: 'Đang thẩm định', status: 'UNDER_REVIEW' },
  { id: 'PLANNED', label: 'Đã lên lịch', status: 'PLANNED' },
  { id: 'IN_DEVELOPMENT', label: 'Đang phát triển', status: 'IN_DEVELOPMENT' },
  { id: 'COMPLETED', label: 'Đã hoàn thành', status: 'COMPLETED' },
];

const SORT_OPTIONS = [
  { value: 'votes', label: 'Nhiều bình chọn nhất' },
  { value: 'newest', label: 'Mới gửi gần đây' },
  { value: 'oldest', label: 'Gửi sớm nhất' },
];

export function RequestListView() {
  const [requests, setRequests] = React.useState<SimulationRequestItem[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [limit] = React.useState<number>(12);

  const [activeTab, setActiveTab] = React.useState<string>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<'votes' | 'newest' | 'oldest'>('votes');

  // Track initial load vs background refetching to eliminate screen flashing
  const hasLoadedOnceRef = React.useRef<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = React.useState<boolean>(true);
  const [isFetching, setIsFetching] = React.useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [votingId, setVotingId] = React.useState<string | null>(null);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadRequests = React.useCallback(async () => {
    if (!hasLoadedOnceRef.current) {
      setIsInitialLoading(true);
    } else {
      setIsFetching(true);
    }

    try {
      const currentTabObj = STATUS_TABS.find(t => t.id === activeTab);
      const res = await fetchSimulationRequests({
        page,
        limit,
        status: currentTabObj?.status,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: debouncedSearch || undefined,
        sortBy,
      });

      setRequests(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error('Error loading simulation requests:', err);
    } finally {
      setIsInitialLoading(false);
      setIsFetching(false);
      hasLoadedOnceRef.current = true;
    }
  }, [page, limit, activeTab, selectedCategory, debouncedSearch, sortBy]);

  React.useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleToggleVote = async (requestId: string) => {
    setVotingId(requestId);
    try {
      const res = await toggleSimulationRequestVote(requestId);
      if (res && res.success) {
        setRequests(prev =>
          prev.map(item =>
            item.id === requestId
              ? {
                  ...item,
                  hasVoted: res.voted,
                  voteCount: res.voteCount,
                }
              : item,
          ),
        );
      }
    } finally {
      setVotingId(null);
    }
  };

  const handleCreateSuccess = () => {
    loadRequests();
  };

  const hasActiveFilters =
    activeTab !== 'all' || selectedCategory !== 'all' || debouncedSearch.trim() !== '';

  const handleResetFilters = () => {
    setActiveTab('all');
    setSelectedCategory('all');
    setSearchQuery('');
    setDebouncedSearch('');
    setSortBy('votes');
    setPage(1);
  };

  const categoryOptions = React.useMemo(() => {
    return [
      { value: 'all', label: 'Tất cả lĩnh vực' },
      ...SIMULATION_CATEGORIES.map(c => ({ value: c, label: c })),
    ];
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Editorial Header / Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-300/85 bg-white p-6 sm:p-8 md:p-10 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200/60 px-3 py-1 font-mono text-xs font-semibold text-blue-700 uppercase tracking-wider mb-4">
            <FlaskConical className="h-3.5 w-3.5 text-blue-600" />
            <span>Cộng đồng Thực nghiệm Wonderlab</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Đề xuất Bài toán & Lộ trình Thí nghiệm
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Bạn muốn thấy nghịch lý xác suất, bài toán toán học hay hiện tượng vật lý lượng tử nào
            được trực quan hóa tiếp theo? Hãy gửi đề xuất hoặc bình chọn để cùng định hình các mô
            phỏng ra mắt trong Phòng Lab!
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AppButton
              size="md"
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              <span>Đề xuất bài toán mới</span>
            </AppButton>
            <span className="text-xs text-slate-500 font-mono">
              Tổng cộng <strong className="text-slate-800">{total}</strong> đề xuất từ cộng đồng
            </span>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 text-sm">
          {STATUS_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (activeTab !== tab.id) {
                    setActiveTab(tab.id);
                    setPage(1);
                  }
                }}
                className={`px-3.5 py-2 font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 text-xs sm:text-sm cursor-pointer select-none ${
                  isActive
                    ? 'border-blue-600 text-blue-700 bg-blue-50/50 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search, Category, Sort controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search box */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <AppInput
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài toán, nghịch lý hoặc từ khóa..."
              className="pl-9"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <AppSelect
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              options={categoryOptions}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3">
            <AppSelect
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value as 'votes' | 'newest' | 'oldest');
                setPage(1);
              }}
              options={SORT_OPTIONS}
            />
          </div>
        </div>

        {/* Subtle Progress Line when updating in background */}
        <div
          className={cn(
            'h-0.5 w-full bg-slate-100 overflow-hidden rounded-full transition-opacity duration-200',
            isFetching ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="h-full bg-blue-600 animate-pulse w-full" />
        </div>
      </div>

      {/* Content Area with Stable Min-Height Container to Prevent Flickering and Layout Shifts */}
      <div className="relative min-h-[380px] w-full">
        {/* Floating Updating Indicator */}
        {isFetching && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-slate-300/85 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.08)] text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-150 pointer-events-none select-none"
            aria-live="polite"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 shrink-0" />
            <span className="font-sans">Đang cập nhật danh sách...</span>
          </div>
        )}

        {/* Initial Skeleton Loader: Only shown on the very first mount */}
        {isInitialLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-64 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 animate-pulse flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                    <div className="h-5 w-20 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-5 w-3/4 bg-slate-200 rounded mb-2.5" />
                  <div className="h-3.5 w-full bg-slate-200 rounded mb-1.5" />
                  <div className="h-3.5 w-5/6 bg-slate-200 rounded mb-1.5" />
                  <div className="h-3.5 w-2/3 bg-slate-200 rounded" />
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-7 w-16 bg-slate-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          /* Empty State: Stable, elegant box with action options */
          <div
            className={cn(
              'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center min-h-[340px] transition-opacity duration-200',
              isFetching && 'opacity-60',
            )}
          >
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3.5">
              <Sparkles className="h-6 w-6 text-slate-400" />
            </div>

            <h3 className="font-heading text-lg font-bold text-slate-900">
              {hasActiveFilters ? 'Chưa tìm thấy đề xuất phù hợp' : 'Chưa có đề xuất bài toán nào'}
            </h3>

            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
              {hasActiveFilters
                ? 'Không có đề xuất nào khớp với bộ lọc hiện tại. Bạn có thể đặt lại bộ lọc để xem toàn bộ danh sách hoặc gửi đề xuất mới.'
                : 'Hãy là người tiên phong chia sẻ nghịch lý hoặc bài toán khoa học thú vị bạn muốn Wonderlab trực quan hóa!'}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {hasActiveFilters && (
                <AppButton
                  variant="outline"
                  size="md"
                  onClick={handleResetFilters}
                  disabled={isFetching}
                  className="text-xs"
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                  <span>Đặt lại bộ lọc</span>
                </AppButton>
              )}
              <AppButton
                variant="primary"
                size="md"
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                <span>Gửi đề xuất bài toán</span>
              </AppButton>
            </div>
          </div>
        ) : (
          /* Content Grid: Kept mounted during filtering with opacity transition */
          <div
            className={cn(
              'grid gap-6 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200',
              isFetching && 'opacity-60 pointer-events-none',
            )}
          >
            {requests.map(request => (
              <RequestCard
                key={request.id}
                request={request}
                onToggleVote={handleToggleVote}
                isVoting={votingId === request.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isInitialLoading && total > limit && (
        <div className="mt-6 flex justify-center border-t border-slate-200 pt-6">
          <AppPagination
            page={page}
            pageSize={limit}
            total={total}
            onPageChange={setPage}
            showTotal
          />
        </div>
      )}

      {/* Modal đề xuất */}
      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
