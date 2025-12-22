// Analytics Types

export interface PlayerLeaderboardRow {
  player_id: string;
  player_name: string;
  position: string;
  games_played: number;
  metric: string;
  metric_value: number;
  tournament_label?: string;
  total_kills?: number;
  total_deaths?: number;
  total_assists?: number;
  kda?: number;
  avg_dpm?: number;
  avg_cspm?: number;
  avg_vision?: number;
  win_rate?: number;
}

export interface TeamLeaderboardRow {
  team_id: string;
  team_name: string;
  tournament_label?: string;
  matches_played: number;
  wins: number;
  losses: number;
  win_rate: number;
}

export interface TournamentLeaderboardRow {
  tournament_id: string;
  league: string;
  year: number;
  split: string;
  tournament_label?: string;
  metric: string;
  metric_value: number;
  total_matches: number;
  total_teams: number;
  avg_game_duration?: number;
}

export interface DashboardStats {
  total_teams: number;
  total_players: number;
  total_tournaments: number;
  total_matches: number;
}

export type PlayerMetric = "kda" | "dpm" | "cspm" | "vision" | "winrate";
export type TournamentMetric =
  | "total_matches"
  | "total_teams"
  | "avg_game_duration";

export interface AnalyticsFilters {
  year?: number;
  league?: string;
  split?: string;
  playoffs?: number;
  patch?: string;
  position?: string;
  champion?: string;
  side?: string;
  limit?: number;
  min_games?: number;
  min_matches?: number;
}
