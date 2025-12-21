import api from "./api";
import type { Player, PlayerCreate, PlayerUpdate } from "@/types/player";

export const playerService = {
  getAll: async (params?: { skip?: number; limit?: number; search?: string; position?: string }): Promise<Player[]> => {
    const response = await api.get("/api/players/", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Player> => {
    const response = await api.get(`/api/players/${id}`);
    return response.data;
  },

  create: async (data: PlayerCreate): Promise<Player> => {
    const response = await api.post("/api/players/", data);
    return response.data;
  },

  update: async (id: string, data: PlayerUpdate): Promise<Player> => {
    const response = await api.put(`/api/players/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/players/${id}`);
  },
};
