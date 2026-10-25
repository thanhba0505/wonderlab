'use client';

import * as React from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import {
  AppTableFilter,
  AppTag,
  AppButton,
  type AppTableColumn,
  type AppFilterField,
  type AppActiveFilter,
} from '@/components/ui';
import { AdminUserItem, fetchAdminUsers, updateAdminUserRole } from '@/lib/admin-api';

interface UsersViewProps {
  currentAdminUsername: string;
}

export function UsersView({ currentAdminUsername }: UsersViewProps) {
  const [users, setUsers] = React.useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [sortColumn, setSortColumn] = React.useState<string>('createdAt');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
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

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const processedUsers = React.useMemo(() => {
    let result = [...users];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        u => u.username.toLowerCase().includes(q) || (u.email && u.email.toLowerCase().includes(q)),
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }

    // Sort
    result.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (sortColumn === 'username') {
        valA = a.username.toLowerCase();
        valB = b.username.toLowerCase();
      } else if (sortColumn === 'runs') {
        valA = a._count.simulationRuns;
        valB = b._count.simulationRuns;
      } else if (sortColumn === 'comments') {
        valA = a._count.comments;
        valB = b._count.comments;
      } else if (sortColumn === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, searchQuery, roleFilter, sortColumn, sortDirection]);

  // Filter configuration
  const filters: AppFilterField[] = [
    {
      id: 'role',
      value: roleFilter,
      placeholder: 'Lọc theo vai trò',
      options: [
        { value: 'all', label: 'Tất cả vai trò' },
        { value: 'ADMIN', label: 'Quản trị viên (ADMIN)' },
        { value: 'USER', label: 'Người dùng (USER)' },
      ],
      onChange: setRoleFilter,
    },
  ];

  const activeFilters: AppActiveFilter[] = [];
  if (roleFilter !== 'all') {
    activeFilters.push({
      id: 'role',
      label: 'Vai trò',
      valueLabel: roleFilter === 'ADMIN' ? 'Quản trị viên' : 'Người dùng',
      onRemove: () => setRoleFilter('all'),
    });
  }

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
  };

  const columns: AppTableColumn<AdminUserItem>[] = [
    {
      key: 'username',
      header: 'Người dùng',
      sortable: true,
      render: item => {
        const isCurrent = item.username === currentAdminUsername;
        return (
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold font-mono shrink-0">
              {item.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-mono font-bold text-slate-900 block leading-tight">
                {item.username}
              </span>
              {isCurrent && (
                <span className="text-xs text-blue-700 font-sans">(Tài khoản hiện tại)</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'email',
      header: 'Email',
      render: item => <span className="font-mono text-slate-600">{item.email || '—'}</span>,
    },
    {
      key: 'role',
      header: 'Vai trò',
      align: 'center',
      render: item => (
        <AppTag
          variant={item.role === 'ADMIN' ? 'blue' : 'default'}
          size="sm"
          icon={<Shield className="h-3 w-3 mr-1" />}
        >
          {item.role}
        </AppTag>
      ),
    },
    {
      key: 'runs',
      header: 'Số lượt chạy',
      align: 'center',
      sortable: true,
      render: item => (
        <span className="font-mono font-bold text-slate-800 tabular-nums">
          {item._count.simulationRuns}
        </span>
      ),
    },
    {
      key: 'comments',
      header: 'Số thảo luận',
      align: 'center',
      sortable: true,
      render: item => (
        <span className="font-mono font-bold text-slate-800 tabular-nums">
          {item._count.comments}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày đăng ký',
      sortable: true,
      render: item => (
        <span className="font-mono text-slate-500 text-xs">
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Hành động',
      align: 'center',
      render: item => {
        const isCurrent = item.username === currentAdminUsername;
        const isUpdating = updatingUserId === item.id;
        return (
          <AppButton
            variant="outline"
            size="sm"
            disabled={isCurrent || isUpdating}
            onClick={() => handleToggleRole(item)}
            className="text-xs h-7 px-2.5 border-slate-300 text-slate-700 hover:bg-slate-50"
            isLoading={isUpdating}
          >
            {item.role === 'ADMIN' ? 'Hạ xuống USER' : 'Nâng lên ADMIN'}
          </AppButton>
        );
      },
    },
  ];

  return (
    <AppTableFilter
      header={{
        badge: (
          <div className="flex items-center gap-2">
            <AppTag variant="blue" size="sm">
              QUẢN TRỊ NGƯỜI DÙNG
            </AppTag>
            <span className="text-xs font-mono text-slate-400">
              {users.length} tài khoản trong hệ thống
            </span>
          </div>
        ),
        title: 'Danh Sách Thành Viên & Phân Quyền',
        description:
          'Quản trị tài khoản, kiểm tra chỉ số tham gia thí nghiệm và phân quyền quản trị viên.',
        actions: (
          <AppButton
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={isLoading}
            className="text-xs font-semibold gap-1.5 border-slate-300 bg-white shadow-2xs shrink-0"
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Làm mới danh sách
          </AppButton>
        ),
      }}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Tìm theo tên đăng nhập hoặc email..."
      filters={filters}
      activeFilters={activeFilters}
      onReset={handleResetFilters}
      columns={columns}
      data={processedUsers}
      isLoading={isLoading}
      loadingMessage="Đang tải danh sách người dùng..."
      emptyMessage="Không tìm thấy người dùng phù hợp."
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={handleSort}
      clientSidePagination
      pageSize={10}
      pageSizeOptions={[10, 25, 50]}
    />
  );
}
