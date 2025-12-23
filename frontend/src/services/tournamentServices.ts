import type {
  Tournament,
  TournamentCreate,
  TournamentUpdate,
} from "@/types/tournament";
import api from "./api";
import { BaseService } from "./baseService";

class TournamentService extends BaseService<
  Tournament,
  TournamentCreate,
  TournamentUpdate
> {
  constructor() {
    super("/api/tournaments");
  }

  async getTeams(id: string) {
    const response = await api.get(`/api/tournaments/${id}/teams`);
    return response.data;
  }

  async getMatches(id: string, params?: { skip?: number; limit?: number }) {
    const response = await api.get(`/api/tournaments/${id}/matches`, {
      params,
    });
    return response.data;
  }

  async getStats(id: string) {
    const response = await api.get(`/api/tournaments/${id}/stats`);
    return response.data;
  }
}

export const tournamentService = new TournamentService();
