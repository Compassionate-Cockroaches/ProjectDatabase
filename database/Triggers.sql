use lol_esports_DB;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_match_player;

-- Create trigger 
CREATE TRIGGER validate_match_player
BEFORE INSERT ON match_player_stats
FOR EACH ROW
BEGIN
    -- player_id phải tồn tại (player-level data)
    IF NEW.player_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid record: non-player data is not allowed in match_player_stats';
    END IF;

    -- side chỉ được là BLUE hoặc RED
    IF NEW.side NOT IN ('BLUE', 'RED') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid side value (must be BLUE or RED)';
    END IF;
END;

