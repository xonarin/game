import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';

/**
 * Агрегат цены: одна строка на (предмет × магазин) — минимальная цена и количество лотов.
 * Заполняется полным снимком магазина за прогон (не диффом): нет в снимке — строка удаляется.
 * Таблицу `market_price` создаёт sequelize.sync() (после Item и market — из-за внешних ключей).
 */

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface MarketPrice extends Model {
    readonly itemId: string;
    readonly marketId: string;
    // DECIMAL приходят строками
    readonly minPrice: string; // в валюте магазина
    readonly priceUsd: string;
    readonly qty: number;
    // Меняется только при реальном изменении min_price или qty
    readonly priceChangedAt: Date;
}

export type MarketPriceStatic = ModelStatic<MarketPrice>;

// ── MODEL ─────────────────────────────────────────────────────────────────────

export const initMarketPrice = (sequelize: Sequelize): MarketPriceStatic =>
    sequelize.define(
        'MarketPrice',
        {
            // Удаление предмета или магазина удаляет и его цены
            itemId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                references: { model: 'Item', key: 'id' },
                onDelete: 'CASCADE',
            },
            marketId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                references: { model: 'market', key: 'id' },
                onDelete: 'CASCADE',
            },
            minPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
            priceUsd: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
            qty: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
            priceChangedAt: { type: DataTypes.DATE, allowNull: false },
        },
        {
            tableName: 'market_price',
            underscored: true,
            timestamps: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            indexes: [
                // Удаление «нет в снимке» и пересчёт — по магазину
                { name: 'idx_market_price_market', fields: ['market_id'] },
            ],
        },
    ) as MarketPriceStatic;
