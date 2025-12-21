export interface Tournament {
  id: string;
  league: string;
  year: number;
  split?: string;
  playoffs?: boolean;
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
