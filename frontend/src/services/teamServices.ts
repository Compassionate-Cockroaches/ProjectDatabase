import type { Team, TeamCreate, TeamUpdate } from "@/types/team";
import api from "./api";
import { BaseService } from "./baseService";

class TeamService extends BaseService<Team, TeamCreate, TeamUpdate> {
  constructor() {
    super("/api/teams");
  }

  async getTournaments(id: string) {
    const response = await api.get(`/api/teams/${id}/tournaments`);
    return response.data;
  }

  async getMatches(id: string, params?: { skip?: number; limit?: number }) {
    const response = await api.get(`/api/teams/${id}/matches`, { params });
    return response.data;
  }

  async getPlayers(id: string) {
    const response = await api.get(`/api/teams/${id}/players`);
    return response.data;
  }

  async getStats(id: string) {
    const response = await api.get(`/api/teams/${id}/stats`);
    return response.data;
  }
}

export const teamService = new TeamService();
