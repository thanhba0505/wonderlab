import { getActiveLocale } from '@/i18n';

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
  isDeleted: boolean;
  deletedAt?: string | null;
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
  isDeleted: boolean;
  deletedAt?: string | null;
  user: {
    id: string;
    username: string;
    role: 'ADMIN' | 'USER';
    isDeleted?: boolean;
  };
  parent: {
    id: string;
    content: string;
    user: {
      username: string;
    };
  } | null;
}

export interface PaginatedAdminResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchAdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface FetchAdminCommentsParams {
  page?: number;
  limit?: number;
  search?: string;
  simulationSlug?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4101/api/v1';

export async function fetchAdminOverview(): Promise<AdminOverviewData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/simulations/admin/overview`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json', 'Accept-Language': getActiveLocale() },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to load admin overview:', err);
    return null;
  }
}

export async function fetchAdminUsers(
  params?: FetchAdminUsersParams,
): Promise<PaginatedAdminResponse<AdminUserItem>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  try {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(page));
    searchParams.set('limit', String(limit));
    if (params?.search?.trim()) {
      searchParams.set('search', params.search.trim());
    }
    if (params?.role && params.role !== 'all') {
      searchParams.set('role', params.role);
    }

    const res = await fetch(`${API_BASE_URL}/users?${searchParams.toString()}`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json', 'Accept-Language': getActiveLocale() },
      cache: 'no-store',
    });
    if (!res.ok) return { data: [], total: 0, page, limit, totalPages: 1 };
    const json = await res.json();
    if (Array.isArray(json)) {
      const start = (page - 1) * limit;
      return {
        data: json.slice(start, start + limit),
        total: json.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(json.length / limit)),
      };
    }
    return json;
  } catch (err) {
    console.error('Failed to load admin users:', err);
    return { data: [], total: 0, page, limit, totalPages: 1 };
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

export async function deleteAdminUser(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { Accept: 'application/json', 'Accept-Language': getActiveLocale() },
    });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.message || 'Lỗi khi xóa người dùng' };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Lỗi kết nối' };
  }
}

export async function fetchAdminComments(
  params?: FetchAdminCommentsParams,
): Promise<PaginatedAdminResponse<AdminCommentItem>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  try {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(page));
    searchParams.set('limit', String(limit));
    if (params?.search?.trim()) {
      searchParams.set('search', params.search.trim());
    }
    if (params?.simulationSlug && params.simulationSlug !== 'all') {
      searchParams.set('simulationSlug', params.simulationSlug);
    }

    const res = await fetch(`${API_BASE_URL}/admin/comments?${searchParams.toString()}`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json', 'Accept-Language': getActiveLocale() },
      cache: 'no-store',
    });
    if (!res.ok) return { data: [], total: 0, page, limit, totalPages: 1 };
    const json = await res.json();
    if (Array.isArray(json)) {
      const start = (page - 1) * limit;
      return {
        data: json.slice(start, start + limit),
        total: json.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(json.length / limit)),
      };
    }
    return json;
  } catch (err) {
    console.error('Failed to load admin comments:', err);
    return { data: [], total: 0, page, limit, totalPages: 1 };
  }
}

export async function deleteAdminComment(
  commentId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { Accept: 'application/json', 'Accept-Language': getActiveLocale() },
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
