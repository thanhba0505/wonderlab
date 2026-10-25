export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  errors: Record<string, string[]>;
  timestamp: string;
  path: string;
}

export interface ApiSuccessResponse<T = unknown> {
  statusCode?: number;
  message?: string;
  data?: T;
  timestamp?: string;
}
