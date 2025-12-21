import api from "./api";
import type {
  PlayerLeaderboardRow,
  TeamLeaderboardRow,
  TournamentLeaderboardRow,
  DashboardStats,
  PlayerMetric,
  TournamentMetric,
  AnalyticsFilters,
} from "../types/analytics";

/**
 * Get player leaderboard with filters
 */
export const getPlayerLeaderboard = async (
  metric: PlayerMetric,
  filters: AnalyticsFilters = {}
): Promise<PlayerLeaderboardRow[]> => {
  const params = new URLSearchParams();
  params.append("metric", metric);

  if (filters.year !== undefined) params.append("year", filters.year.toString());
  if (filters.league) params.append("league", filters.league);
  if (filters.split) params.append("split", filters.split);
  if (filters.playoffs !== undefined) params.append("playoffs", filters.playoffs.toString());
  if (filters.patch) params.append("patch", filters.patch);
  if (filters.position) params.append("position", filters.position);
  if (filters.champion) params.append("champion", filters.champion);
  if (filters.side) params.append("side", filters.side);
  if (filters.limit !== undefined) params.append("limit", filters.limit.toString());
  if (filters.min_games !== undefined) params.append("min_games", filters.min_games.toString());

  const response = await api.get<PlayerLeaderboardRow[]>(
    `/api/analytics/leaderboard/players?${params.toString()}`
  );
  return response.data;
};

/**
 * Get team leaderboard with filters
 */
export const getTeamLeaderboard = async (
  filters: AnalyticsFilters = {}
): Promise<TeamLeaderboardRow[]> => {
  const params = new URLSearchParams();

  if (filters.year !== undefined) params.append("year", filters.year.toString());
  if (filters.league) params.append("league", filters.league);
  if (filters.split) params.append("split", filters.split);
  if (filters.playoffs !== undefined) params.append("playoffs", filters.playoffs.toString());
  if (filters.patch) params.append("patch", filters.patch);
  if (filters.limit !== undefined) params.append("limit", filters.limit.toString());
  if (filters.min_matches !== undefined) params.append("min_matches", filters.min_matches.toString());

  const response = await api.get<TeamLeaderboardRow[]>(
    `/api/analytics/leaderboard/teams?${params.toString()}`
  );
  return response.data;
};

/**
 * Get tournament leaderboard with filters
 */
export const getTournamentLeaderboard = async (
  metric: TournamentMetric,
  filters: AnalyticsFilters = {}
): Promise<TournamentLeaderboardRow[]> => {
  const params = new URLSearchParams();
  params.append("metric", metric);

  if (filters.year !== undefined) params.append("year", filters.year.toString());
  if (filters.league) params.append("league", filters.league);
  if (filters.split) params.append("split", filters.split);
  if (filters.playoffs !== undefined) params.append("playoffs", filters.playoffs.toString());
  if (filters.patch) params.append("patch", filters.patch);
  if (filters.limit !== undefined) params.append("limit", filters.limit.toString());

  const response = await api.get<TournamentLeaderboardRow[]>(
    `/api/analytics/leaderboard/tournaments?${params.toString()}`
  );
  return response.data;
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>("/api/analytics/dashboard");
  return response.data;
};
