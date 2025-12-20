import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import * as authService from "../services/authService";
import type { AuthUser, LoginRequest, RegisterRequest } from "../types/auth";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("auth_token");

      if (storedToken) {
        setToken(storedToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user:", error);
          // Token is invalid, clear it
          localStorage.removeItem("auth_token");
          delete api.defaults.headers.common["Authorization"];
          setToken(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const authToken = await authService.login(credentials);
      const accessToken = authToken.access_token;

      // Store token
      localStorage.setItem("auth_token", accessToken);
      setToken(accessToken);

      // Set auth header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      // Fetch user data
      const userData = await authService.getCurrentUser();
      setUser(userData);

      // Navigate to home
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      // Register user
      await authService.register(userData);


      // Auto-login after registration
      await login({
        username: userData.username,
        password: userData.password,
      });
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    // Clear token from storage
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);

    // Remove auth header
    delete api.defaults.headers.common["Authorization"];

    // Navigate to welcome page
    navigate("/welcome");
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
