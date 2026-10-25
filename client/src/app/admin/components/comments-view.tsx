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

export function CommentsView() {
  const [comments, setComments] = React.useState<AdminCommentItem[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [selectedSlug, setSelectedSlug] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deleteConfirmCommentId, setDeleteConfirmCommentId] = React.useState<string | null>(null);

  const loadComments = React.useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const data = await fetchAdminComments();
      setComments(data);
    } catch {
      // Ignored
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  React.useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleConfirmDelete = async () => {
    if (!deleteConfirmCommentId) return;

    const id = deleteConfirmCommentId;
    setDeletingId(id);
    const res = await deleteAdminComment(id);
    if (res.success) {
      setComments(prev =>
        prev.map(c => (c.id === id || c.parentId === id ? { ...c, isDeleted: true } : c)),
      );
      await loadComments(true);
    } else {
      alert(res.error || 'Lỗi khi xóa bình luận');
    }
    setDeletingId(null);
    setDeleteConfirmCommentId(null);
  };

  const simulationSlugs = React.useMemo(() => {
    const set = new Set(comments.map(c => c.simulationSlug));
    return ['all', ...Array.from(set)];
  }, [comments]);

  const filteredComments = React.useMemo(() => {
    return comments.filter(c => {
      const matchSlug = selectedSlug === 'all' || c.simulationSlug === selectedSlug;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q || c.content.toLowerCase().includes(q) || c.user.username.toLowerCase().includes(q);
      return matchSlug && matchSearch;
    });
  }, [comments, selectedSlug, searchQuery]);

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
  if (selectedSlug !== 'all') {
    activeFilters.push({
      id: 'simulation',
      label: 'Thí nghiệm',
      valueLabel: `/${selectedSlug}`,
      onRemove: () => setSelectedSlug('all'),
    });
  }

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSlug('all');
  };

  const columns: AppTableColumn<AdminCommentItem>[] = [
    {
      key: 'classification',
      header: 'Phân loại / Thí nghiệm',
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
                className="hover:underline flex items-center gap-1"
              >
                <span>/{item.simulationSlug}</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </Link>
            </div>
          </div>
        );
      },
    },
    {
      key: 'author',
      header: 'Tác giả',
      render: item => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-bold font-mono shrink-0">
            {item.user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-mono font-bold text-slate-900 flex items-center gap-1.5 leading-tight">
              <span>{item.user.username}</span>
              {item.user.isDeleted && (
                <AppTag variant="red" size="sm">
                  Đã xoá
                </AppTag>
              )}
            </span>
            <span className="text-xs font-mono text-slate-500">{item.user.role}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'content',
      header: 'Nội dung bình luận',
      className: 'max-w-md',
      render: item => {
        const isReply = item.parentId !== null;
        return (
          <div>
            {isReply && item.parent && (
              <div className="text-xs text-slate-500 font-sans italic mb-1 border-l-2 border-slate-300 pl-2 line-clamp-1">
                Trả lời @{item.parent.user.username}: &ldquo;{item.parent.content}&rdquo;
              </div>
            )}
            <p className="text-slate-800 text-xs font-sans leading-relaxed whitespace-pre-line line-clamp-3">
              {item.content}
            </p>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Thời gian',
      className: 'whitespace-nowrap font-mono text-slate-500 text-xs',
      render: item => new Date(item.createdAt).toLocaleString('vi-VN'),
    },
    {
      key: 'isDeleted',
      header: 'Đã xoá',
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
                {comments.length} bình luận trên toàn sàn
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
              onClick={() => loadComments()}
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
        searchPlaceholder="Tìm theo nội dung hoặc tác giả..."
        filters={filters}
        activeFilters={activeFilters}
        onReset={handleResetFilters}
        columns={columns}
        data={filteredComments}
        isLoading={isLoading}
        loadingMessage="Đang tải dữ liệu kiểm duyệt..."
        emptyMessage="Không có bình luận nào phù hợp bộ lọc hiện tại."
        clientSidePagination
        pageSize={10}
        pageSizeOptions={[10, 25, 50]}
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
