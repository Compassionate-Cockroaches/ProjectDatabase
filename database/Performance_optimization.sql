use lol_esports_DB;

CREATE INDEX idx_mps_team_result
ON match_player_stats (team_id, result);

CREATE INDEX idx_player_stats_composite
ON match_player_stats(player_id, match_id, result);

CREATE INDEX idx_tournament_lookup
ON tournaments(league, year, split, playoffs);

CREATE INDEX idx_champion
ON match_player_stats (champion);

