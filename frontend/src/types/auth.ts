// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  role?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  role: string;
  disabled: boolean;
  created_at: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
