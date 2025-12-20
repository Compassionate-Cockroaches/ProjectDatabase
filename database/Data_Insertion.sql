use lol_esports_DB; 

INSERT IGNORE INTO teams (external_id, team_name)
SELECT DISTINCT teamid, teamname
FROM raw_match_data
WHERE participantid NOT IN (100, 200)
AND teamid IS NOT NULL;

INSERT IGNORE INTO tournaments (league, year, split, playoffs)
SELECT DISTINCT league, year, split, playoffs
FROM raw_match_data
WHERE participantid NOT IN (100, 200);

INSERT IGNORE INTO team_tournaments (team_id, tournament_id)
SELECT DISTINCT t.id, tour.id
FROM raw_match_data rmd
JOIN teams t ON t.external_id = rmd.teamid
JOIN tournaments tour ON 
    tour.league = rmd.league 
    AND tour.year = rmd.year 
    AND (tour.split = rmd.split OR (tour.split IS NULL AND rmd.split IS NULL))
    AND tour.playoffs = rmd.playoffs
where rmd.participantid NOT IN (100, 200);

INSERT IGNORE INTO matches (external_id, tournament_id, game_number, game_length, patch, match_date, data_completeness, url)
SELECT
    rmd.gameid,
    tour.id,
    MAX(rmd.game),
    MAX(rmd.gamelength),
    MAX(rmd.patch),
    MAX(STR_TO_DATE(rmd.date, '%Y-%m-%d %H:%i:%s')),  
    MAX(rmd.datacompleteness),
    MAX(rmd.url)
FROM raw_match_data rmd
JOIN tournaments tour ON
    tour.league = rmd.league
    AND tour.year = rmd.year
    AND (tour.split = rmd.split OR (tour.split IS NULL AND rmd.split IS NULL))
    AND tour.playoffs = rmd.playoffs
WHERE rmd.participantid NOT IN (100, 200)
GROUP BY rmd.gameid, tour.id;

INSERT IGNORE INTO players (external_id, player_name, position)
SELECT DISTINCT playerid, playername, position
FROM raw_match_data
WHERE participantid NOT IN (100, 200)
AND playerid IS NOT NULL;

INSERT IGNORE INTO match_player_stats
(match_id, player_id, team_id, side, champion, result,
 kills, deaths, assists, doublekills, triplekills, quadrakills, pentakills,
 firstblood, firstbloodkill, firstbloodassist,
 totalgold, earnedgold, earned_gpm, goldspent,
 damagetochampions, dpm, damageshare,
 wardsplaced, wardskilled, controlwardsbought, visionscore,
 total_cs, minionkills, monsterkills, cspm)
SELECT 
    m.id,
    p.id,
    t.id,
    rmd.side,
    rmd.champion,
    rmd.result,
    rmd.kills,
    rmd.deaths,
    rmd.assists,
    COALESCE(rmd.doublekills, 0),
    COALESCE(rmd.triplekills, 0),
    COALESCE(rmd.quadrakills, 0),
    COALESCE(rmd.pentakills, 0),
    COALESCE(rmd.firstblood, 0),
    COALESCE(rmd.firstbloodkill, 0),
    COALESCE(rmd.firstbloodassist, 0),
    rmd.totalgold,
    rmd.earnedgold,
    rmd.earned_gpm,
    rmd.goldspent,
    rmd.damagetochampions,
    rmd.dpm,
    rmd.damageshare,
    rmd.wardsplaced,
    rmd.wardskilled,
    rmd.controlwardsbought,
    rmd.visionscore,
    rmd.total_cs,
    rmd.minionkills,
    rmd.monsterkills,
    rmd.cspm
FROM raw_match_data rmd
JOIN Matches m ON m.external_id = rmd.gameid
JOIN Player p ON p.external_id = rmd.playerid
JOIN Team t ON t.external_id = rmd.teamid
WHERE rmd.participantid NOT IN (100, 200);
