import type {
  AuthToken,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth";
import api from "./api";

/**
 * Login with username and password
 * Returns access token on success
 */
export const login = async (credentials: LoginRequest): Promise<AuthToken> => {
  // FastAPI OAuth2PasswordRequestForm expects form data
  const formData = new URLSearchParams();
  formData.append("username", credentials.username);
  formData.append("password", credentials.password);

  const response = await api.post<AuthToken>("/api/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
};

/**
 * Register a new user
 * Returns the created user on success
 */
export const register = async (
  userData: RegisterRequest,
): Promise<AuthUser> => {
  const response = await api.post<AuthUser>("/api/auth/register", userData);
  return response.data;
};

/**
 * Get current user profile using token
 */
export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await api.get<AuthUser>("/api/users/me");
  return response.data;
};
