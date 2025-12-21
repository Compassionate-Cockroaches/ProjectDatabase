export interface Player {
  id: string;
  player_name: string;
  position?: string;
  external_id?: string;
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
