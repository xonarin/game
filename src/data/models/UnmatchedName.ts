import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';

/**
 * Имена из снимков магазина, которых нет в каталоге (точное бинарное сравнение, без угадывания).
 * Админ просматривает их и может скрыть (ignored). Таблицу `unmatched_name` создаёт sequelize.sync().
 */

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface UnmatchedName extends Model {
    readonly marketId: string;
    readonly marketHashName: string;
    // Цена из последнего снимка, USD (как price_usd), DECIMAL строкой
    readonly lastPrice: string;
    readonly firstSeen: Date;
    readonly lastSeen: Date;
    readonly ignored: boolean;
}

export type UnmatchedNameStatic = ModelStatic<UnmatchedName>;

// ── MODEL ─────────────────────────────────────────────────────────────────────

export const initUnmatchedName = (sequelize: Sequelize): UnmatchedNameStatic =>
    sequelize.define(
        'UnmatchedName',
        {
            // Удаление магазина удаляет и его несовпавшие имена
            marketId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                references: { model: 'market', key: 'id' },
                onDelete: 'CASCADE',
            },
            // BINARY -> utf8mb4_bin, как Item.market_hash_name
            marketHashName: { type: DataTypes.STRING(255).BINARY, allowNull: false, primaryKey: true },
            lastPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
            firstSeen: { type: DataTypes.DATE, allowNull: false },
            lastSeen: { type: DataTypes.DATE, allowNull: false },
            ignored: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        },
        {
            tableName: 'unmatched_name',
            underscored: true,
            timestamps: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
        },
    ) as UnmatchedNameStatic;
