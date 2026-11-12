import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';

/**
 * Магазин скинов (LisSkins, позже другие), откуда приходят цены.
 * Скачивание и разбор выгрузки — адаптер магазина в plant-admin; API-ключи — только в env plant-admin.
 * Таблицу `market` создаёт sequelize.sync(); строки по умолчанию — MARKET_DEFAULTS при старте.
 */

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface Market extends Model {
    readonly id: string;
    // 'lisskins', позже 'csgo_market' и т.д.; часть ключа расписания prices_<code>
    readonly code: string;
    readonly name: string;
    readonly enabled: boolean;
    // ISO 4217 — валюта цен магазина (min_price)
    readonly currency: string;
    // Порядок при равной цене: меньше — раньше
    readonly priority: number;
    // Защита от битой выгрузки: строк < ratio × строк последнего успешного прогона -> skipped
    readonly minRowsRatio: string; // DECIMAL приходит строкой
    // Несекретные настройки адаптера
    readonly settings: Record<string, unknown>;
    readonly lastSyncAt: Date | null;
    readonly lastSyncStatus: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export type MarketStatic = ModelStatic<Market>;

// ── DEFAULTS ──────────────────────────────────────────────────────────────────

/**
 * Магазины, которые должны существовать всегда. Создаются при старте, если строки нет;
 * существующие (в т.ч. изменённые в админке) не перезаписываются.
 * Вместе с магазином создаётся расписание prices_<code> (см. MarketsRepository.ensureDefaults).
 */
export const MARKET_DEFAULTS: {
    code: string;
    name: string;
    currency: string;
    priority: number;
    settings: Record<string, unknown>;
}[] = [
    // Выключен до первой проверки адаптера; цены выгрузки — в USD (шаг 0)
    { code: 'lisskins', name: 'LIS-SKINS', currency: 'USD', priority: 10, settings: {} },
];

// ── MODEL ─────────────────────────────────────────────────────────────────────

export const initMarket = (sequelize: Sequelize): MarketStatic =>
    sequelize.define(
        'Market',
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,

                // null у экземпляра, который Sequelize строит для статического Model.update()
                get(this: Market) {
                    const id = this.getDataValue('id') as unknown as number | null;
                    return id === null || id === undefined ? id : id.toString();
                },
            },

            code: { type: DataTypes.STRING(32), allowNull: false },
            name: { type: DataTypes.STRING(64), allowNull: false },
            enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            currency: { type: DataTypes.CHAR(3), allowNull: false },
            priority: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
            minRowsRatio: { type: DataTypes.DECIMAL(4, 2), allowNull: false, defaultValue: '0.70' },
            // У JSON в MySQL нет DEFAULT — значение задаёт код ({} у новых магазинов)
            settings: { type: DataTypes.JSON, allowNull: false },
            lastSyncAt: { type: DataTypes.DATE, allowNull: true },
            lastSyncStatus: { type: DataTypes.STRING(16), allowNull: true },
        },
        {
            tableName: 'market',
            underscored: true,
            timestamps: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            indexes: [{ name: 'uq_market_code', unique: true, fields: ['code'] }],
        },
    ) as MarketStatic;
