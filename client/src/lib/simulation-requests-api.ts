import { getClientSessionId } from './telemetry';

export type SimulationRequestStatus =
  'PENDING' | 'UNDER_REVIEW' | 'PLANNED' | 'IN_DEVELOPMENT' | 'COMPLETED' | 'REJECTED';

export interface SimulationRequestAuthor {
  id?: string;
  name: string;
  role?: string;
  avatarUrl?: string | null;
}

export interface SimulationRequestItem {
  id: string;
  title: string;
  category: string;
  description: string;
  whyInteresting: string | null;
  proposedControls: string | null;
  referenceUrl: string | null;
  status: SimulationRequestStatus;
  voteCount: number;
  hasVoted: boolean;
  author: SimulationRequestAuthor;
  adminNotes: string | null;
  targetSlug: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSimulationRequests {
  data: SimulationRequestItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateSimulationRequestPayload {
  title: string;
  category: string;
  description: string;
  whyInteresting?: string;
  proposedControls?: string;
  referenceUrl?: string;
  guestName?: string;
  guestEmail?: string;
  clientSession?: string;
}

export interface QuerySimulationRequestsParams {
  page?: number;
  limit?: number;
  status?: SimulationRequestStatus;
  category?: string;
  search?: string;
  sortBy?: 'votes' | 'newest' | 'oldest';
  clientSession?: string;
}

export interface ToggleVoteResponse {
  success: boolean;
  voted: boolean;
  voteCount: number;
}

export interface UpdateSimulationRequestStatusPayload {
  status?: SimulationRequestStatus;
  adminNotes?: string;
  targetSlug?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4101/api/v1';

/**
 * Lấy danh sách đề xuất công khai kèm bộ lọc và phân trang
 */
export async function fetchSimulationRequests(
  params: QuerySimulationRequestsParams = {},
): Promise<PaginatedSimulationRequests> {
  try {
    const sessionId = params.clientSession || getClientSessionId();
    const query = new URLSearchParams();

    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search?.trim()) query.set('search', params.search.trim());
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (sessionId) query.set('clientSession', sessionId);

    const res = await fetch(`${API_BASE_URL}/simulation-requests?${query.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'x-session-id': sessionId,
      },
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch simulation requests: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching simulation requests:', error);
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  }
}

/**
 * Gửi đề xuất bài toán / thí nghiệm mới
 */
export async function createSimulationRequest(payload: CreateSimulationRequestPayload): Promise<{
  success: boolean;
  data?: SimulationRequestItem;
  error?: string;
  errors?: Record<string, string[]>;
}> {
  try {
    const sessionId = payload.clientSession || getClientSessionId();
    const res = await fetch(`${API_BASE_URL}/simulation-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-session-id': sessionId,
      },
      credentials: 'include',
      body: JSON.stringify({
        ...payload,
        clientSession: sessionId,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Không thể gửi đề xuất. Vui lòng thử lại.',
        errors: json.errors,
      };
    }

    return {
      success: true,
      data: json,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi kết nối máy chủ',
    };
  }
}

/**
 * Toggle bình chọn (Upvote / Unvote)
 */
export async function toggleSimulationRequestVote(
  requestId: string,
): Promise<ToggleVoteResponse | null> {
  try {
    const sessionId = getClientSessionId();
    const res = await fetch(`${API_BASE_URL}/simulation-requests/${requestId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-session-id': sessionId,
      },
      credentials: 'include',
      body: JSON.stringify({
        clientSession: sessionId,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to toggle vote: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error toggling simulation request vote:', error);
    return null;
  }
}

/**
 * Quản trị viên: Lấy danh sách đề xuất
 */
export async function fetchAdminSimulationRequests(
  params: QuerySimulationRequestsParams = {},
): Promise<PaginatedSimulationRequests> {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search?.trim()) query.set('search', params.search.trim());

    const res = await fetch(`${API_BASE_URL}/admin/simulation-requests?${query.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch admin simulation requests: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching admin simulation requests:', error);
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  }
}

/**
 * Quản trị viên: Cập nhật trạng thái đề xuất
 */
export async function updateAdminSimulationRequestStatus(
  id: string,
  payload: UpdateSimulationRequestStatusPayload,
): Promise<{ success: boolean; data?: SimulationRequestItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/simulation-requests/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: json.message || 'Không thể cập nhật trạng thái',
      };
    }

    return {
      success: true,
      data: json,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi kết nối máy chủ',
    };
  }
}

/**
 * Quản trị viên: Xóa mềm đề xuất
 */
export async function deleteAdminSimulationRequest(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/simulation-requests/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      const json = await res.json();
      return {
        success: false,
        error: json.message || 'Không thể xóa đề xuất',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi kết nối máy chủ',
    };
  }
}
