'use client';

import * as React from 'react';
import { Shield, RefreshCw, Check, RotateCcw, Save } from 'lucide-react';
import {
  AppTableFilter,
  AppTag,
  AppButton,
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

interface UserDraft {
  role: 'ADMIN' | 'USER';
  isActive: boolean;
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

  // Draft changes
  const [drafts, setDrafts] = React.useState<Record<string, UserDraft>>({});
  const [savingUserIds, setSavingUserIds] = React.useState<Set<string>>(new Set());
  const [savingAll, setSavingAll] = React.useState<boolean>(false);

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
        setDrafts({});
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

  // Draft mutations (no immediate API call)
  const handleDraftRoleChange = (user: AdminUserItem, newRole: string) => {
    if (user.username === currentAdminUsername) {
      alert('Không thể tự hạ cấp hoặc thay đổi vai trò tài khoản quản trị của chính bạn.');
      return;
    }

    const currentDraft = drafts[user.id] ?? {
      role: user.role,
      isActive: user.isActive,
    };

    const targetRole = newRole as 'ADMIN' | 'USER';

    if (targetRole === user.role && currentDraft.isActive === user.isActive) {
      setDrafts(prev => {
        const next = { ...prev };
        delete next[user.id];
        return next;
      });
    } else {
      setDrafts(prev => ({
        ...prev,
        [user.id]: {
          ...currentDraft,
          role: targetRole,
        },
      }));
    }
  };

  const handleDraftStatusToggle = (user: AdminUserItem) => {
    if (user.username === currentAdminUsername) {
      alert('Không thể tự vô hiệu hóa tài khoản quản trị của chính bạn.');
      return;
    }

    const currentDraft = drafts[user.id] ?? {
      role: user.role,
      isActive: user.isActive,
    };

    const nextStatus = !currentDraft.isActive;

    if (nextStatus === user.isActive && currentDraft.role === user.role) {
      setDrafts(prev => {
        const next = { ...prev };
        delete next[user.id];
        return next;
      });
    } else {
      setDrafts(prev => ({
        ...prev,
        [user.id]: {
          ...currentDraft,
          isActive: nextStatus,
        },
      }));
    }
  };

  const handleCancelRowEdit = (userId: string) => {
    setDrafts(prev => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  const handleCancelAll = () => {
    setDrafts({});
  };

  // Save changes for a single user
  const handleSaveUser = async (user: AdminUserItem) => {
    const draft = drafts[user.id];
    if (!draft) return;

    setSavingUserIds(prev => new Set(prev).add(user.id));

    try {
      const promises: Promise<{ success: boolean; error?: string }>[] = [];

      if (draft.role !== user.role) {
        promises.push(updateAdminUserRole(user.id, draft.role));
      }

      if (draft.isActive !== user.isActive) {
        promises.push(updateAdminUserStatus(user.id, draft.isActive));
      }

      const results = await Promise.all(promises);
      const failed = results.find(r => !r.success);

      if (failed) {
        alert(failed.error || 'Lỗi khi cập nhật người dùng');
        return;
      }

      // Update local state
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...u, role: draft.role, isActive: draft.isActive } : u,
        ),
      );

      setDrafts(prev => {
        const next = { ...prev };
        delete next[user.id];
        return next;
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi kết nối khi cập nhật người dùng');
    } finally {
      setSavingUserIds(prev => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
    }
  };

  // Save all modified users
  const handleSaveAll = async () => {
    const dirtyUserIds = Object.keys(drafts);
    if (dirtyUserIds.length === 0) return;

    setSavingAll(true);

    try {
      const tasks = dirtyUserIds.map(async userId => {
        const draft = drafts[userId];
        const user = users.find(u => u.id === userId);
        if (!draft || !user) return;

        const promises: Promise<{ success: boolean; error?: string }>[] = [];
        if (draft.role !== user.role) {
          promises.push(updateAdminUserRole(userId, draft.role));
        }
        if (draft.isActive !== user.isActive) {
          promises.push(updateAdminUserStatus(userId, draft.isActive));
        }
        await Promise.all(promises);
      });

      await Promise.all(tasks);

      // Apply all drafts to state
      setUsers(prev =>
        prev.map(u => {
          const draft = drafts[u.id];
          return draft ? { ...u, role: draft.role, isActive: draft.isActive } : u;
        }),
      );

      setDrafts({});
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi kết nối khi lưu toàn bộ');
    } finally {
      setSavingAll(false);
    }
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

  const unsavedCount = Object.keys(drafts).length;

  const columns: AppTableColumn<AdminUserItem>[] = [
    {
      key: 'username',
      header: 'Người dùng',
      sortable: true,
      width: 200,
      render: item => {
        const isCurrent = item.username === currentAdminUsername;
        const isDirty = Boolean(drafts[item.id]);

        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold font-mono shrink-0">
              {item.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-slate-900 block leading-tight truncate">
                  {item.username}
                </span>
                {isDirty && (
                  <span className="rounded-md bg-amber-50 border border-amber-300 text-amber-800 px-1 py-0.2 text-[10px] font-mono whitespace-nowrap">
                    chưa lưu
                  </span>
                )}
              </div>
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
        const draft = drafts[item.id];
        const effectiveRole = draft?.role ?? item.role;
        const isSaving = savingUserIds.has(item.id) || savingAll;

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
            value={effectiveRole}
            disabled={isCurrent || isSaving}
            options={roleOptions}
            onValueChange={v => handleDraftRoleChange(item, v)}
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
        const draft = drafts[item.id];
        const effectiveStatus = draft?.isActive ?? item.isActive;
        const isSaving = savingUserIds.has(item.id) || savingAll;

        if (item.isDeleted) {
          return <span className="text-xs text-slate-300 font-mono select-none">—</span>;
        }

        return (
          <button
            type="button"
            role="switch"
            aria-checked={effectiveStatus}
            aria-label={`Trạng thái ${item.username}`}
            disabled={isCurrent || isSaving}
            onClick={() => handleDraftStatusToggle(item)}
            className={`
              relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full
              border-2 border-transparent transition-colors duration-200 ease-in-out
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${effectiveStatus ? 'bg-emerald-500' : 'bg-slate-300'}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm
                ring-0 transition-transform duration-200 ease-in-out
                ${effectiveStatus ? 'translate-x-4' : 'translate-x-0.5'}
              `}
            />
          </button>
        );
      },
    },
    {
      key: 'actions',
      header: 'Hành động',
      width: 130,
      align: 'center',
      render: item => {
        const draft = drafts[item.id];
        const isDirty = Boolean(draft);
        const isSaving = savingUserIds.has(item.id) || savingAll;

        if (!isDirty) {
          return <span className="text-xs text-slate-300 font-mono select-none">—</span>;
        }

        return (
          <div className="flex items-center justify-center gap-1.5">
            <AppButton
              variant="primary"
              size="sm"
              disabled={isSaving}
              isLoading={isSaving}
              onClick={() => handleSaveUser(item)}
              className="text-xs h-7 px-2.5 font-bold shadow-2xs"
              leftIcon={<Check className="h-3 w-3 stroke-[2.5]" />}
            >
              Lưu
            </AppButton>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleCancelRowEdit(item.id)}
              title="Hủy thay đổi"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
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

  return (
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
          <div className="flex items-center gap-2">
            {unsavedCount > 0 && (
              <>
                <AppButton
                  variant="outline"
                  size="sm"
                  onClick={handleCancelAll}
                  disabled={savingAll}
                  className="text-xs font-medium border-slate-300 text-slate-600 hover:bg-slate-50"
                  leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                >
                  Hủy tất cả
                </AppButton>
                <AppButton
                  variant="primary"
                  size="sm"
                  onClick={handleSaveAll}
                  isLoading={savingAll}
                  className="text-xs font-bold gap-1.5 shadow-2xs"
                  leftIcon={<Save className="h-3.5 w-3.5" />}
                >
                  Lưu tất cả ({unsavedCount})
                </AppButton>
              </>
            )}
            <AppButton
              variant="outline"
              size="sm"
              onClick={() => loadUsers(page, limit, appliedSearch, appliedRole)}
              disabled={isLoading || savingAll}
              className="text-xs font-semibold gap-1.5 border-slate-300 bg-white shadow-2xs shrink-0"
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Làm mới danh sách
            </AppButton>
          </div>
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
  );
}
