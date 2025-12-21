export interface Match {
  id: string;
  tournament_id: string;
  game_number?: number;
  game_length?: number;
  patch?: string;
  match_date?: string; // Representing backend's date as string
  data_completeness?: string;
  url?: string;
  external_id?: string;
  team_names?: string[]; // List of team names in the match
}

export interface MatchCreate {
  tournament_id: string;
  game_number?: number;
  game_length?: number;
  patch?: string;
  match_date?: string;
  data_completeness?: string;
  url?: string;
  external_id?: string;
}

export interface MatchUpdate {
  tournament_id?: string;
  game_number?: number;
  game_length?: number;
  patch?: string;
  match_date?: string;
  data_completeness?: string;
  url?: string;
  external_id?: string;
}
