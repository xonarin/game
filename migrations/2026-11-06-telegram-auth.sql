-- Adds Telegram as a sign-in provider (SocialType.Telegram in src/data/models/User.ts).
-- sequelize.sync() creates missing tables but does not alter existing columns,
-- so this must be applied by hand to existing databases BEFORE deploying the code:
--   mysql -u <user> -p <database> < migrations/2026-11-06-telegram-auth.sql
-- Safe to re-run.

ALTER TABLE `User`
    MODIFY `socialType` ENUM('Steam', 'VK', 'Telegram') NOT NULL;
