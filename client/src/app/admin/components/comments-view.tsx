'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  Filter,
  Search,
  RefreshCw,
  Loader2,
  CornerDownRight,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { AdminCommentItem, fetchAdminComments, deleteAdminComment } from '@/lib/admin-api';

export function CommentsView() {
  const [comments, setComments] = React.useState<AdminCommentItem[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [selectedSlug, setSelectedSlug] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const loadComments = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminComments();
      setComments(data);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Bạn có chắc chắn muốn xóa bình luận này? Nếu đây là bình luận Cấp 1, toàn bộ các phản hồi con sẽ bị xóa tự động.',
      )
    ) {
      return;
    }

    setDeletingId(id);
    const res = await deleteAdminComment(id);
    if (res.success) {
      await loadComments();
    } else {
      alert(res.error || 'Lỗi khi xóa bình luận');
    }
    setDeletingId(null);
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

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-300/85 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">TRUNG TÂM KIỂM DUYỆT</Badge>
            <span className="text-xs font-mono text-slate-400">
              {comments.length} bình luận trên toàn sàn
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 mt-1">
            Kiểm Duyệt Thảo Luận & Phản Hồi (2 Cấp)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans mt-0.5">
            Quản trị nội dung học thuật, loại bỏ bình luận vi phạm và giám sát các phản biện khoa
            học.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadComments}
          disabled={isLoading}
          className="text-xs font-semibold gap-1.5 border-slate-300 bg-white shadow-2xs shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo nội dung hoặc tác giả..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-500 font-bold uppercase text-[10px]">Thí nghiệm:</span>
          <select
            value={selectedSlug}
            onChange={e => setSelectedSlug(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {simulationSlugs.map(slug => (
              <option key={slug} value={slug}>
                {slug === 'all' ? 'Tất cả các phòng Lab' : slug}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comments List Table */}
      <Card className="border-slate-300/85 bg-white shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            Đang tải dữ liệu kiểm duyệt...
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 font-sans">
            Không có bình luận nào phù hợp bộ lọc hiện tại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="p-4">Tầng / Thí nghiệm</th>
                  <th className="p-4">Tác giả</th>
                  <th className="p-4">Nội dung bình luận</th>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredComments.map(item => {
                  const isReply = item.parentId !== null;
                  const isDeleting = deletingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Level & Simulation Badge */}
                      <td className="p-4 space-y-1">
                        <div>
                          {isReply ? (
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] bg-slate-50 text-slate-700 border-slate-300"
                            >
                              <CornerDownRight className="h-2.5 w-2.5 mr-1 text-slate-500" />
                              Cấp 2 (Phản hồi)
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] bg-blue-50 text-blue-800 border-blue-200"
                            >
                              Cấp 1 (Gốc)
                            </Badge>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                          <Link
                            href={`/simulations/${item.simulationSlug}`}
                            target="_blank"
                            className="hover:underline flex items-center gap-1"
                          >
                            <span>/{item.simulationSlug}</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-[10px] font-bold font-mono">
                            {item.user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-mono font-bold text-slate-900 block">
                              {item.user.username}
                            </span>
                            <span className="text-[9px] font-mono text-slate-500">
                              {item.user.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Content */}
                      <td className="p-4 max-w-md">
                        {isReply && item.parent && (
                          <div className="text-[11px] text-slate-500 font-sans italic mb-1 border-l-2 border-slate-300 pl-2 line-clamp-1">
                            Trả lời @{item.parent.user.username}: &ldquo;{item.parent.content}
                            &rdquo;
                          </div>
                        )}
                        <p className="text-slate-800 text-xs font-sans leading-relaxed whitespace-pre-line line-clamp-3">
                          {item.content}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="p-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </td>

                      {/* Action */}
                      <td className="p-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isDeleting}
                          onClick={() => handleDelete(item.id)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Xóa bình luận vi phạm"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
