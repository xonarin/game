-- Каталог скинов CS2 (импорт из ByMykel через plant-admin), журнал прогонов и расписания.
-- Применяется автоматически при старте (src/data/migrate.ts). Безопасно для повторного запуска.
-- Модели Item / SyncRun / CronJob исключены из sequelize.sync(): таблицы создаёт только этот файл.
-- Все DATETIME — UTC.

-- ── item: каталог предметов ─────────────────────────────────────────────────────
-- market_hash_name — utf8mb4_bin: бинарное сравнение (регистр, акценты, ™ и ★ различаются).
-- price / is_available / price_updated_at заполняются в следующих этапах; импорт их не трогает.
CREATE TABLE IF NOT EXISTS `item` (
    `id`               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `market_hash_name` VARCHAR(255)  CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    `skin_key`         VARCHAR(64)   NOT NULL,
    `weapon`           VARCHAR(64)   NOT NULL,
    `weapon_id`        INT           NOT NULL,
    `paint_index`      INT           NULL,
    `category`         VARCHAR(64)   NOT NULL,
    `exterior`         VARCHAR(2)    NULL,
    `stattrak`         BOOLEAN       NOT NULL DEFAULT FALSE,
    `souvenir`         BOOLEAN       NOT NULL DEFAULT FALSE,
    `rarity`           VARCHAR(64)   NOT NULL,
    `rarity_color`     VARCHAR(7)    NOT NULL,
    `image`            TEXT          NOT NULL,
    `price`            DECIMAL(12,2) NULL,
    `is_available`     BOOLEAN       NOT NULL DEFAULT FALSE,
    `price_updated_at` DATETIME      NULL,
    `catalog_seen_at`  DATETIME      NOT NULL,
    `created_at`       DATETIME      NOT NULL,
    `updated_at`       DATETIME      NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_item_market_hash_name` (`market_hash_name`),
    KEY `idx_item_available_price` (`is_available`, `price`),
    KEY `idx_item_skin_key` (`skin_key`),
    KEY `idx_item_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── sync_run: журнал прогонов импорта ───────────────────────────────────────────
-- run_id генерирует админка. kind: 'catalog' (позже 'prices'); trigger: 'manual' / 'cron';
-- status: 'running' / 'ok' / 'failed'.
CREATE TABLE IF NOT EXISTS `sync_run` (
    `id`                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `run_id`               VARCHAR(64)  NOT NULL,
    `kind`                 VARCHAR(16)  NOT NULL,
    `trigger`              VARCHAR(16)  NOT NULL,
    `status`               VARCHAR(16)  NOT NULL,
    `started_at`           DATETIME     NOT NULL,
    `finished_at`          DATETIME     NULL,
    `batches_expected`     INT UNSIGNED NOT NULL DEFAULT 0,
    `batches_received`     INT UNSIGNED NOT NULL DEFAULT 0,
    `rows_received`        INT UNSIGNED NOT NULL DEFAULT 0,
    `rows_inserted`        INT UNSIGNED NOT NULL DEFAULT 0,
    `rows_updated`         INT UNSIGNED NOT NULL DEFAULT 0,
    `source_total`         INT UNSIGNED NOT NULL DEFAULT 0,
    `duplicates_collapsed` INT UNSIGNED NOT NULL DEFAULT 0,
    `error`                TEXT         NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_sync_run_run_id` (`run_id`),
    KEY `idx_sync_run_kind_started` (`kind`, `started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── sync_run_batch: принятые пачки прогона ──────────────────────────────────────
-- Делает приём пачек идемпотентным: повтор той же (прогон, batchIndex) не увеличивает
-- batches_received и не искажает счётчики inserted / updated.
CREATE TABLE IF NOT EXISTS `sync_run_batch` (
    `sync_run_id`   INT UNSIGNED NOT NULL,
    `batch_index`   INT UNSIGNED NOT NULL,
    `rows_received` INT UNSIGNED NOT NULL,
    `rows_inserted` INT UNSIGNED NOT NULL,
    `rows_updated`  INT UNSIGNED NOT NULL,
    `received_at`   DATETIME     NOT NULL,
    PRIMARY KEY (`sync_run_id`, `batch_index`),
    CONSTRAINT `fk_sync_run_batch_run` FOREIGN KEY (`sync_run_id`) REFERENCES `sync_run` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── cron_job: настройки расписаний ──────────────────────────────────────────────
-- key: 'catalog_import' (позже 'prices_lisskins' и т.д.); 5-полевой cron; timezone — IANA.
CREATE TABLE IF NOT EXISTS `cron_job` (
    `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `key`             VARCHAR(64)  NOT NULL,
    `cron_expression` VARCHAR(128) NOT NULL,
    `timezone`        VARCHAR(64)  NOT NULL,
    `enabled`         BOOLEAN      NOT NULL DEFAULT TRUE,
    `last_run_at`     DATETIME     NULL,
    `last_run_status` VARCHAR(16)  NULL,
    `updated_at`      DATETIME     NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_cron_job_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── seed ────────────────────────────────────────────────────────────────────────
-- Импорт каталога: понедельник 04:00 по Ташкенту. INSERT IGNORE не перезапишет правки из админки.
INSERT IGNORE INTO `cron_job` (`key`, `cron_expression`, `timezone`, `enabled`, `updated_at`)
VALUES ('catalog_import', '0 4 * * 1', 'Asia/Tashkent', TRUE, UTC_TIMESTAMP());
