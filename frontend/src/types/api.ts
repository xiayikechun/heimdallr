export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

export interface ApiError {
  code: number;
  message: string;
  detail?: string;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
}