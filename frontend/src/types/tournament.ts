export interface Tournament {
  id: string;
  league: string;
  year: number;
  split?: string;
  playoffs?: boolean;
  // Stats properties (returned from getById endpoint)
  total_teams?: number;
  total_matches?: number;
}

export interface TournamentCreate {
  league: string;
  year: number;
  split?: string;
  playoffs?: boolean;
}

export interface TournamentUpdate {
  league?: string;
  year?: number;
  split?: string;
  playoffs?: boolean;
}
