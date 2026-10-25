'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Loader2, RefreshCw, Search } from 'lucide-react';
import { AdminUserItem, fetchAdminUsers, updateAdminUserRole } from '@/lib/admin-api';

interface UsersViewProps {
  currentAdminUsername: string;
}

export function UsersView({ currentAdminUsername }: UsersViewProps) {
  const [users, setUsers] = React.useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleRole = async (user: AdminUserItem) => {
    if (user.username === currentAdminUsername) {
      alert('Không thể tự hạ cấp tài khoản quản trị viên của chính bạn.');
      return;
    }

    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const confirmMsg = `Bạn có chắc muốn chuyển vai trò của "${user.username}" sang "${nextRole}"?`;
    if (!confirm(confirmMsg)) return;

    setUpdatingUserId(user.id);
    const res = await updateAdminUserRole(user.id, nextRole);
    if (res.success) {
      await loadUsers();
    } else {
      alert(res.error || 'Lỗi khi cập nhật vai trò');
    }
    setUpdatingUserId(null);
  };

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      u => u.username.toLowerCase().includes(q) || (u.email && u.email.toLowerCase().includes(q)),
    );
  }, [users, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-300/85 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">QUẢN TRỊ NGƯỜI DÙNG</Badge>
            <span className="text-xs font-mono text-slate-400">
              {users.length} tài khoản trong hệ thống
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 mt-1">
            Danh Sách Thành Viên & Phân Quyền
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans mt-0.5">
            Quản trị tài khoản, kiểm tra chỉ số tham gia thí nghiệm và phân quyền quản trị viên.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadUsers}
          disabled={isLoading}
          className="text-xs font-semibold gap-1.5 border-slate-300 bg-white shadow-2xs shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới danh sách
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Tìm theo tên đăng nhập hoặc email..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Users Table */}
      <Card className="border-slate-300/85 bg-white shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            Đang tải danh sách người dùng...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 font-sans">
            Không tìm thấy người dùng phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 font-mono text-xs uppercase tracking-wider text-slate-500">
                  <th className="p-4">Người dùng</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-center">Vai trò</th>
                  <th className="p-4 text-center">Số lượt chạy</th>
                  <th className="p-4 text-center">Số thảo luận</th>
                  <th className="p-4">Ngày đăng ký</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredUsers.map(item => {
                  const isCurrent = item.username === currentAdminUsername;
                  const isUpdating = updatingUserId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Username & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold font-mono">
                            {item.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-mono font-bold text-slate-900 block">
                              {item.username}
                            </span>
                            {isCurrent && (
                              <span className="text-xs text-blue-700 font-sans">
                                (Tài khoản hiện tại)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4 font-mono text-slate-600">{item.email || '—'}</td>

                      {/* Role Badge */}
                      <td className="p-4 text-center">
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs ${
                            item.role === 'ADMIN'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Shield className="h-2.5 w-2.5 mr-1" />
                          {item.role}
                        </Badge>
                      </td>

                      {/* Runs Count */}
                      <td className="p-4 text-center font-mono font-bold text-slate-800 tabular-nums">
                        {item._count.simulationRuns}
                      </td>

                      {/* Comments Count */}
                      <td className="p-4 text-center font-mono font-bold text-slate-800 tabular-nums">
                        {item._count.comments}
                      </td>

                      {/* Joined Date */}
                      <td className="p-4 font-mono text-slate-500 text-xs">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </td>

                      {/* Action */}
                      <td className="p-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isCurrent || isUpdating}
                          onClick={() => handleToggleRole(item)}
                          className="text-xs h-7 px-2 border-slate-200 text-slate-700 hover:bg-slate-100"
                        >
                          {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          {item.role === 'ADMIN' ? 'Hạ xuống USER' : 'Nâng lên ADMIN'}
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
