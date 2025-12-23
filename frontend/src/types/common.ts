export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CRUDService<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  getAll: (params?: any) => Promise<T[]>;
  getById: (id: string) => Promise<T>;
  create: (data: TCreate) => Promise<T>;
  update: (id: string, data: TUpdate) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "text" | "select" | "date";
  options?: { value: string; label: string }[];
}

export interface ColumnConfig<T> {
  key: keyof T | string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}