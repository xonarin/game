-- OPTIONAL cleanup after removing Classic, Qiwi and Mines "anti-minus" from the code
-- (branch plant, 2026-11-09). The code no longer reads any of this, so the site works
-- without running it. Run it only when the data is no longer needed:
-- it PERMANENTLY deletes game history and Qiwi withdraw records.
--
-- Make a backup first:
--   mysqldump -u <user> -p <database> ClassicGame ClassicGameBet QiwiWithdraw Setting > backup-before-cleanup.sql
-- Then:
--   mysql -u <user> -p <database> < migrations/2026-11-09-remove-modules-cleanup.sql

-- Classic game
DROP TABLE IF EXISTS `ClassicGameBet`;
DROP TABLE IF EXISTS `ClassicGame`;
DELETE FROM `Setting` WHERE `name` LIKE 'classic::%';

-- Qiwi payments
DROP TABLE IF EXISTS `QiwiWithdraw`;

-- Mines "anti-minus"
ALTER TABLE `MinesGame` DROP COLUMN `forcedBombStep`;
DELETE FROM `Setting` WHERE `name` IN ('mines::antiMinus', 'mines::antiMinusSteps');
