import type { Player, PlayerCreate, PlayerUpdate } from "@/types/player";
import api from "./api";
import { BaseService } from "./baseService";

class PlayerService extends BaseService<Player, PlayerCreate, PlayerUpdate> {
  constructor() {
    super("/api/players");
  }

  async getMatches(id: string, params?: { skip?: number; limit?: number }) {
    const response = await api.get(`/api/players/${id}/matches`, { params });
    return response.data;
  }

  async getChampionStats(id: string) {
    const response = await api.get(`/api/players/${id}/champions`);
    return response.data;
  }

  async getTeams(id: string) {
    const response = await api.get(`/api/players/${id}/teams`);
    return response.data;
  }
}

export const playerService = new PlayerService();
