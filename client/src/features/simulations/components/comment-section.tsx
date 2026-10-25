'use client';

import * as React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppConfirmModal, AppForm, AppFormField, AppFormSubmit } from '@/components/ui';
import {
  MessageSquare,
  Reply,
  Trash2,
  Send,
  LogIn,
  Shield,
  User as UserIcon,
  CornerDownRight,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import {
  SimulationComment,
  fetchSimulationComments,
  postSimulationComment,
  deleteSimulationComment,
} from '@/lib/comments-api';

interface CommentSectionProps {
  simulationSlug: string;
  placeholderText?: string;
  title?: string;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  } catch {
    return dateString;
  }
}

export function CommentSection({
  simulationSlug,
  placeholderText = 'Viết nhận định, câu hỏi hoặc góc nhìn khoa học của bạn về thí nghiệm này...',
  title,
}: CommentSectionProps) {
  const { user, login } = useAuth();
  const [comments, setComments] = React.useState<SimulationComment[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [submittingReplyId, setSubmittingReplyId] = React.useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = React.useState<string | null>(null);
  const [deleteConfirmCommentId, setDeleteConfirmCommentId] = React.useState<string | null>(null);

  // Form states
  const [replyingToId, setReplyingToId] = React.useState<string | null>(null);
  const [replyContent, setReplyContent] = React.useState<string>('');

  // Quick inline login modal state for guests
  const [showQuickLogin, setShowQuickLogin] = React.useState<boolean>(false);

  // Load comments (silent=true retains existing UI to eliminate screen flashes)
  const loadComments = React.useCallback(
    async (silent = false) => {
      if (!silent) {
        setIsLoading(true);
      }
      try {
        const data = await fetchSimulationComments(simulationSlug);
        setComments(data);
      } catch {
        // Ignored
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [simulationSlug],
  );

  React.useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Total comment count (Level 1 + Level 2)
  const totalCommentsCount = React.useMemo(() => {
    return comments.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0);
  }, [comments]);

  // Handle Reply Submit (Level 2)
  const handleReplySubmit = async (parentId: string) => {
    const content = replyContent.trim();
    if (!content || submittingReplyId) return;

    setSubmittingReplyId(parentId);

    const res = await postSimulationComment(simulationSlug, content, parentId);
    if (res.success) {
      setReplyContent('');
      setReplyingToId(null);
      if (res.comment) {
        const newReply = res.comment;
        setComments(prev =>
          prev.map(c => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newReply],
              };
            }
            return c;
          }),
        );
      } else {
        await loadComments(true);
      }
    } else {
      alert(res.error || 'Không thể gửi phản hồi');
    }
    setSubmittingReplyId(null);
  };

  // Handle Delete Comment
  const handleDelete = (commentId: string) => {
    setDeleteConfirmCommentId(commentId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmCommentId) return;

    const commentId = deleteConfirmCommentId;
    setDeletingCommentId(commentId);
    const res = await deleteSimulationComment(commentId);
    if (res.success) {
      // Immediate state update
      setComments(prev =>
        prev
          .filter(c => c.id !== commentId)
          .map(c => ({
            ...c,
            replies: c.replies ? c.replies.filter(r => r.id !== commentId) : [],
          })),
      );
    } else {
      alert(res.error || 'Không thể xóa bình luận');
    }
    setDeletingCommentId(null);
    setDeleteConfirmCommentId(null);
  };

  return (
    <Card className="border-slate-300/85 bg-white shadow-xs">
      <CardHeader className="border-b border-slate-200/80 py-4 px-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-4 w-4 text-indigo-600" />
            <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wide">
              {title ? `${title} (${totalCommentsCount})` : `${totalCommentsCount} bình luận`}
            </span>
          </div>

          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 font-sans">Đang đăng nhập:</span>
              <strong className="font-mono text-slate-900">{user.username}</strong>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                {user.role}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Form đăng bình luận gốc (Level 1) */}
        {user ? (
          <AppForm
            initialValues={{ content: '' }}
            onSubmit={async (values, helpers) => {
              const content = String(values.content || '').trim();
              if (!content) {
                helpers.setFieldError('content', 'Vui lòng nhập nội dung bình luận');
                return;
              }
              const res = await postSimulationComment(simulationSlug, content);
              if (res.success) {
                helpers.resetForm({ content: '' });
                if (res.comment) {
                  setComments(prev => [res.comment!, ...prev]);
                } else {
                  await loadComments(true);
                }
              } else {
                if (res.errors) {
                  helpers.setErrors(res.errors);
                } else {
                  helpers.setFieldError('content', res.error || 'Không thể đăng bình luận');
                }
              }
            }}
            className="space-y-3"
          >
            <AppFormField name="content">
              {({ value, onChange, hasError }) => (
                <div className="relative">
                  <textarea
                    value={String(value || '')}
                    onChange={onChange}
                    placeholder={placeholderText}
                    rows={3}
                    maxLength={2000}
                    className={cn(
                      'w-full rounded-xl border p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-y min-h-[90px]',
                      hasError
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-blue-500',
                    )}
                  />
                  <span className="absolute bottom-2.5 right-3 text-xs font-mono text-slate-400">
                    {String(value || '').length}/2000
                  </span>
                </div>
              )}
            </AppFormField>

            <div className="flex justify-end items-center">
              <AppFormSubmit
                size="sm"
                leftIcon={<Send className="h-3.5 w-3.5 mr-1.5" />}
                className="text-xs font-semibold shadow-sm"
              >
                Gửi bình luận
              </AppFormSubmit>
            </div>
          </AppForm>
        ) : (
          /* Khách chưa đăng nhập: Callout mời đăng nhập */
          <div className="rounded-xl border border-slate-300/80 bg-slate-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <LogIn className="h-4 w-4 text-blue-600" />
                Đăng nhập để tham gia thảo luận
              </div>
              <p className="text-xs text-slate-600 font-sans">
                Bạn cần đăng nhập tài khoản để gửi bình luận hoặc phản hồi các giả thuyết nghiên
                cứu.
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowQuickLogin(!showQuickLogin)}
              className="text-xs font-semibold border-blue-300 bg-white text-blue-700 hover:bg-blue-50"
            >
              <LogIn className="h-3.5 w-3.5 mr-1.5" />
              {showQuickLogin ? 'Đóng đăng nhập' : 'Đăng nhập ngay'}
            </Button>
          </div>
        )}

        {/* Quick inline login form */}
        {showQuickLogin && !user && (
          <AppForm
            initialValues={{ username: '', password: '' }}
            onSubmit={async (values, helpers) => {
              const u = String(values.username || '').trim();
              const p = String(values.password || '');
              const result = await login(u, p);
              if (result.success) {
                setShowQuickLogin(false);
                await loadComments(true);
              } else {
                if (result.errors) {
                  helpers.setErrors(result.errors);
                } else {
                  helpers.setFieldError(
                    'password',
                    result.error || 'Tên đăng nhập hoặc mật khẩu không chính xác',
                  );
                }
              }
            }}
            className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3"
          >
            <div className="text-xs font-bold text-blue-900 uppercase tracking-wide">
              Đăng nhập tài khoản Wonderlab
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AppFormField
                name="username"
                label="Tên đăng nhập"
                required="Vui lòng nhập tên đăng nhập"
                size="sm"
                placeholder="Nhập username hoặc email"
              />

              <AppFormField
                name="password"
                type="password"
                showPasswordToggle
                label="Mật khẩu"
                required="Vui lòng nhập mật khẩu"
                size="sm"
                placeholder="Nhập mật khẩu..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickLogin(false)}
                className="text-xs text-slate-600 cursor-pointer"
              >
                Hủy
              </Button>
              <AppFormSubmit size="sm" className="text-xs font-semibold shadow-xs">
                Xác thực & Bình luận
              </AppFormSubmit>
            </div>
          </AppForm>
        )}

        {/* Danh sách bình luận */}
        <div className="space-y-6 pt-2">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              Đang tải danh sách thảo luận...
            </div>
          ) : comments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-sans border border-dashed border-slate-200 rounded-xl">
              Chưa có bình luận nào cho thí nghiệm này. Hãy là người đầu tiên đặt câu hỏi hoặc đưa
              ra nhận định!
            </div>
          ) : (
            comments.map(rootComment => {
              const isRootAuthor = user?.id === rootComment.user.id;
              const canDeleteRoot = isRootAuthor || user?.role === 'ADMIN';
              const isReplying = replyingToId === rootComment.id;
              const hasReplies = rootComment.replies && rootComment.replies.length > 0;

              return (
                <div key={rootComment.id} className="space-y-2.5">
                  {/* Khung bình luận gốc: mỗi bình luận 1 khung, màu nền nhẹ */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4 sm:p-5 space-y-3 shadow-2xs hover:bg-slate-100/50 hover:border-slate-300 transition-all">
                    {/* Header bình luận gốc */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold font-mono border border-blue-200/60 shadow-2xs">
                          {rootComment.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {rootComment.user.username}
                            </span>
                            {rootComment.user.role === 'ADMIN' ? (
                              <span className="inline-flex items-center gap-0.5 text-xs font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200/60">
                                <Shield className="h-2.5 w-2.5" />
                                ADMIN
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-xs font-mono bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded">
                                <UserIcon className="h-2.5 w-2.5" />
                                USER
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono text-slate-400">
                            {formatRelativeTime(rootComment.createdAt)}
                          </div>
                        </div>
                      </div>

                      {/* Root Action: Delete (author or admin) */}
                      {canDeleteRoot && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(rootComment.id)}
                          disabled={deletingCommentId === rootComment.id}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Xóa bình luận này"
                        >
                          {deletingCommentId === rootComment.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Root Comment Content */}
                    <p className="text-xs sm:text-sm text-slate-800 font-sans leading-relaxed whitespace-pre-line pl-9 sm:pl-10">
                      {rootComment.content}
                    </p>

                    {/* Root Actions: Trả lời button */}
                    <div className="pl-9 sm:pl-10 pt-0.5 flex items-center gap-3">
                      {user ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (isReplying) {
                              setReplyingToId(null);
                              setReplyContent('');
                            } else {
                              setReplyingToId(rootComment.id);
                              setReplyContent('');
                            }
                          }}
                          className={`text-xs h-7 px-2.5 transition-colors ${
                            isReplying
                              ? 'text-slate-700 bg-slate-200/80 hover:bg-slate-200'
                              : 'text-blue-700 hover:text-blue-800 hover:bg-blue-100/70'
                          }`}
                        >
                          <Reply className="h-3.5 w-3.5 mr-1" />
                          {isReplying ? 'Hủy trả lời' : 'Trả lời'}
                        </Button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowQuickLogin(true)}
                          className="text-xs text-slate-500 hover:text-blue-700 font-sans"
                        >
                          Đăng nhập để trả lời
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Form gửi câu trả lời Cấp 2: Khung riêng, thụt lề trái, width ngắn hơn, màu nhẹ */}
                  {isReplying && user && (
                    <div className="ml-6 sm:ml-12 rounded-xl border border-blue-200 bg-blue-50/50 border-l-4 border-l-blue-500 p-4 space-y-3 shadow-2xs transition-all">
                      <div className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
                        <CornerDownRight className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>
                          Trả lời{' '}
                          <strong className="font-mono text-blue-950 font-bold">
                            @{rootComment.user.username}
                          </strong>
                          :
                        </span>
                      </div>
                      <textarea
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        placeholder={`Viết phản hồi cho ${rootComment.user.username}...`}
                        rows={2}
                        maxLength={2000}
                        className="w-full rounded-lg border border-blue-200 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[65px]"
                      />
                      <div className="flex justify-end items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyContent('');
                          }}
                          className="text-xs text-slate-600 hover:text-slate-900 h-7 px-2.5"
                        >
                          Hủy
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={submittingReplyId === rootComment.id || !replyContent.trim()}
                          onClick={() => handleReplySubmit(rootComment.id)}
                          className="text-xs font-semibold h-7 px-3 shadow-2xs bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {submittingReplyId === rootComment.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3 mr-1" />
                          )}
                          Gửi phản hồi
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Danh sách các câu trả lời Cấp 2: Mỗi câu trả lời 1 khung, thụt lề trái, width ngắn hơn, màu nhẹ */}
                  {hasReplies && (
                    <div className="space-y-2.5 ml-6 sm:ml-12">
                      {rootComment.replies!.map(reply => {
                        const isReplyAuthor = user?.id === reply.user.id;
                        const canDeleteReply = isReplyAuthor || user?.role === 'ADMIN';

                        return (
                          <div
                            key={reply.id}
                            className="rounded-xl border border-slate-200/90 border-l-4 border-l-blue-400/80 bg-slate-100/75 hover:bg-slate-100 p-3.5 space-y-2 shadow-2xs transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold font-mono border border-blue-200/50">
                                  {reply.user.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-mono text-xs font-bold text-slate-800">
                                  {reply.user.username}
                                </span>
                                {reply.user.role === 'ADMIN' ? (
                                  <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200/60">
                                    ADMIN
                                  </span>
                                ) : (
                                  <span className="text-xs font-mono bg-slate-200/80 text-slate-600 px-1 py-0.5 rounded">
                                    USER
                                  </span>
                                )}
                                <span className="text-xs font-mono text-slate-400">
                                  {formatRelativeTime(reply.createdAt)}
                                </span>
                              </div>

                              {/* Level 2 Delete Action */}
                              {canDeleteReply && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(reply.id)}
                                  disabled={deletingCommentId === reply.id}
                                  className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  title="Xóa phản hồi này"
                                >
                                  {deletingCommentId === reply.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin text-slate-500" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                            </div>

                            {/* Reply Content */}
                            <p className="text-xs sm:text-sm text-slate-700 font-sans leading-relaxed whitespace-pre-line pl-8">
                              {reply.content}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      <AppConfirmModal
        isOpen={Boolean(deleteConfirmCommentId)}
        onClose={() => setDeleteConfirmCommentId(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa thảo luận"
        message="Bạn có chắc chắn muốn xóa bình luận này khỏi phiên nghiên cứu mô phỏng?"
        confirmText="Xóa thảo luận"
        variant="danger"
        isLoading={Boolean(deletingCommentId)}
      />
    </Card>
  );
}
