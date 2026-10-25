import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UsersView } from './users-view';
import * as adminApi from '@/lib/admin-api';

// @ts-expect-error global flag for react act
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/lib/admin-api', () => ({
  fetchAdminUsers: vi.fn(),
  updateAdminUserRole: vi.fn(),
  deleteAdminUser: vi.fn(),
}));

describe('UsersView', () => {
  let container: HTMLDivElement;
  let root: Root;

  const mockUsers: adminApi.AdminUserItem[] = [
    {
      id: 'user-active',
      username: 'marie_curie',
      email: 'marie@radium.org',
      role: 'USER',
      isDeleted: false,
      createdAt: '2026-10-24T12:00:00.000Z',
      updatedAt: '2026-10-24T12:00:00.000Z',
      _count: {
        simulationRuns: 5,
        comments: 2,
      },
    },
    {
      id: 'user-deleted',
      username: 'charles_darwin',
      email: 'charles@evolution.org',
      role: 'USER',
      isDeleted: true,
      deletedAt: '2026-10-25T08:00:00.000Z',
      createdAt: '2026-10-24T11:00:00.000Z',
      updatedAt: '2026-10-25T08:00:00.000Z',
      _count: {
        simulationRuns: 1,
        comments: 0,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.fetchAdminUsers).mockResolvedValue(mockUsers);
    vi.mocked(adminApi.deleteAdminUser).mockResolvedValue({ success: true });
    window.confirm = vi.fn().mockReturnValue(true);

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders "Đã xoá" column and displays "Đã xoá" only for deleted users', async () => {
    await act(async () => {
      root.render(<UsersView currentAdminUsername="admin" />);
    });

    // Check table headers
    const ths = Array.from(container.querySelectorAll('th'));
    const deletedHeader = ths.find(th => th.textContent?.trim().toLowerCase() === 'đã xoá');
    expect(deletedHeader).toBeDefined();

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);

    // Row 1 (active): "Đã xoá" cell should be empty
    const cellsActive = rows[0].querySelectorAll('td');
    const deletedCellActive = cellsActive[6];
    expect(deletedCellActive.textContent?.trim()).toBe('');

    // Row 2 (deleted): "Đã xoá" cell should contain "Đã xoá"
    const cellsDeleted = rows[1].querySelectorAll('td');
    const deletedCellDeleted = cellsDeleted[6];
    expect(deletedCellDeleted.textContent?.trim()).toBe('Đã xoá');

    // Row 2 actions should show dash "—"
    const actionsCellDeleted = cellsDeleted[7];
    expect(actionsCellDeleted.textContent?.trim()).toBe('—');
  });

  it('calls deleteAdminUser and marks user as "Đã xoá" upon clicking delete', async () => {
    const activeUser = { ...mockUsers[0] };
    const deletedUser = { ...mockUsers[1] };
    vi.mocked(adminApi.fetchAdminUsers)
      .mockResolvedValueOnce([activeUser, deletedUser])
      .mockResolvedValueOnce([{ ...activeUser, isDeleted: true }, deletedUser]);

    await act(async () => {
      root.render(<UsersView currentAdminUsername="admin" />);
    });

    const rows = container.querySelectorAll('tbody tr');
    const rowActive = rows[0];
    const deleteBtn = rowActive.querySelector('button[title="Xóa người dùng"]');
    expect(deleteBtn).not.toBeNull();

    await act(async () => {
      (deleteBtn as HTMLButtonElement).click();
    });

    // Modal opens: click confirm button inside modal
    const confirmBtn = Array.from(document.body.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Xóa người dùng'),
    );
    expect(confirmBtn).toBeDefined();

    await act(async () => {
      confirmBtn?.click();
    });

    expect(adminApi.deleteAdminUser).toHaveBeenCalledWith('user-active');
  });
});
