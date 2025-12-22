export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: string;
  disabled: boolean;
  created_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  role?: string;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
}
