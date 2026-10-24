import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchSimulationComments,
  postSimulationComment,
  deleteSimulationComment,
} from './comments-api';

describe('comments-api client SDK', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchSimulationComments', () => {
    it('should return comments array on successful fetch', async () => {
      const mockComments = [
        {
          id: 'c1',
          content: 'Thảo luận thử nghiệm',
          simulationSlug: 'monty-hall',
          parentId: null,
          user: { id: 'u1', username: 'alex', role: 'USER' },
          createdAt: '2026-10-24T12:00:00.000Z',
          replies: [],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockComments,
      });

      const result = await fetchSimulationComments('monty-hall');
      expect(result).toEqual(mockComments);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/simulations/monty-hall/comments'),
        expect.objectContaining({ credentials: 'include' }),
      );
    });

    it('should return empty array on fetch failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await fetchSimulationComments('monty-hall');
      expect(result).toEqual([]);
    });
  });

  describe('postSimulationComment', () => {
    it('should post comment and return success with payload', async () => {
      const mockCreated = {
        id: 'c2',
        content: 'Bình luận mới',
        simulationSlug: 'monty-hall',
        parentId: null,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCreated,
      });

      const result = await postSimulationComment('monty-hall', 'Bình luận mới');
      expect(result.success).toBe(true);
      expect(result.comment).toEqual(mockCreated);
    });

    it('should return error message when API responds with error status', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Hệ thống chỉ hỗ trợ thảo luận tối đa 2 cấp' }),
      });

      const result = await postSimulationComment('monty-hall', 'Phản hồi quá sâu', 'reply-id');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Hệ thống chỉ hỗ trợ thảo luận tối đa 2 cấp');
    });
  });

  describe('deleteSimulationComment', () => {
    it('should send DELETE request and return success', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await deleteSimulationComment('comment-to-delete');
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/comments/comment-to-delete'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });
});
