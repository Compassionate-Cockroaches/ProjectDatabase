import api from "./api";
import type { User, UserCreate, UserUpdate } from "@/types/user";

export const userService = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }): Promise<User[]> => {
    const response = await api.get("/api/users/", { params });
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  create: async (data: UserCreate): Promise<User> => {
    const response = await api.post("/api/users/", data);
    return response.data;
  },

  update: async (id: number, data: UserUpdate): Promise<User> => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/api/users/me");
    return response.data;
  },
};
