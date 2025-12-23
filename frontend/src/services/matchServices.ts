import type { Match, MatchCreate, MatchUpdate } from "@/types/match";
import api from "./api";
import { BaseService } from "./baseService";

class MatchService extends BaseService<Match, MatchCreate, MatchUpdate> {
  constructor() {
    super("/api/matches");
  }

  async getDetails(id: string) {
    const response = await api.get(`/api/matches/${id}/details`);
    return response.data;
  }

  async getPlayerStats(id: string) {
    const response = await api.get(`/api/matches/${id}/player-stats`);
    return response.data;
  }
}

export const matchService = new MatchService();
