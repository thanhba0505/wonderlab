export interface AdminOverviewData {
  totalRuns: number;
  totalTrials: number;
  totalUsers: number;
  totalComments: number;
  bySimulation: Record<string, { runs: number; trials: number }>;
  recentRuns: Array<{
    id: string;
    simulationSlug: string;
    trialsCount: number;
    durationMs: number | null;
    createdAt: string;
  }>;
  recentComments: Array<{
    id: string;
    content: string;
    simulationSlug: string;
    parentId: string | null;
    createdAt: string;
    user: {
      username: string;
      role: 'ADMIN' | 'USER';
    };
  }>;
}

export interface AdminUserItem {
  id: string;
  username: string;
  email: string | null;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
  _count: {
    simulationRuns: number;
    comments: number;
  };
}

export interface AdminCommentItem {
  id: string;
  content: string;
  simulationSlug: string;
  parentId: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    role: 'ADMIN' | 'USER';
  };
  parent: {
    id: string;
    content: string;
    user: {
      username: string;
    };
  } | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4101/api/v1';

export async function fetchAdminOverview(): Promise<AdminOverviewData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/simulations/admin/overview`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to load admin overview:', err);
    return null;
  }
}

export async function fetchAdminUsers(): Promise<AdminUserItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Failed to load admin users:', err);
    return [];
  }
}

export async function updateAdminUserRole(
  userId: string,
  role: 'ADMIN' | 'USER',
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.message || 'Lỗi khi cập nhật vai trò' };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi kết nối' };
  }
}

export async function fetchAdminComments(): Promise<AdminCommentItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/comments`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Failed to load admin comments:', err);
    return [];
  }
}

export async function deleteAdminComment(
  commentId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.message || 'Lỗi khi xóa bình luận' };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi kết nối' };
  }
}
