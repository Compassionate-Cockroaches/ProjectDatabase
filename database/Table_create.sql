use lol_esports_DB; 

DROP TABLE IF EXISTS match_player_stats;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS team_tournaments;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS tournaments;
DROP TABLE IF EXISTS teams;
drop table if exists raw_match_data;

--- Raw data
CREATE TABLE raw_match_data (
    gameid VARCHAR(50) not null,
    datacompleteness VARCHAR(20),
    url TEXT,
    league VARCHAR(50),
    year INT,
    split VARCHAR(20),
    playoffs TINYINT,
    date VARCHAR(50),
    game INT,
    patch VARCHAR(20),
    participantid INT not null,
    side VARCHAR(10),
    position VARCHAR(20),
    playername VARCHAR(100),
    playerid VARCHAR(64),
    teamname VARCHAR(100),
    teamid VARCHAR(64),
    champion VARCHAR(50),
    ban1 VARCHAR(50),
    ban2 VARCHAR(50),
    ban3 VARCHAR(50),
    ban4 VARCHAR(50),
    ban5 VARCHAR(50),
    pick1 VARCHAR(50),
    pick2 VARCHAR(50),
    pick3 VARCHAR(50),
    pick4 VARCHAR(50),
    pick5 VARCHAR(50),
    gamelength INT,
    result TINYINT,
    kills INT,
    deaths INT,
    assists INT,
    teamkills INT,
    teamdeaths INT,
    doublekills INT,
    triplekills INT,
    quadrakills INT,
    pentakills INT,
    firstblood TINYINT,
    firstbloodkill TINYINT,
    firstbloodassist TINYINT,
    firstbloodvictim VARCHAR(100),
    `team kpm` DECIMAL(10,4),
    ckpm DECIMAL(10,4),
    firstdragon TINYINT,
    dragons INT,
    `opp dragons` INT,
    elementaldrakes INT,
    opp_elementaldrakes INT,
    infernals INT,
    mountains INT,
    clouds INT,
    oceans INT,
    chemtechs INT,
    hextechs INT,
    `dragons (type unknown)` INT,
    elders INT,
    opp_elders INT,
    firstherald TINYINT,
    heralds INT,
    opp_heralds INT,
    void_grubs INT,
    opp_void_grubs INT,
    firstbaron TINYINT,
    barons INT,
    opp_barons INT,
    atakhans INT,
    opp_atakhans INT,
    firsttower TINYINT,
    towers INT,
    opp_towers INT,
    firstmidtower TINYINT,
    firsttothreetowers TINYINT,
    turretplates INT,
    opp_turretplates INT,
    inhibitors INT,
    opp_inhibitors INT,
    damagetochampions INT,
    dpm DECIMAL(10,2),
    damageshare DECIMAL(10,6),
    damagetakenperminute DECIMAL(10,4),
    damagemitigatedperminute DECIMAL(10,4),
    damagetotowers INT,
    wardsplaced INT,
    wpm DECIMAL(10,4),
    wardskilled INT,
    wcpm DECIMAL(10,4),
    controlwardsbought INT,
    visionscore INT,
    vspm DECIMAL(10,4),
    totalgold INT,
    earnedgold INT,
    `earned gpm` DECIMAL(10,4),
    earnedgoldshare DECIMAL(10,6),
    goldspent INT,
    gspd INT,
    gpr DECIMAL(10,4),
    `total cs` INT,
    minionkills INT,
    monsterkills INT,
    monsterkillsownjungle INT,
    monsterkillsenemyjungle INT,
    cspm DECIMAL(10,4),
    
    PRIMARY KEY (gameid, participantid)
);

--- Create tables
CREATE TABLE teams (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    external_id VARCHAR(64) UNIQUE,
    team_name VARCHAR(100) NOT NULL
);

CREATE TABLE tournaments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    league VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    split VARCHAR(20),
    playoffs BOOLEAN,
    UNIQUE KEY unique_tournament (league, year, split, playoffs)
);

CREATE TABLE matches (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    external_id VARCHAR(64) NOT NULL UNIQUE,
    tournament_id CHAR(36),
    game_number INT,
    game_length INT,
    patch VARCHAR(20),
    match_date DATE,
    data_completeness VARCHAR(20),
    url TEXT,
    FOREIGN KEY (tournament_id)
        REFERENCES tournaments(id)
        ON DELETE CASCADE
);

CREATE TABLE players (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    external_id VARCHAR(64) NOT NULL UNIQUE,
    player_name VARCHAR(100) NOT NULL,
    position VARCHAR(20)
);

CREATE TABLE team_tournaments (
    team_id CHAR(36),
    tournament_id CHAR(36),
    PRIMARY KEY (team_id, tournament_id),
    FOREIGN KEY (team_id)
        REFERENCES teams(id)
        ON DELETE CASCADE,
    FOREIGN KEY (tournament_id)
        REFERENCES tournaments(id)
        ON DELETE CASCADE
);

CREATE TABLE match_player_stats (
    match_id CHAR(36),
    player_id CHAR(36),
    team_id CHAR(36),
    side VARCHAR(10),
    champion VARCHAR(50),
    result TINYINT,
    
    -- Combat stats
    kills INT,
    deaths INT,
    assists INT,
    doublekills INT DEFAULT 0,
    triplekills INT DEFAULT 0,
    quadrakills INT DEFAULT 0,
    pentakills INT DEFAULT 0,
    
    -- Objectives (player contribution)
    firstblood TINYINT DEFAULT 0,
    firstbloodkill TINYINT DEFAULT 0,
    firstbloodassist TINYINT DEFAULT 0,
    
    -- Economy
    totalgold INT,
    earnedgold INT,
    earned_gpm DECIMAL(10,2),
    goldspent INT,
    
    -- Damage
    damagetochampions INT,
    dpm DECIMAL(10,2),
    damageshare DECIMAL(5,4),
    
    -- Vision
    wardsplaced INT,
    wardskilled INT,
    controlwardsbought INT,
    visionscore INT,
    
    -- Farm
    total_cs INT,
    minionkills INT,
    monsterkills INT,
    cspm DECIMAL(10,4),
    
    PRIMARY KEY (match_id, player_id),
    FOREIGN KEY (match_id)
        REFERENCES matches(id)
        ON DELETE CASCADE,
    FOREIGN KEY (player_id)
        REFERENCES players(id)
        ON DELETE CASCADE,
    FOREIGN KEY (team_id)
        REFERENCES teams(id)
        ON DELETE CASCADE
);
