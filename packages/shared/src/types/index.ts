// Shared type definitions

/** Standard API response envelope */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/** API error structure */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

/** Pagination parameters */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Paginated response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
