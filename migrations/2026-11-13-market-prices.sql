-- Цены магазинов: sync_run учитывает и прогоны цен.
-- Новые таблицы (market, market_price, market_price_staging, unmatched_name) создаёт sync() по моделям;
-- магазин lisskins и расписание prices_lisskins — код при старте (MARKET_DEFAULTS).
-- Здесь — только изменения существующей sync_run. Идемпотентна: на новой базе sync() уже создал
-- sync_run по актуальной модели (колонки и внешний ключ есть).

-- ── sync_run.market_id ───────────────────────────────────────────────────────
SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'sync_run' AND column_name = 'market_id'),
    'SELECT 1',
    'ALTER TABLE `sync_run` ADD COLUMN `market_id` INT UNSIGNED NULL AFTER `kind`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Внешний ключ ищется по колонке, а не по имени: sync() на новой базе называет его по-своему
SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.key_column_usage
            WHERE table_schema = DATABASE() AND table_name = 'sync_run'
              AND column_name = 'market_id' AND referenced_table_name = 'market'),
    'SELECT 1',
    'ALTER TABLE `sync_run` ADD CONSTRAINT `fk_sync_run_market` FOREIGN KEY (`market_id`) REFERENCES `market` (`id`) ON DELETE SET NULL'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ── счётчики прогона цен ─────────────────────────────────────────────────────
SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'sync_run' AND column_name = 'rows_matched'),
    'SELECT 1',
    'ALTER TABLE `sync_run` ADD COLUMN `rows_matched` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `duplicates_collapsed`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'sync_run' AND column_name = 'rows_unmatched'),
    'SELECT 1',
    'ALTER TABLE `sync_run` ADD COLUMN `rows_unmatched` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `rows_matched`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'sync_run' AND column_name = 'rows_removed'),
    'SELECT 1',
    'ALTER TABLE `sync_run` ADD COLUMN `rows_removed` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `rows_unmatched`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'sync_run' AND column_name = 'rows_changed'),
    'SELECT 1',
    'ALTER TABLE `sync_run` ADD COLUMN `rows_changed` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `rows_removed`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
