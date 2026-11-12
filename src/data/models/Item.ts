import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';
import { ItemType as ContractItemType } from '../../interfaces/catalogSync';

/**
 * Предмет каталога CS2 (импорт из ByMykel all.json через plant-admin): скины, наклейки, кейсы и т.д.
 * Таблицу `Item` создаёт sequelize.sync() по этой модели; последующие изменения — миграциями.
 * market_hash_name хранится как есть: без trim и нормализации, сравнение бинарное (utf8mb4_bin).
 */

// ── TYPES ─────────────────────────────────────────────────────────────────────

export const EXTERIORS = ['FN', 'MW', 'FT', 'WW', 'BS'] as const;
export type Exterior = (typeof EXTERIORS)[number];

// Префикс id в ByMykel all.json; список совпадает с ItemType контракта (satisfies это проверяет)
export const ITEM_TYPES = [
    'skin',
    'sticker',
    'sticker_slab',
    'keychain',
    'crate',
    'key',
    'collectible',
    'agent',
    'patch',
    'graffiti',
    'music_kit',
] as const satisfies readonly ContractItemType[];
export type ItemType = (typeof ITEM_TYPES)[number];

export interface Item extends Model {
    readonly id: string;
    readonly type: ItemType;
    readonly marketHashName: string;

    // Только у type = 'skin', у остальных NULL
    // skin_id из ByMykel — группирует износы одного скина
    readonly skinKey: string | null;
    readonly weapon: string | null;
    // def_index оружия
    readonly weaponId: number | null;
    // NULL у свёрнутых Doppler / Gamma Doppler
    readonly paintIndex: number | null;
    readonly exterior: Exterior | null;

    // skin: «Knives», «Rifles»…; остальные: подтип из ByMykel («Case», «Autograph», «Pin») или NULL
    readonly category: string | null;
    readonly stattrak: boolean;
    readonly souvenir: boolean;
    // NULL у ключей
    readonly rarity: string | null;
    readonly rarityColor: string | null;
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

            type: { type: DataTypes.STRING(16), allowNull: false },
            // BINARY -> utf8mb4_bin: регистр, ™ и ★ различаются; уникальность — в indexes
            marketHashName: { type: DataTypes.STRING(255).BINARY, allowNull: false },
            skinKey: { type: DataTypes.STRING(64), allowNull: true },
            weapon: { type: DataTypes.STRING(64), allowNull: true },
            weaponId: { type: DataTypes.INTEGER, allowNull: true },
            paintIndex: { type: DataTypes.INTEGER, allowNull: true },
            exterior: { type: DataTypes.STRING(2), allowNull: true },
            category: { type: DataTypes.STRING(64), allowNull: true },
            stattrak: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            souvenir: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            rarity: { type: DataTypes.STRING(64), allowNull: true },
            rarityColor: { type: DataTypes.STRING(7), allowNull: true },
            image: { type: DataTypes.TEXT, allowNull: false },

            price: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
            isAvailable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
            priceUpdatedAt: { type: DataTypes.DATE, allowNull: true },

            catalogSeenAt: { type: DataTypes.DATE, allowNull: false },
        },
        {
            tableName: 'Item',
            underscored: true, // marketHashName <-> market_hash_name, createdAt <-> created_at
            timestamps: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            indexes: [
                { name: 'uq_item_market_hash_name', unique: true, fields: ['market_hash_name'] },
                // Витрина: доступные предметы по цене (следующие этапы)
                { name: 'idx_item_available_price', fields: ['is_available', 'price'] },
                { name: 'idx_item_skin_key', fields: ['skin_key'] },
                // idx_item_type_category (type, category) создаёт миграция 2026-11-13-item-all-types.sql:
                // sync() добавляет недостающие индексы и в СУЩЕСТВУЮЩУЮ таблицу, а колонки type там
                // ещё нет (её добавит миграция после sync) — индекс здесь уронил бы старт
            ],
        },
    ) as ItemStatic;
