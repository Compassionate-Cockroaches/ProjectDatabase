use lol_esports_DB;

DROP VIEW IF EXISTS player_match_summary;

CREATE VIEW player_match_summary AS
SELECT
    p.player_name,
    t.team_name,
    m.external_id AS match_id,
    mps.kills,
    mps.deaths,
    mps.assists,
    mps.earnedgold,
    mps.cspm
FROM match_player_stats mps
JOIN players p ON mps.player_id = p.id
JOIN teams t ON mps.team_id = t.id
JOIN matches m ON mps.match_id = m.id;