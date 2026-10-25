'use client';

import * as React from 'react';
import { Shield, RefreshCw, Trash2 } from 'lucide-react';
import {
  AppTableFilter,
  AppTag,
  AppButton,
  AppConfirmModal,
  type AppTableColumn,
  type AppFilterField,
  type AppActiveFilter,
} from '@/components/ui';
import {
  AdminUserItem,
  fetchAdminUsers,
  updateAdminUserRole,
  deleteAdminUser,
} from '@/lib/admin-api';

interface UsersViewProps {
  currentAdminUsername: string;
}

export function UsersView({ currentAdminUsername }: UsersViewProps) {
  const [users, setUsers] = React.useState<AdminUserItem[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(20);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [appliedSearch, setAppliedSearch] = React.useState<string>('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [appliedRole, setAppliedRole] = React.useState<string>('all');
  const [sortColumn, setSortColumn] = React.useState<string>('createdAt');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = React.useState<string | null>(null);
  const [confirmModal, setConfirmModal] = React.useState<
    | {
        type: 'role';
        user: AdminUserItem;
        nextRole: 'ADMIN' | 'USER';
      }
    | {
        type: 'delete';
        user: AdminUserItem;
      }
    | null
  >(null);

  const loadUsers = React.useCallback(
    async (targetPage = page, targetLimit = limit, search = appliedSearch, role = appliedRole) => {
      setIsLoading(true);
      try {
        const res = await fetchAdminUsers({
          page: targetPage,
          limit: targetLimit,
          search,
          role: role !== 'all' ? role : undefined,
        });
        const items = Array.isArray(res) ? res : (res?.data ?? []);
        const totalCount = Array.isArray(res) ? res.length : (res?.total ?? items.length);
        setUsers(items);
        setTotal(totalCount);
      } catch {
        // Ignored
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, appliedSearch, appliedRole],
  );

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFilter = () => {
    setPage(1);
    setAppliedSearch(searchQuery);
    setAppliedRole(roleFilter);
    loadUsers(1, limit, searchQuery, roleFilter);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setPage(1);
    setAppliedSearch('');
    setAppliedRole('all');
    loadUsers(1, limit, '', 'all');
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    loadUsers(nextPage, limit, appliedSearch, appliedRole);
  };

  const handlePageSizeChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
    loadUsers(1, nextLimit, appliedSearch, appliedRole);
  };

  const handleToggleRole = (user: AdminUserItem) => {
    if (user.username === currentAdminUsername) {
      alert('Không thể tự hạ cấp tài khoản quản trị viên của chính bạn.');
      return;
    }

    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setConfirmModal({ type: 'role', user, nextRole });
  };

  const handleDeleteUser = (user: AdminUserItem) => {
    if (user.username === currentAdminUsername) {
      alert('Không thể tự xóa tài khoản quản trị viên của chính bạn.');
      return;
    }

    setConfirmModal({ type: 'delete', user });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal) return;

    if (confirmModal.type === 'role') {
      const { user, nextRole } = confirmModal;
      setUpdatingUserId(user.id);
      const res = await updateAdminUserRole(user.id, nextRole);
      if (res.success) {
        await loadUsers();
      } else {
        alert(res.error || 'Lỗi khi cập nhật vai trò');
      }
      setUpdatingUserId(null);
    } else if (confirmModal.type === 'delete') {
      const { user } = confirmModal;
      setDeletingUserId(user.id);
      const res = await deleteAdminUser(user.id);
      if (res.success) {
        setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, isDeleted: true } : u)));
        await loadUsers();
      } else {
        alert(res.error || 'Lỗi khi xóa người dùng');
      }
      setDeletingUserId(null);
    }

    setConfirmModal(null);
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedUsers = React.useMemo(() => {
    const result = Array.isArray(users) ? [...users] : [];

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
  }, [users, sortColumn, sortDirection]);

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
  if (appliedRole !== 'all') {
    activeFilters.push({
      id: 'role',
      label: 'Vai trò',
      valueLabel: appliedRole === 'ADMIN' ? 'Quản trị viên' : 'Người dùng',
      onRemove: () => {
        setRoleFilter('all');
        setAppliedRole('all');
        setPage(1);
        loadUsers(1, limit, appliedSearch, 'all');
      },
    });
  }

  const columns: AppTableColumn<AdminUserItem>[] = [
    {
      key: 'username',
      header: 'Người dùng',
      sortable: true,
      width: 200,
      render: item => {
        const isCurrent = item.username === currentAdminUsername;
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold font-mono shrink-0">
              {item.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-mono font-bold text-slate-900 block leading-tight truncate">
                {item.username}
              </span>
              {isCurrent && (
                <span className="text-xs text-blue-700 font-sans block truncate">
                  (Tài khoản hiện tại)
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'email',
      header: 'Email',
      minWidth: 200,
      render: item => (
        <span className="font-mono text-slate-600 block truncate" title={item.email || undefined}>
          {item.email || '—'}
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      width: 130,
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
      width: 110,
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
      width: 110,
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
      width: 130,
      align: 'center',
      sortable: true,
      render: item => (
        <span className="font-mono text-slate-500 text-xs whitespace-nowrap">
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'isDeleted',
      header: 'Đã xoá',
      width: 90,
      align: 'center',
      render: item =>
        item.isDeleted ? (
          <span className="inline-flex items-center text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md whitespace-nowrap">
            Đã xoá
          </span>
        ) : null,
    },
    {
      key: 'actions',
      header: 'Hành động',
      width: 220,
      align: 'center',
      render: item => {
        const isCurrent = item.username === currentAdminUsername;
        const isUpdating = updatingUserId === item.id;
        const isDeleting = deletingUserId === item.id;
        if (item.isDeleted) {
          return <span className="text-xs text-slate-300 font-mono select-none">—</span>;
        }
        return (
          <div className="flex items-center justify-center gap-1.5">
            <AppButton
              variant="outline"
              size="sm"
              disabled={isCurrent || isUpdating || isDeleting}
              onClick={() => handleToggleRole(item)}
              className="text-xs h-7 px-2.5 border-slate-300 text-slate-700 hover:bg-slate-50"
              isLoading={isUpdating}
            >
              {item.role === 'ADMIN' ? 'Hạ xuống USER' : 'Nâng lên ADMIN'}
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              disabled={isCurrent || isUpdating || isDeleting}
              onClick={() => handleDeleteUser(item)}
              className="text-xs h-7 px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              title="Xóa người dùng"
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              isLoading={isDeleting}
            />
          </div>
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
                QUẢN TRỊ NGƯỜI DÙNG
              </AppTag>
              <span className="text-xs font-mono text-slate-400">
                {total} tài khoản trong hệ thống
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
              onClick={() => loadUsers(page, limit, appliedSearch, appliedRole)}
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
        onFilter={handleFilter}
        filterLabel="Lọc"
        searchPlaceholder="Tìm theo tên đăng nhập hoặc email..."
        filters={filters}
        activeFilters={activeFilters}
        onReset={handleResetFilters}
        columns={columns}
        data={sortedUsers}
        isLoading={isLoading}
        loadingMessage="Đang tải danh sách người dùng..."
        emptyMessage="Không tìm thấy người dùng phù hợp."
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        page={page}
        limit={limit}
        total={total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 20, 50, 100]}
      />

      <AppConfirmModal
        isOpen={Boolean(confirmModal)}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleConfirmAction}
        title={
          confirmModal?.type === 'delete' ? 'Xác nhận xóa tài khoản' : 'Xác nhận thay đổi vai trò'
        }
        message={
          confirmModal?.type === 'delete'
            ? `Bạn có chắc chắn muốn xóa tài khoản "${confirmModal.user.username}"?`
            : `Bạn có chắc muốn chuyển vai trò của "${confirmModal?.user.username}" sang "${confirmModal?.nextRole}"?`
        }
        confirmText={confirmModal?.type === 'delete' ? 'Xóa người dùng' : 'Cập nhật vai trò'}
        variant={confirmModal?.type === 'delete' ? 'danger' : 'primary'}
        isLoading={Boolean(updatingUserId || deletingUserId)}
      />
    </>
  );
}
