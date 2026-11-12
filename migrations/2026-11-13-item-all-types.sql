-- Каталог из ByMykel all.json: в Item не только скины, но и наклейки, кейсы, агенты и т.д.
-- - новая колонка type (префикс id ByMykel); существующие строки — скины
-- - оружейные поля и rarity становятся NULL-абельными (у не-скинов их нет)
-- - индекс по category заменён на (type, category)
-- - настройка catalog::sourceUrl: старая ссылка по умолчанию -> all.json
-- Идемпотентна: на новой базе sync() уже создал таблицу по актуальной модели.

-- ── type ─────────────────────────────────────────────────────────────────────
SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = 'Item' AND column_name = 'type'),
    'SELECT 1',
    'ALTER TABLE `Item` ADD COLUMN `type` VARCHAR(16) NOT NULL DEFAULT ''skin'' AFTER `id`'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Default нужен был только для заполнения существующих строк; в модели его нет
ALTER TABLE `Item` ALTER COLUMN `type` DROP DEFAULT;

-- ── NULL-абельные поля (MODIFY идемпотентен) ─────────────────────────────────
ALTER TABLE `Item`
    MODIFY `skin_key` VARCHAR(64) NULL,
    MODIFY `weapon` VARCHAR(64) NULL,
    MODIFY `weapon_id` INT NULL,
    MODIFY `category` VARCHAR(64) NULL,
    MODIFY `rarity` VARCHAR(64) NULL,
    MODIFY `rarity_color` VARCHAR(7) NULL;

-- ── индексы ──────────────────────────────────────────────────────────────────
SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.statistics
            WHERE table_schema = DATABASE() AND table_name = 'Item' AND index_name = 'idx_item_category'),
    'ALTER TABLE `Item` DROP INDEX `idx_item_category`',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    EXISTS (SELECT 1 FROM information_schema.statistics
            WHERE table_schema = DATABASE() AND table_name = 'Item' AND index_name = 'idx_item_type_category'),
    'SELECT 1',
    'ALTER TABLE `Item` ADD INDEX `idx_item_type_category` (`type`, `category`)'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ── источник каталога ────────────────────────────────────────────────────────
-- Описание в админке берётся из строки БД
UPDATE `Setting`
SET `description` = 'Источник импорта каталога предметов (формат ByMykel all.json). Только https и хосты из CATALOG_SOURCE_HOSTS'
WHERE `name` = 'catalog::sourceUrl';

-- Меняем только старое значение по умолчанию; ссылку, заданную админом вручную, не трогаем
UPDATE `Setting`
SET `value` = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/all.json'
WHERE `name` = 'catalog::sourceUrl'
  AND `value` = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json';
