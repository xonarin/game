-- Linked Telegram account for the bonus (any login method can connect a Telegram id).
-- sequelize.sync() does not add columns to existing tables, so apply this by hand before deploy:
--   mysql -u <user> -p <database> < migrations/2026-11-10-user-telegram-id.sql
-- Safe to re-run is NOT guaranteed (ADD COLUMN fails if it exists); run once.

ALTER TABLE `User`
    ADD COLUMN `telegramId` VARCHAR(255) NULL UNIQUE AFTER `socialId`;

-- Backfill: users who signed in with Telegram already have their Telegram id in socialId.
UPDATE `User` SET `telegramId` = `socialId` WHERE `socialType` = 'Telegram' AND `telegramId` IS NULL;
