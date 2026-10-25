export interface CommentAuthor {
  id: string;
  username: string;
  role: 'ADMIN' | 'USER';
}

export interface SimulationComment {
  id: string;
  content: string;
  simulationSlug: string;
  parentId: string | null;
  user: CommentAuthor;
  createdAt: string;
  replies?: SimulationComment[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4101/api/v1';

/**
 * Lấy danh sách bình luận (cấu trúc 2 cấp) của một mô phỏng
 */
export async function fetchSimulationComments(slug: string): Promise<SimulationComment[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/simulations/${slug}/comments`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error(`Failed to load comments: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export interface PostCommentResult {
  success: boolean;
  comment?: SimulationComment;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Đăng bình luận gốc (Level 1) hoặc phản hồi (Level 2)
 */
export async function postSimulationComment(
  slug: string,
  content: string,
  parentId?: string,
): Promise<PostCommentResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/simulations/${slug}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        content,
        parentId: parentId || undefined,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      let errorMessage = 'Lỗi khi gửi bình luận';
      if (typeof data.message === 'string') {
        errorMessage = data.message;
      } else if (Array.isArray(data.message) && data.message.length > 0) {
        errorMessage = String(data.message[0]);
      } else if (typeof data.error === 'string') {
        errorMessage = data.error;
      }

      return {
        success: false,
        error: errorMessage,
        errors: data.errors,
      };
    }

    return {
      success: true,
      comment: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi kết nối máy chủ',
    };
  }
}

/**
 * Xóa bình luận (chỉ tác giả hoặc ADMIN)
 */
export async function deleteSimulationComment(
  commentId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.message || 'Không thể xóa bình luận',
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
