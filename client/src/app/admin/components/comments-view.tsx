'use client';

import * as React from 'react';
import { Trash2, RefreshCw, CornerDownRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import {
  AppTableFilter,
  AppTag,
  AppButton,
  AppConfirmModal,
  type AppTableColumn,
  type AppFilterField,
  type AppActiveFilter,
} from '@/components/ui';
import { AdminCommentItem, fetchAdminComments, deleteAdminComment } from '@/lib/admin-api';
import { getAllSimulations } from '@/features/simulations/registry';

export function CommentsView() {
  const [comments, setComments] = React.useState<AdminCommentItem[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(20);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [selectedSlug, setSelectedSlug] = React.useState<string>('all');
  const [appliedSlug, setAppliedSlug] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [appliedSearch, setAppliedSearch] = React.useState<string>('');
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deleteConfirmCommentId, setDeleteConfirmCommentId] = React.useState<string | null>(null);

  const loadComments = React.useCallback(
    async (
      targetPage = page,
      targetLimit = limit,
      search = appliedSearch,
      slug = appliedSlug,
      silent = false,
    ) => {
      if (!silent) {
        setIsLoading(true);
      }
      try {
        const res = await fetchAdminComments({
          page: targetPage,
          limit: targetLimit,
          search,
          simulationSlug: slug !== 'all' ? slug : undefined,
        });
        const items = Array.isArray(res) ? res : (res?.data ?? []);
        const totalCount = Array.isArray(res) ? res.length : (res?.total ?? items.length);
        setComments(items);
        setTotal(totalCount);
      } catch {
        // Ignored
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [page, limit, appliedSearch, appliedSlug],
  );

  React.useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleFilter = () => {
    setPage(1);
    setAppliedSearch(searchQuery);
    setAppliedSlug(selectedSlug);
    loadComments(1, limit, searchQuery, selectedSlug);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSlug('all');
    setPage(1);
    setAppliedSearch('');
    setAppliedSlug('all');
    loadComments(1, limit, '', 'all');
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    loadComments(nextPage, limit, appliedSearch, appliedSlug);
  };

  const handlePageSizeChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
    loadComments(1, nextLimit, appliedSearch, appliedSlug);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmCommentId) return;

    const id = deleteConfirmCommentId;
    setDeletingId(id);
    const res = await deleteAdminComment(id);
    if (res.success) {
      setComments(prev =>
        prev.map(c => (c.id === id || c.parentId === id ? { ...c, isDeleted: true } : c)),
      );
      await loadComments(page, limit, appliedSearch, appliedSlug, true);
    } else {
      alert(res.error || 'Lỗi khi xóa bình luận');
    }
    setDeletingId(null);
    setDeleteConfirmCommentId(null);
  };

  const simulationSlugs = React.useMemo(() => {
    const all = getAllSimulations().map(s => s.slug);
    const safeComments = Array.isArray(comments) ? comments : [];
    const set = new Set([...all, ...safeComments.map(c => c.simulationSlug)]);
    return ['all', ...Array.from(set)];
  }, [comments]);

  // Filter definitions
  const filters: AppFilterField[] = [
    {
      id: 'simulation',
      value: selectedSlug,
      placeholder: 'Lọc theo phòng Lab',
      options: simulationSlugs.map(slug => ({
        value: slug,
        label: slug === 'all' ? 'Tất cả các phòng Lab' : `/${slug}`,
      })),
      onChange: setSelectedSlug,
    },
  ];

  const activeFilters: AppActiveFilter[] = [];
  if (appliedSlug !== 'all') {
    activeFilters.push({
      id: 'simulation',
      label: 'Thí nghiệm',
      valueLabel: `/${appliedSlug}`,
      onRemove: () => {
        setSelectedSlug('all');
        setAppliedSlug('all');
        setPage(1);
        loadComments(1, limit, appliedSearch, 'all');
      },
    });
  }

  const columns: AppTableColumn<AdminCommentItem>[] = [
    {
      key: 'classification',
      header: 'Phân loại / Thí nghiệm',
      width: 220,
      render: item => {
        const isReply = item.parentId !== null;
        return (
          <div className="space-y-1">
            <div>
              {isReply ? (
                <AppTag
                  variant="outline"
                  size="sm"
                  icon={<CornerDownRight className="h-3 w-3 mr-1 text-slate-500" />}
                >
                  Phản hồi
                </AppTag>
              ) : (
                <AppTag variant="blue" size="sm">
                  Bình luận gốc
                </AppTag>
              )}
            </div>
            <div className="font-mono text-xs text-blue-700 font-semibold flex items-center gap-1">
              <Link
                href={`/simulations/${item.simulationSlug}`}
                target="_blank"
                className="hover:underline flex items-center gap-1 truncate"
              >
                <span className="truncate">/{item.simulationSlug}</span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              </Link>
            </div>
          </div>
        );
      },
    },
    {
      key: 'author',
      header: 'Tác giả',
      width: 180,
      render: item => (
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-bold font-mono shrink-0">
            {item.user.username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-mono font-bold text-slate-900 flex items-center gap-1.5 leading-tight truncate">
              <span className="truncate">{item.user.username}</span>
              {item.user.isDeleted && (
                <AppTag variant="red" size="sm" className="shrink-0">
                  Đã xoá
                </AppTag>
              )}
            </span>
            <span className="text-xs font-mono text-slate-500 block truncate">
              {item.user.role}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'content',
      header: 'Nội dung bình luận',
      minWidth: 260,
      render: item => {
        const isReply = item.parentId !== null;
        return (
          <div className="min-w-0">
            {isReply && item.parent && (
              <div className="text-xs text-slate-500 font-sans italic mb-1 border-l-2 border-slate-300 pl-2 line-clamp-1 break-words">
                Trả lời @{item.parent.user.username}: &ldquo;{item.parent.content}&rdquo;
              </div>
            )}
            <p className="text-slate-800 text-xs font-sans leading-relaxed whitespace-pre-line line-clamp-3 break-words">
              {item.content}
            </p>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Thời gian',
      width: 160,
      className: 'whitespace-nowrap font-mono text-slate-500 text-xs',
      render: item => new Date(item.createdAt).toLocaleString('vi-VN'),
    },
    {
      key: 'isDeleted',
      header: 'Đã xoá',
      width: 90,
      align: 'center',
      className: 'whitespace-nowrap',
      render: item =>
        item.isDeleted ? (
          <AppTag variant="red" size="sm">
            Đã xoá
          </AppTag>
        ) : (
          ''
        ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      width: 110,
      align: 'center',
      render: item => {
        if (item.isDeleted) {
          return <span className="text-xs text-slate-400 font-mono select-none">—</span>;
        }

        const isDeleting = deletingId === item.id;
        return (
          <AppButton
            variant="ghost"
            size="icon-sm"
            disabled={isDeleting}
            isLoading={isDeleting}
            onClick={() => setDeleteConfirmCommentId(item.id)}
            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            title="Xóa bình luận vi phạm"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </AppButton>
        );
      },
    },
  ];

  return (
    <>
      <AppTableFilter
        header={{
          badge: (
            <div className="flex items-center gap-2">
              <AppTag variant="blue" size="sm">
                TRUNG TÂM KIỂM DUYỆT
              </AppTag>
              <span className="text-xs font-mono text-slate-400">
                {total} bình luận trên toàn sàn
              </span>
            </div>
          ),
          title: 'Kiểm Duyệt Thảo Luận & Phản Hồi',
          description:
            'Quản trị nội dung học thuật, loại bỏ bình luận vi phạm và giám sát các phản biện khoa học.',
          actions: (
            <AppButton
              variant="outline"
              size="sm"
              onClick={() => loadComments(page, limit, appliedSearch, appliedSlug)}
              disabled={isLoading}
              className="text-xs font-semibold gap-1.5 border-slate-300 bg-white shadow-2xs shrink-0"
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Làm mới
            </AppButton>
          ),
        }}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onFilter={handleFilter}
        filterLabel="Lọc"
        searchPlaceholder="Tìm theo nội dung hoặc tác giả..."
        filters={filters}
        activeFilters={activeFilters}
        onReset={handleResetFilters}
        columns={columns}
        data={comments}
        isLoading={isLoading}
        loadingMessage="Đang tải dữ liệu kiểm duyệt..."
        emptyMessage="Không có bình luận nào phù hợp bộ lọc hiện tại."
        page={page}
        limit={limit}
        pageSize={limit}
        total={total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 20, 50, 100]}
      />

      <AppConfirmModal
        isOpen={Boolean(deleteConfirmCommentId)}
        onClose={() => setDeleteConfirmCommentId(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bình luận"
        message="Bạn có chắc chắn muốn xóa bình luận này? Nếu đây là bình luận gốc, toàn bộ các phản hồi liên quan sẽ bị xóa tự động."
        confirmText="Xóa bình luận"
        variant="danger"
        isLoading={Boolean(deletingId)}
      />
    </>
  );
}
