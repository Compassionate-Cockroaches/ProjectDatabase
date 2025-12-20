use lol_esports_DB;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prevent_duplicate_match;

-- Create trigger (no DELIMITER needed in DBeaver)
CREATE TRIGGER prevent_duplicate_match
BEFORE INSERT ON matches
FOR EACH ROW
BEGIN
    DECLARE match_count INT;
    
    SELECT COUNT(*) INTO match_count
    FROM matches
    WHERE external_id = NEW.external_id;
    
    IF match_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Match with this external_id already exists';
    END IF;
END;