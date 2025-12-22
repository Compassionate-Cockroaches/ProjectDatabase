// Match-related statistics and data types

export interface TeamData {
  team_id: string;
  team_name: string;
  side: string;
  result: boolean;
}

export interface PlayerStat {
  player_id: string;
  player_name: string;
  team_id: string;
  team_name: string;
  champion?: string;
  kills?: number;
  deaths?: number;
  assists?: number;
  totalgold?: number;
  damagetochampions?: number;
  visionscore?: number;
  total_cs?: number;
}

export interface TeamTotals {
  kills: number;
  deaths: number;
  assists: number;
  gold: number;
  damage: number;
  vision: number;
}

export interface ChampionStat {
  champion: string;
  games_played: number;
  wins: number;
  win_rate: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  avg_kda: number;
}

export interface TeamInfo {
  team_id: string;
  team_name: string;
  games_played: number;
  wins: number;
  win_rate: number;
}

export interface MatchInfo {
  match_id: string;
  player_id: string;
  champion?: string;
  kills?: number;
  deaths?: number;
  assists?: number;
  result?: boolean;
  totalgold?: number;
  damagetochampions?: number;
  total_cs?: number;
  match_date?: string;
  team_name?: string;
}

export interface TournamentHistory {
  tournament_id: string;
  league: string;
  year: number;
  split?: string;
  playoffs: boolean;
  wins: number;
  losses: number;
  total_games: number;
}

export interface PlayerRoster {
  player_id: string;
  player_name: string;
  position?: string;
  games_played: number;
  wins: number;
  win_rate: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  avg_kda: number;
}

export interface MatchHistory {
  id: string;
  result?: boolean;
  opponent?: string;
  match_date?: string;
  tournament_name?: string;
  patch?: string;
  game_length?: number;
}

export interface TeamStanding {
  team_id: string;
  team_name: string;
  games_played: number;
  wins: number;
  losses: number;
  win_rate: number;
}

export interface TournamentMatch {
  id: string;
  match_date?: string;
  patch?: string;
  game_length?: number;
  teams?: Array<{
    team_name: string;
    result: boolean;
  }>;
}

export interface TopPlayer {
  player_id: string;
  player_name: string;
  team_name: string;
  games_played: number;
  avg_kda: number;
}
