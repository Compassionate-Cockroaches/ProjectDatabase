import api from "./api";
import type { Tournament, TournamentCreate, TournamentUpdate } from "@/types/tournament";

export const tournamentService = {
  getAll: async (params?: { skip?: number; limit?: number; year?: number; league?: string; playoffs?: boolean }): Promise<Tournament[]> => {
    const response = await api.get("/api/tournaments/", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Tournament> => {
    const response = await api.get(`/api/tournaments/${id}`);
    return response.data;
  },

  create: async (data: TournamentCreate): Promise<Tournament> => {
    const response = await api.post("/api/tournaments/", data);
    return response.data;
  },

  update: async (id: string, data: TournamentUpdate): Promise<Tournament> => {
    const response = await api.put(`/api/tournaments/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/tournaments/${id}`);
  },
};
