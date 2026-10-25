import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CommentsView } from './comments-view';
import * as adminApi from '@/lib/admin-api';

// @ts-expect-error global flag for react act
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/lib/admin-api', () => ({
  fetchAdminComments: vi.fn(),
  deleteAdminComment: vi.fn(),
}));

describe('CommentsView', () => {
  let container: HTMLDivElement;
  let root: Root;

  const mockComments: adminApi.AdminCommentItem[] = [
    {
      id: 'comment-active',
      content: 'Bình luận đang hoạt động',
      simulationSlug: 'monty-hall',
      parentId: null,
      createdAt: '2026-10-24T10:00:00.000Z',
      isDeleted: false,
      user: {
        id: 'user-1',
        username: 'galileo',
        role: 'USER',
      },
      parent: null,
    },
    {
      id: 'comment-deleted',
      content: 'Bình luận đã bị xóa vi phạm',
      simulationSlug: 'monty-hall',
      parentId: null,
      createdAt: '2026-10-24T11:00:00.000Z',
      isDeleted: true,
      deletedAt: '2026-10-24T12:00:00.000Z',
      user: {
        id: 'user-2',
        username: 'newton',
        role: 'USER',
      },
      parent: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.fetchAdminComments).mockResolvedValue(mockComments);
    vi.mocked(adminApi.deleteAdminComment).mockResolvedValue({ success: true });
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

  it('renders "Đã xoá" column header and displays "Đã xoá" only for deleted comments', async () => {
    await act(async () => {
      root.render(<CommentsView />);
    });

    // Check table headers
    const ths = Array.from(container.querySelectorAll('th'));
    const deletedHeader = ths.find(th => th.textContent?.trim().toLowerCase() === 'đã xoá');
    expect(deletedHeader).toBeDefined();

    // Check rows
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);

    // Row 1 (active): "Đã xoá" cell should be empty
    const rowActive = rows[0];
    const cellsActive = rowActive.querySelectorAll('td');
    // Column index 4 is the "Đã xoá" column
    const deletedCellActive = cellsActive[4];
    expect(deletedCellActive.textContent?.trim()).toBe('');

    // Row 2 (deleted): "Đã xoá" cell should contain "Đã xoá"
    const rowDeleted = rows[1];
    const cellsDeleted = rowDeleted.querySelectorAll('td');
    const deletedCellDeleted = cellsDeleted[4];
    expect(deletedCellDeleted.textContent?.trim()).toBe('Đã xoá');

    // Row 2 action column should show dash "—" instead of delete button
    const actionCellDeleted = cellsDeleted[5];
    expect(actionCellDeleted.textContent?.trim()).toBe('—');
    expect(actionCellDeleted.querySelector('button')).toBeNull();
  });

  it('updates comment to "Đã xoá" when delete action is executed', async () => {
    const activeComment = { ...mockComments[0] };
    const deletedComment = { ...mockComments[1] };
    vi.mocked(adminApi.fetchAdminComments)
      .mockResolvedValueOnce([activeComment, deletedComment])
      .mockResolvedValueOnce([{ ...activeComment, isDeleted: true }, deletedComment]);

    await act(async () => {
      root.render(<CommentsView />);
    });

    const rows = container.querySelectorAll('tbody tr');
    const rowActive = rows[0];
    const deleteButton = rowActive.querySelector('button');
    expect(deleteButton).not.toBeNull();

    await act(async () => {
      deleteButton?.click();
    });

    expect(adminApi.deleteAdminComment).toHaveBeenCalledWith('comment-active');

    // After deletion, the cell should now display "Đã xoá"
    const updatedRows = container.querySelectorAll('tbody tr');
    const updatedRowActive = updatedRows[0];
    const cells = updatedRowActive.querySelectorAll('td');
    expect(cells[4].textContent?.trim()).toBe('Đã xoá');
  });
});
