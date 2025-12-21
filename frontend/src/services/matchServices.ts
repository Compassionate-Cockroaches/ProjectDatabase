import api from "./api";
import type { Match, MatchCreate, MatchUpdate } from "@/types/match";

export const matchService = {
  getAll: async (params?: { skip?: number; limit?: number; tournament_id?: string }): Promise<Match[]> => {
    const response = await api.get("/api/matches/", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Match> => {
    const response = await api.get(`/api/matches/${id}`);
    return response.data;
  },

  create: async (data: MatchCreate): Promise<Match> => {
    const response = await api.post("/api/matches/", data);
    return response.data;
  },

  update: async (id: string, data: MatchUpdate): Promise<Match> => {
    const response = await api.put(`/api/matches/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/matches/${id}`);
  },
};
