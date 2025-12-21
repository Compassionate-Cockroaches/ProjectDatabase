export interface Team {
  id: string;
  team_name: string;
  external_id?: string;
  tournament_names?: string[]; // Tournaments the team has played in
}

export interface TeamCreate {
  team_name: string;
  external_id?: string;
}

export interface TeamUpdate {
  team_name?: string;
  external_id?: string;
}
