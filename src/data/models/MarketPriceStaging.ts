import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';

/**
 * Временные строки снимка цен одного прогона: bulk-вставка пачками, затем одна транзакция
 * переносит их в market_price / unmatched_name и строки прогона удаляются.
 * Внешних ключей нет намеренно: таблица — буфер, строки живут секунды.
 * Таблицу `market_price_staging` создаёт sequelize.sync().
 */

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface MarketPriceStaging extends Model {
    // sync_run.run_id
    readonly runId: string;
    readonly marketId: string;
    // Как пришло от адаптера; сравнение с Item — бинарное (utf8mb4_bin)
    readonly marketHashName: string;
    readonly minPrice: string;
    readonly priceUsd: string;
    readonly qty: number;
}

export type MarketPriceStagingStatic = ModelStatic<MarketPriceStaging>;

// ── MODEL ─────────────────────────────────────────────────────────────────────

export const initMarketPriceStaging = (sequelize: Sequelize): MarketPriceStagingStatic =>
    sequelize.define(
        'MarketPriceStaging',
        {
            // PK (run_id, market_hash_name): индекс по run_id + защита от повтора имени в снимке
            runId: { type: DataTypes.STRING(64), allowNull: false, primaryKey: true },
            marketHashName: { type: DataTypes.STRING(255).BINARY, allowNull: false, primaryKey: true },
            marketId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
            minPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
            priceUsd: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
            qty: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        },
        {
            tableName: 'market_price_staging',
            underscored: true,
            timestamps: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
        },
    ) as MarketPriceStagingStatic;
