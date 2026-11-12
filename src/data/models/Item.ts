import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';

/**
 * Предмет каталога CS2 (импорт из ByMykel через plant-admin).
 * Таблица `item` создаётся миграцией migrations/2026-11-12-catalog.sql, НЕ sequelize.sync().
 * market_hash_name хранится как есть: без trim и нормализации, сравнение бинарное.
 */

// ── TYPES ─────────────────────────────────────────────────────────────────────

export const EXTERIORS = ['FN', 'MW', 'FT', 'WW', 'BS'] as const;
export type Exterior = (typeof EXTERIORS)[number];

export interface Item extends Model {
    readonly id: string;
    readonly marketHashName: string;
    // skin_id из ByMykel — группирует износы одного скина
    readonly skinKey: string;
    readonly weapon: string;
    // def_index оружия
    readonly weaponId: number;
    // NULL у свёрнутых Doppler / Gamma Doppler
    readonly paintIndex: number | null;
    readonly category: string;
    readonly exterior: Exterior | null;
    readonly stattrak: boolean;
    readonly souvenir: boolean;
    readonly rarity: string;
    readonly rarityColor: string;
    readonly image: string;

    // Цены — следующие этапы; импорт каталога их не трогает
    readonly price: string | null; // DECIMAL приходит строкой
    readonly isAvailable: boolean;
    readonly priceUpdatedAt: Date | null;

    // Время последнего импорта, в котором предмет был
    readonly catalogSeenAt: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export type ItemStatic = ModelStatic<Item>;

// ── MODEL ─────────────────────────────────────────────────────────────────────

export const initItem = (sequelize: Sequelize): ItemStatic =>
    sequelize.define(
        'Item',
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,

                // null у экземпляра, который Sequelize строит для статического Model.update()
                get(this: Item) {
                    const id = this.getDataValue('id') as unknown as number | null;
                    return id === null || id === undefined ? id : id.toString();
                },
            },

            marketHashName: { type: DataTypes.STRING(255), allowNull: false, unique: true },
            skinKey: { type: DataTypes.STRING(64), allowNull: false },
            weapon: { type: DataTypes.STRING(64), allowNull: false },
            weaponId: { type: DataTypes.INTEGER, allowNull: false },
            paintIndex: { type: DataTypes.INTEGER, allowNull: true },
            category: { type: DataTypes.STRING(64), allowNull: false },
            exterior: { type: DataTypes.STRING(2), allowNull: true },
            stattrak: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            souvenir: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            rarity: { type: DataTypes.STRING(64), allowNull: false },
            rarityColor: { type: DataTypes.STRING(7), allowNull: false },
            image: { type: DataTypes.TEXT, allowNull: false },

            price: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
            isAvailable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            priceUpdatedAt: { type: DataTypes.DATE, allowNull: true },

            catalogSeenAt: { type: DataTypes.DATE, allowNull: false },
        },
        {
            tableName: 'item',
            underscored: true, // marketHashName <-> market_hash_name, createdAt <-> created_at
            timestamps: true,
        },
    ) as ItemStatic;
