import { SimulationRequestStatus } from '@/lib/simulation-requests-api';

export const SIMULATION_CATEGORIES = [
  'Toán học & Xác suất',
  'Vật lý & Lượng tử',
  'Nghịch lý Logic & Triết học',
  'Lý thuyết Trò chơi & Nhận thức',
  'Khác',
] as const;

export const CATEGORY_LOCALIZATIONS: Record<string, { vi: string; en: string }> = {
  'Toán học & Xác suất': { vi: 'Toán học & Xác suất', en: 'Mathematics & Probability' },
  'Vật lý & Lượng tử': { vi: 'Vật lý & Lượng tử', en: 'Physics & Quantum Mechanics' },
  'Nghịch lý Logic & Triết học': {
    vi: 'Nghịch lý Logic & Triết học',
    en: 'Logic Paradoxes & Philosophy',
  },
  'Lý thuyết Trò chơi & Nhận thức': {
    vi: 'Lý thuyết Trò chơi & Nhận thức',
    en: 'Game Theory & Cognition',
  },
  Khác: { vi: 'Khác', en: 'Other' },
};

export interface StatusConfig {
  label: string;
  variant: 'default' | 'outline' | 'violet' | 'amber' | 'emerald' | 'blue' | 'red';
  description: string;
}

export const STATUS_CONFIG: Record<SimulationRequestStatus, StatusConfig> = {
  PENDING: {
    label: 'Chờ xem xét',
    variant: 'default',
    description: 'Đề xuất mới gửi, ban biên tập đang xếp lịch đọc',
  },
  UNDER_REVIEW: {
    label: 'Đang thẩm định',
    variant: 'violet',
    description: 'Đang phân tích tính khả thi và cơ sở khoa học',
  },
  PLANNED: {
    label: 'Đã lên lịch',
    variant: 'amber',
    description: 'Đã duyệt vào lộ trình phát triển của phòng Lab',
  },
  IN_DEVELOPMENT: {
    label: 'Đang phát triển',
    variant: 'blue',
    description: 'Đội ngũ đang lập trình thuật toán và đồ họa tương tác',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    variant: 'emerald',
    description: 'Đã ra mắt chính thức trong Phòng Lab thực nghiệm',
  },
  REJECTED: {
    label: 'Chưa khả thi',
    variant: 'red',
    description: 'Trùng lặp hoặc chưa phù hợp với định dạng mô phỏng',
  },
};
