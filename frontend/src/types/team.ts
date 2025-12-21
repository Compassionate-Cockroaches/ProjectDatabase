export interface Team {
  id: string;
  team_name: string;
  external_id?: string;
}

export interface TeamCreate {
  team_name: string;
  external_id?: string;
}

export interface TeamUpdate {
  team_name?: string;
  external_id?: string;
}
