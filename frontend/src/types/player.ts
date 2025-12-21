export interface Player {
  id: string;
  player_name: string;
  position?: string;
  external_id?: string;
  team_names?: string[]; // Teams the player has played for
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
