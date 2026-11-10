'use client';

import * as React from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import {
  AppTableFilter,
  AppTag,
  AppButton,
  AppConfirmModal,
  AppSelect,
  type AppTableColumn,
  type AppFilterField,
  type AppActiveFilter,
} from '@/components/ui';
import {
  AdminUserItem,
  fetchAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
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
  const [confirmModal, setConfirmModal] = React.useState<{
    type: 'role' | 'status';
    user: AdminUserItem;
    nextRole?: 'ADMIN' | 'USER';
    nextStatus?: boolean;
  } | null>(null);

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

  const handleRoleChange = (user: AdminUserItem, newRole: string) => {
    if (user.username === currentAdminUsername) {
      return;
    }
    if (newRole === user.role) return;

    setConfirmModal({
      type: 'role',
      user,
      nextRole: newRole as 'ADMIN' | 'USER',
    });
  };

  const handleStatusToggle = (user: AdminUserItem) => {
    if (user.username === currentAdminUsername) {
      return;
    }

    setConfirmModal({
      type: 'status',
      user,
      nextStatus: !user.isActive,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal) return;

    setUpdatingUserId(confirmModal.user.id);

    if (confirmModal.type === 'role' && confirmModal.nextRole) {
      const res = await updateAdminUserRole(confirmModal.user.id, confirmModal.nextRole);
      if (res.success) {
        await loadUsers();
      } else {
        alert(res.error || 'Lỗi khi cập nhật vai trò');
      }
    } else if (confirmModal.type === 'status' && confirmModal.nextStatus !== undefined) {
      const res = await updateAdminUserStatus(confirmModal.user.id, confirmModal.nextStatus);
      if (res.success) {
        await loadUsers();
      } else {
        alert(res.error || 'Lỗi khi cập nhật trạng thái');
      }
    }

    setUpdatingUserId(null);
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

  const roleOptions = [
    { value: 'ADMIN', label: 'Quản trị viên' },
    { value: 'USER', label: 'Người dùng' },
  ];

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
      width: 170,
      align: 'center',
      render: item => {
        const isCurrent = item.username === currentAdminUsername;
        const isUpdating = updatingUserId === item.id;

        if (item.isDeleted) {
          return (
            <AppTag
              variant={item.role === 'ADMIN' ? 'blue' : 'default'}
              size="sm"
              icon={<Shield className="h-3 w-3 mr-1" />}
            >
              {item.role}
            </AppTag>
          );
        }

        return (
          <AppSelect
            size="sm"
            value={item.role}
            disabled={isCurrent || isUpdating}
            options={roleOptions}
            onValueChange={v => handleRoleChange(item, v)}
            containerClassName="w-[150px]"
          />
        );
      },
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      width: 110,
      align: 'center',
      render: item => {
        const isCurrent = item.username === currentAdminUsername;
        const isUpdating = updatingUserId === item.id;

        if (item.isDeleted) {
          return <span className="text-xs text-slate-300 font-mono select-none">—</span>;
        }

        return (
          <button
            type="button"
            role="switch"
            aria-checked={item.isActive}
            aria-label={`Trạng thái ${item.username}`}
            disabled={isCurrent || isUpdating}
            onClick={() => handleStatusToggle(item)}
            className={`
              relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full
              border-2 border-transparent transition-colors duration-200 ease-in-out
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${item.isActive ? 'bg-emerald-500' : 'bg-slate-300'}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm
                ring-0 transition-transform duration-200 ease-in-out
                ${item.isActive ? 'translate-x-4' : 'translate-x-0.5'}
              `}
            />
          </button>
        );
      },
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
  ];

  const getConfirmModalTitle = () => {
    if (!confirmModal) return '';
    if (confirmModal.type === 'status') {
      return confirmModal.nextStatus ? 'Xác nhận kích hoạt tài khoản' : 'Xác nhận vô hiệu hóa';
    }
    return 'Xác nhận thay đổi vai trò';
  };

  const getConfirmModalMessage = () => {
    if (!confirmModal) return '';
    if (confirmModal.type === 'status') {
      return confirmModal.nextStatus
        ? `Bạn có chắc muốn kích hoạt lại tài khoản "${confirmModal.user.username}"?`
        : `Bạn có chắc muốn vô hiệu hóa tài khoản "${confirmModal.user.username}"? Người dùng sẽ không thể đăng nhập.`;
    }
    return `Bạn có chắc muốn chuyển vai trò của "${confirmModal.user.username}" sang "${confirmModal.nextRole}"?`;
  };

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
        pageSize={limit}
        total={total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 20, 50, 100]}
      />

      <AppConfirmModal
        isOpen={Boolean(confirmModal)}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleConfirmAction}
        title={getConfirmModalTitle()}
        message={getConfirmModalMessage()}
        confirmText={
          confirmModal?.type === 'status'
            ? confirmModal.nextStatus
              ? 'Kích hoạt'
              : 'Vô hiệu hóa'
            : 'Cập nhật vai trò'
        }
        variant={confirmModal?.type === 'status' && !confirmModal.nextStatus ? 'danger' : 'primary'}
        isLoading={Boolean(updatingUserId)}
      />
    </>
  );
}
