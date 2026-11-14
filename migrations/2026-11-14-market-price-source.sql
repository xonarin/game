-- market.is_price_source_enabled: разрешено ли использовать цены маркета в расчётах (Item.price).
-- Независимо от enabled (синхронизация): цены используются только при enabled = 1 И is_price_source_enabled = 1.
-- Существующие маркеты получают TRUE (DEFAULT при добавлении колонки), данные не меняются.
-- Идемпотентна: на новой базе sync() уже создал колонку по модели Market.

SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'market' AND column_name = 'is_price_source_enabled'),
    'SELECT 1',
    'ALTER TABLE `market` ADD COLUMN `is_price_source_enabled` TINYINT(1) NOT NULL DEFAULT 1 AFTER `enabled`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
