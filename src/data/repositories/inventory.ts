import { Op, Transaction } from 'sequelize';

import BaseRepository from './base';
import { InventoryItem, InventoryLockReason } from '../models/InventoryItem';
import { Item } from '../models/Item';
import { UserError } from '../../utils/errors';

/**
 * Инвентарь игрока — единственное место, где скины выдаются, берутся в игру, резервируются и списываются.
 * Режимы игр и вывод работают со скинами только через эти методы, тогда один скин не попадёт в два места:
 *
 *  - takeForGame  — мгновенная игра в одной транзакции (апгрейд): строка FOR UPDATE, только свободная, удаляется;
 *  - reserve      — долгий процесс (вывод, многоходовая игра): атомарный UPDATE … WHERE lockedBy IS NULL;
 *  - consumeReserved / release — завершение процесса: скин списан (строка удалена) или резерв снят.
 */
class InventoryRepository extends BaseRepository {
    /** Скины игрока: свободные и занятые (занятые — с lockedBy, например «на выводе»). */
    async list(userId: string): Promise<InventoryItem[]> {
        return this.db.InventoryItem.findAll({
            where: { userId },
            include: [this.db.InventoryItem.Item],
            order: [['id', 'DESC']],
        });
    }

    /** Выдать скин игроку (покупка, выигрыш). */
    async add(userId: string, item: Item, transaction: Transaction): Promise<InventoryItem> {
        const created = await this.db.InventoryItem.create(
            { userId, itemId: item.id, priceAtAcquisition: item.price },
            { transaction },
        );
        created.item = item;
        return created;
    }

    /** Выдать игроку несколько скинов: по строке на каждую единицу. */
    async addMany(
        userId: string,
        entries: { item: Item; quantity: number }[],
        transaction: Transaction,
    ): Promise<InventoryItem[]> {
        const rows = entries.flatMap(({ item, quantity }) =>
            Array.from({ length: quantity }, () => ({ userId, itemId: item.id, priceAtAcquisition: item.price })),
        );
        await this.db.InventoryItem.bulkCreate(rows, { transaction });

        // bulkCreate в MySQL не возвращает id — перечитываем только что созданные строки
        const created = await this.db.InventoryItem.findAll({
            where: { userId },
            include: [this.db.InventoryItem.Item],
            order: [['id', 'DESC']],
            limit: rows.length,
            transaction,
        });
        return created.reverse();
    }

    /**
     * Взять свободный скин в мгновенную игру: строка блокируется до конца транзакции и удаляется.
     * Чужой, занятый резервом или уже взятый параллельным запросом скин — UPGRADE_BET_ITEM_NOT_FOUND.
     * Возвращает снимок строки (с предметом) — для расчёта ставки и истории игры.
     */
    async takeForGame(userId: string, inventoryItemId: string, transaction: Transaction): Promise<InventoryItem> {
        const row = await this.db.InventoryItem.findOne({
            where: { id: inventoryItemId, userId, lockedBy: null },
            include: [this.db.InventoryItem.Item],
            transaction,
            lock: transaction.LOCK.UPDATE,
        });
        if (!row) {
            throw new UserError('UPGRADE_BET_ITEM_NOT_FOUND');
        }

        await row.destroy({ transaction });
        return row;
    }

    /**
     * Зарезервировать скины под долгий процесс. Все или ни одного: если хотя бы один чужой или уже занят —
     * INVENTORY_ITEM_BUSY, транзакция откатывается вызывающим.
     */
    async reserve(
        userId: string,
        inventoryItemIds: string[],
        reason: InventoryLockReason,
        lockRef: string,
        transaction: Transaction,
    ): Promise<void> {
        const [affected] = await this.db.InventoryItem.update(
            { lockedBy: reason, lockRef, lockedAt: new Date() },
            { where: { id: { [Op.in]: inventoryItemIds }, userId, lockedBy: null }, transaction },
        );
        if (affected !== inventoryItemIds.length) {
            throw new UserError('INVENTORY_ITEM_BUSY');
        }
    }

    /** Процесс завершён успешно: зарезервированные им скины уходят из инвентаря. */
    async consumeReserved(reason: InventoryLockReason, lockRef: string, transaction: Transaction): Promise<number> {
        return this.db.InventoryItem.destroy({ where: { lockedBy: reason, lockRef }, transaction });
    }

    /** Процесс отменён: скины снова свободны. */
    async release(reason: InventoryLockReason, lockRef: string, transaction?: Transaction): Promise<number> {
        const [affected] = await this.db.InventoryItem.update(
            { lockedBy: null, lockRef: null, lockedAt: null },
            { where: { lockedBy: reason, lockRef }, transaction },
        );
        return affected;
    }
}

export default InventoryRepository;
