use lol_esports_DB;

-- Drop existing procedure if it exists
DROP PROCEDURE IF EXISTS get_champion_stats;
DROP PROCEDURE IF EXISTS get_player_performance;

-- Create procedure
CREATE PROCEDURE get_champion_stats(IN min_games INT)
BEGIN
    SELECT 
        champion,
        COUNT(*) AS games_played,
        SUM(result) AS wins,
        COUNT(*) - SUM(result) AS losses,
        ROUND(SUM(result) * 100.0 / COUNT(*), 2) AS win_rate,
        ROUND(AVG(kills), 2) AS avg_kills,
        ROUND(AVG(deaths), 2) AS avg_deaths,
        ROUND(AVG(assists), 2) AS avg_assists
    FROM match_player_stats
    GROUP BY champion
    HAVING games_played >= min_games
    ORDER BY win_rate DESC, games_played DESC;
END;

CREATE PROCEDURE get_player_performance(IN external_id VARCHAR(64))
BEGIN
    SELECT
        p.player_name,
        COUNT(*) AS games_played,
        ROUND(AVG(mps.goldspent), 2) AS avg_goldspent,
        ROUND(AVG(mps.dpm), 2) AS avg_damage_per_min,
        ROUND(AVG(mps.wardsplaced), 0) AS avg_wards_placed
    FROM match_player_stats mps
    JOIN players p ON p.id = mps.player_id
    WHERE p.external_id = external_id
    GROUP BY p.player_name;
END;


CALL get_player_performance('oe:player:65ed20b21e2993fb00dbd21a2fd991b');
CALL get_champion_stats(2000);