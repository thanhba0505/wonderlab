import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CommentSection } from './comment-section';
import * as commentsApi from '@/lib/comments-api';
import * as authContext from '@/lib/auth-context';

// @ts-expect-error global flag for react act
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setNativeTextareaValue(element: HTMLTextAreaElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value',
  )?.set;
  valueSetter?.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

vi.mock('@/lib/comments-api', () => ({
  fetchSimulationComments: vi.fn(),
  postSimulationComment: vi.fn(),
  deleteSimulationComment: vi.fn(),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: vi.fn(),
}));

describe('CommentSection', () => {
  let container: HTMLDivElement;
  let root: Root;

  const mockUser = {
    id: 'user-1',
    username: 'scientific_user',
    email: 'user@wonderlab.vn',
    role: 'USER' as const,
    isEmailVerified: true,
  };

  const initialComments: commentsApi.SimulationComment[] = [
    {
      id: 'comment-1',
      content: 'Bình luận giả thuyết khoa học ban đầu',
      simulationSlug: 'monty-hall',
      parentId: null,
      user: { id: 'user-1', username: 'scientific_user', role: 'USER' },
      createdAt: new Date().toISOString(),
      replies: [],
    },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    vi.mocked(authContext.useAuth).mockReturnValue({
      user: mockUser,
      login: vi.fn(),
    } as unknown as ReturnType<typeof authContext.useAuth>);

    vi.mocked(commentsApi.fetchSimulationComments).mockResolvedValue(initialComments);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it('renders initial comments after loading', async () => {
    await act(async () => {
      root.render(<CommentSection simulationSlug="monty-hall" />);
    });

    expect(container.textContent).toContain('Bình luận giả thuyết khoa học ban đầu');
    expect(container.textContent).toContain('scientific_user');
  });

  it('submits a root comment and optimistically updates without showing loader flash', async () => {
    const newComment: commentsApi.SimulationComment = {
      id: 'comment-2',
      content: 'Nhận định mới về xác suất',
      simulationSlug: 'monty-hall',
      parentId: null,
      user: { id: 'user-1', username: 'scientific_user', role: 'USER' },
      createdAt: new Date().toISOString(),
      replies: [],
    };

    vi.mocked(commentsApi.postSimulationComment).mockResolvedValue({
      success: true,
      comment: newComment,
    });

    await act(async () => {
      root.render(<CommentSection simulationSlug="monty-hall" />);
    });

    const textarea = container.querySelector('textarea');
    expect(textarea).not.toBeNull();

    await act(async () => {
      setNativeTextareaValue(textarea!, 'Nhận định mới về xác suất');
    });

    const form = container.querySelector('form');
    expect(form).not.toBeNull();

    await act(async () => {
      form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(commentsApi.postSimulationComment).toHaveBeenCalledWith(
      'monty-hall',
      'Nhận định mới về xác suất',
    );
    expect(container.textContent).toContain('Nhận định mới về xác suất');
    // Ensure the loading placeholder is not displayed
    expect(container.textContent).not.toContain('Đang tải danh sách thảo luận...');
  });

  it('submits a reply and appends it to replies without whole list reload', async () => {
    const newReply: commentsApi.SimulationComment = {
      id: 'reply-1',
      content: 'Câu trả lời phản biện cấp 2',
      simulationSlug: 'monty-hall',
      parentId: 'comment-1',
      user: { id: 'user-1', username: 'scientific_user', role: 'USER' },
      createdAt: new Date().toISOString(),
    };

    vi.mocked(commentsApi.postSimulationComment).mockResolvedValue({
      success: true,
      comment: newReply,
    });

    await act(async () => {
      root.render(<CommentSection simulationSlug="monty-hall" />);
    });

    // Click "Trả lời" button
    const replyButtons = Array.from(container.querySelectorAll('button')).filter(b =>
      b.textContent?.includes('Trả lời'),
    );
    expect(replyButtons.length).toBeGreaterThan(0);

    await act(async () => {
      replyButtons[0].click();
    });

    // There should now be a reply textarea
    const textareas = container.querySelectorAll('textarea');
    expect(textareas.length).toBe(2);
    const replyTextarea = textareas[1];

    await act(async () => {
      setNativeTextareaValue(replyTextarea, 'Câu trả lời phản biện cấp 2');
    });

    // Click "Gửi phản hồi"
    const submitReplyBtn = Array.from(container.querySelectorAll('button')).find(b =>
      b.textContent?.includes('Gửi phản hồi'),
    );
    expect(submitReplyBtn).toBeDefined();

    await act(async () => {
      submitReplyBtn!.click();
    });

    expect(commentsApi.postSimulationComment).toHaveBeenCalledWith(
      'monty-hall',
      'Câu trả lời phản biện cấp 2',
      'comment-1',
    );
    expect(container.textContent).toContain('Câu trả lời phản biện cấp 2');
    expect(container.textContent).not.toContain('Đang tải danh sách thảo luận...');
  });

  it('deletes a comment and removes it immediately without full reloading', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(commentsApi.deleteSimulationComment).mockResolvedValue({
      success: true,
    });

    await act(async () => {
      root.render(<CommentSection simulationSlug="monty-hall" />);
    });

    expect(container.textContent).toContain('Bình luận giả thuyết khoa học ban đầu');

    const deleteBtn = container.querySelector('button[title="Xóa bình luận này"]');
    expect(deleteBtn).not.toBeNull();

    await act(async () => {
      (deleteBtn as HTMLButtonElement).click();
    });

    expect(commentsApi.deleteSimulationComment).toHaveBeenCalledWith('comment-1');
    expect(container.textContent).not.toContain('Bình luận giả thuyết khoa học ban đầu');
    expect(container.textContent).not.toContain('Đang tải danh sách thảo luận...');
  });
});
