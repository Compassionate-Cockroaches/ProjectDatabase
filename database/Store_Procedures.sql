use lol_esports_DB;

-- Drop existing procedure if it exists
DROP PROCEDURE IF EXISTS get_champion_stats;

-- Create procedure (no DELIMITER needed)
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