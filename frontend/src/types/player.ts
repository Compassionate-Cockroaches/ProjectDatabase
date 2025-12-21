export interface Player {
  id: string;
  player_name: string;
  position?: string;
  external_id?: string;
  team_names?: string[]; // Teams the player has played for
  // Stats properties (returned from getById endpoint)
  total_games?: number;
  total_wins?: number;
  total_kills?: number;
  total_deaths?: number;
  total_assists?: number;
  avg_kda?: number;
  win_rate?: number;
}

export interface PlayerCreate {
  player_name: string;
  position?: string;
  external_id?: string;
}

export interface PlayerUpdate {
  player_name?: string;
  position?: string;
  external_id?: string;
}
