import api from "./api";
import type { Team, TeamCreate, TeamUpdate } from "@/types/team";

export const teamService = {
  getAll: async (params?: { 
    skip?: number; 
    limit?: number; 
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<Team[]> => {
    const response = await api.get("/api/teams/", { params });
    return response.data;
  },

  getById: async (id: string): Promise<Team> => {
    const response = await api.get(`/api/teams/${id}`);
    return response.data;
  },

  create: async (data: TeamCreate): Promise<Team> => {
    const response = await api.post("/api/teams/", data);
    return response.data;
  },

  update: async (id: string, data: TeamUpdate): Promise<Team> => {
    const response = await api.put(`/api/teams/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/teams/${id}`);
  },

  getTournaments: async (id: string) => {
    const response = await api.get(`/api/teams/${id}/tournaments`);
    return response.data;
  },

  getMatches: async (id: string, params?: { skip?: number; limit?: number }) => {
    const response = await api.get(`/api/teams/${id}/matches`, { params });
    return response.data;
  },

  getPlayers: async (id: string) => {
    const response = await api.get(`/api/teams/${id}/players`);
    return response.data;
  },

  getStats: async (id: string) => {
    const response = await api.get(`/api/teams/${id}/stats`);
    return response.data;
  },
};
