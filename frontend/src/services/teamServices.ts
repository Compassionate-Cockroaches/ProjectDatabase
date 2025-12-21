import api from "./api";
import type { Team, TeamCreate, TeamUpdate } from "@/types/team";

export const teamService = {
  getAll: async (): Promise<Team[]> => {
    const response = await api.get("/api/teams/");
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
};
