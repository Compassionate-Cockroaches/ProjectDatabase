import {
  getDashboardStats,
  getPlayerLeaderboard,
  getTeamLeaderboard,
  getTournamentLeaderboard,
} from "@/services/analyticsService";
import type {
  AnalyticsFilters,
  PlayerMetric,
  TournamentMetric,
} from "@/types/analytics";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch player leaderboard
 */
export const usePlayerLeaderboard = (
  metric: PlayerMetric,
  filters: AnalyticsFilters = {},
) => {
  return useQuery({
    queryKey: ["analytics", "players", metric, filters],
    queryFn: () => getPlayerLeaderboard(metric, filters),
  });
};

/**
 * Hook to fetch team leaderboard
 */
export const useTeamLeaderboard = (filters: AnalyticsFilters = {}) => {
  return useQuery({
    queryKey: ["analytics", "teams", filters],
    queryFn: () => getTeamLeaderboard(filters),
  });
};

/**
 * Hook to fetch tournament leaderboard
 */
export const useTournamentLeaderboard = (
  metric: TournamentMetric,
  filters: AnalyticsFilters = {},
) => {
  return useQuery({
    queryKey: ["analytics", "tournaments", metric, filters],
    queryFn: () => getTournamentLeaderboard(metric, filters),
  });
};

/**
 * Hook to fetch dashboard statistics
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: getDashboardStats,
  });
};
