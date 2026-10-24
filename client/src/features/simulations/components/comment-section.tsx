'use client';

import * as React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Reply,
  Trash2,
  Send,
  LogIn,
  AlertCircle,
  Shield,
  User as UserIcon,
  CornerDownRight,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  SimulationComment,
  fetchSimulationComments,
  postSimulationComment,
  deleteSimulationComment,
} from '@/lib/comments-api';

interface CommentSectionProps {
  simulationSlug: string;
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

export function CommentSection({ simulationSlug }: CommentSectionProps) {
  const { user, login } = useAuth();
  const [comments, setComments] = React.useState<SimulationComment[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Form states
  const [rootContent, setRootContent] = React.useState<string>('');
  const [replyingToId, setReplyingToId] = React.useState<string | null>(null);
  const [replyContent, setReplyContent] = React.useState<string>('');

  // Quick inline login modal state for guests
  const [showQuickLogin, setShowQuickLogin] = React.useState<boolean>(false);
  const [loginUsername, setLoginUsername] = React.useState<string>('admin');
  const [loginPassword, setLoginPassword] = React.useState<string>('Admin@Wonderlab2026!');
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = React.useState<boolean>(false);

  // Load comments
  const loadComments = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSimulationComments(simulationSlug);
      setComments(data);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, [simulationSlug]);

  React.useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Total comment count (Level 1 + Level 2)
  const totalCommentsCount = React.useMemo(() => {
    return comments.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0);
  }, [comments]);

  // Handle Root Comment Submit
  const handleRootSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootContent.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await postSimulationComment(simulationSlug, rootContent.trim());
    if (res.success) {
      setRootContent('');
      await loadComments();
    } else {
      setErrorMessage(res.error || 'Không thể đăng bình luận');
    }
    setIsSubmitting(false);
  };

  // Handle Reply Submit (Level 2)
  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await postSimulationComment(simulationSlug, replyContent.trim(), parentId);
    if (res.success) {
      setReplyContent('');
      setReplyingToId(null);
      await loadComments();
    } else {
      setErrorMessage(res.error || 'Không thể gửi phản hồi');
    }
    setIsSubmitting(false);
  };

  // Handle Delete Comment
  const handleDelete = async (commentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

    const res = await deleteSimulationComment(commentId);
    if (res.success) {
      await loadComments();
    } else {
      alert(res.error || 'Không thể xóa bình luận');
    }
  };

  // Handle Quick Login
  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    const result = await login(loginUsername, loginPassword);
    if (result.success) {
      setShowQuickLogin(false);
    } else {
      setLoginError(result.error || 'Đăng nhập không thành công');
    }
    setIsLoggingIn(false);
  };

  return (
    <Card className="border-slate-300/85 bg-white shadow-xs">
      <CardHeader className="border-b border-slate-200/80 py-4 px-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-4 w-4 text-indigo-600" />
            <span className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wide">
              {totalCommentsCount} bình luận
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
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form đăng bình luận gốc (Level 1) */}
        {user ? (
          <form onSubmit={handleRootSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                value={rootContent}
                onChange={e => setRootContent(e.target.value)}
                placeholder="Viết nhận định, câu hỏi hoặc góc nhìn khoa học của bạn về thí nghiệm này..."
                rows={3}
                maxLength={2000}
                className="w-full rounded-xl border border-slate-300 p-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y min-h-[90px]"
              />
              <span className="absolute bottom-2.5 right-3 text-xs font-mono text-slate-400">
                {rootContent.length}/2000
              </span>
            </div>

            <div className="flex justify-end items-center">
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !rootContent.trim()}
                className="text-xs font-semibold shadow-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                )}
                Gửi bình luận
              </Button>
            </div>
          </form>
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
          <form
            onSubmit={handleQuickLogin}
            className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3"
          >
            <div className="text-xs font-bold text-blue-900 uppercase tracking-wide">
              Đăng nhập tài khoản Wonderlab
            </div>

            {loginError && (
              <div className="text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                {loginError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Mật khẩu</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickLogin(false)}
                className="text-xs text-slate-600"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isLoggingIn}
                className="text-xs font-semibold shadow-sm"
              >
                {isLoggingIn && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                Xác thực & Bình luận
              </Button>
            </div>
          </form>
        )}

        {/* Danh sách bình luận */}
        <div className="space-y-4 pt-2">
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

              return (
                <div
                  key={rootComment.id}
                  className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  {/* CẤP 1 (Root Comment Header) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold font-mono">
                        {rootComment.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {rootComment.user.username}
                          </span>
                          {rootComment.user.role === 'ADMIN' ? (
                            <span className="inline-flex items-center gap-0.5 text-xs font-mono font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              <Shield className="h-2.5 w-2.5" />
                              ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-xs font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
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
                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Xóa bình luận này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Root Comment Content */}
                  <p className="text-xs sm:text-sm text-slate-800 font-sans leading-relaxed whitespace-pre-line pl-9">
                    {rootComment.content}
                  </p>

                  {/* Root Actions: Trả lời (Reply button) - Only available if user logged in */}
                  <div className="pl-9 pt-1 flex items-center gap-3">
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
                        className="text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-50 h-7 px-2.5"
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

                  {/* Form gửi câu trả lời Cấp 2 */}
                  {isReplying && user && (
                    <div className="ml-6 sm:ml-10 pl-3 border-l-2 border-blue-400 pt-2 space-y-2">
                      <div className="text-xs font-semibold text-blue-900 flex items-center gap-1">
                        <CornerDownRight className="h-3 w-3 text-blue-600" />
                        Trả lời @{rootComment.user.username}:
                      </div>
                      <textarea
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        placeholder={`Viết phản hồi cho ${rootComment.user.username}...`}
                        rows={2}
                        maxLength={2000}
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[60px]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyContent('');
                          }}
                          className="text-xs text-slate-500 h-7 px-2"
                        >
                          Hủy
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={isSubmitting || !replyContent.trim()}
                          onClick={() => handleReplySubmit(rootComment.id)}
                          className="text-xs font-semibold h-7 px-3 shadow-sm"
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3 mr-1" />
                          )}
                          Gửi phản hồi
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* CẤP 2: Danh sách các phản hồi (Level 2 Replies) */}
                  {rootComment.replies && rootComment.replies.length > 0 && (
                    <div className="ml-4 sm:ml-9 pl-3 sm:pl-4 border-l-2 border-slate-200 space-y-2.5 pt-2">
                      {rootComment.replies.map(reply => {
                        const isReplyAuthor = user?.id === reply.user.id;
                        const canDeleteReply = isReplyAuthor || user?.role === 'ADMIN';

                        return (
                          <div
                            key={reply.id}
                            className="rounded-lg bg-slate-50/80 border border-slate-200/70 p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold font-mono">
                                  {reply.user.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-mono text-xs font-bold text-slate-800">
                                  {reply.user.username}
                                </span>
                                {reply.user.role === 'ADMIN' && (
                                  <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                    ADMIN
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
                                  className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  title="Xóa phản hồi này"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>

                            {/* Reply Content */}
                            <p className="text-xs text-slate-700 font-sans leading-relaxed whitespace-pre-line pl-7">
                              {reply.content}
                            </p>

                            {/* NOTE: CẤP 2 TUYỆT ĐỐI KHÔNG CÓ NÚT "TRẢ LỜI" -> ĐẢM BẢO CHẶN TỐI ĐA 2 CẤP */}
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
    </Card>
  );
}
