import { Sequelize, Model, Association } from 'sequelize';
import { forEach } from 'lodash';

import { initSetting, SettingStatic } from './Setting';
import { initUser, UserStatic } from './User';
import { initChat, ChatStatic } from './Chat';
import { initChatUser, ChatUserStatic } from './ChatUser';
import { initMessage, MessageStatic } from './Message';
import { initReferralIncome, ReferralIncomeStatic } from './ReferralIncome';
import { initMinesGame, MinesGameStatic } from './MinesGame';
import { initClassicGame, ClassicGameStatic } from './ClassicGame';
import { initClassicGameBet, ClassicGameBetStatic } from './ClassicGameBet';
import { initTournament, TournamentStatic } from './Tournament';
import { initPaymentMethod, PaymentMethodStatic } from './PaymentMethod';
import { initWithdrawMethod, WithdrawMethodStatic } from './WithdrawMethod';
import { initUserPayment, UserPaymentStatic } from './UserPayment';
import { initUserWithdraw, UserWithdrawStatic } from './UserWithdraw';
import { initBonus, BonusStatic } from './Bonus';
import { initPromoCode, PromoCodeStatic } from './PromoCode';
import { initPromoCodeUse, PromoCodeUseStatic } from './PromoCodeUse';
import { initAuthClient, AuthClientStatic } from './AuthClient';
import { initAdminAction, AdminActionStatic } from './AdminAction';
import { initItem, ItemStatic } from './Item';
import { initSyncRun, SyncRunStatic } from './SyncRun';
import { initSyncRunBatch, SyncRunBatchStatic } from './SyncRunBatch';
import { initCronJob, CronJobStatic } from './CronJob';

export type ModelStatic<M extends Model> = typeof Model & (new () => M);

export type AssociableModelStatic<M extends Model, A extends { [key: string]: Association } = {}> = ModelStatic<M> &
    A & {
        associate: (database: Database) => void;
    };

function isAssociable(model: Sequelize | ModelStatic<Model>): model is AssociableModelStatic<Model> {
    return 'associate' in model;
}

// ── MIGRATION-MANAGED MODELS ──────────────────────────────────────────────────

/**
 * Таблицы этих моделей создаются только SQL-миграциями (src/data/migrate.ts).
 * sequelize.sync() вызывает model.sync() для каждой модели — здесь он заменён на no-op,
 * чтобы sync() не создал таблицу сам (с неправильной collation и без индексов).
 */
const migrationManaged = <M extends ModelStatic<Model>>(model: M): M =>
    Object.assign(model, { sync: async () => model });

export interface Database {
    sequelize: Sequelize;

    // Models
    Setting: SettingStatic;
    User: UserStatic;
    ReferralIncome: ReferralIncomeStatic;
    Chat: ChatStatic;
    ChatUser: ChatUserStatic;
    Message: MessageStatic;
    MinesGame: MinesGameStatic;
    ClassicGame: ClassicGameStatic;
    ClassicGameBet: ClassicGameBetStatic;
    Tournament: TournamentStatic;
    PaymentMethod: PaymentMethodStatic;
    WithdrawMethod: WithdrawMethodStatic;
    UserPayment: UserPaymentStatic;
    UserWithdraw: UserWithdrawStatic;
    Bonus: BonusStatic;
    PromoCode: PromoCodeStatic;
    PromoCodeUse: PromoCodeUseStatic;
    AuthClient: AuthClientStatic;
    AdminAction: AdminActionStatic;

    // Каталог (таблицы из migrations/, вне sync())
    Item: ItemStatic;
    SyncRun: SyncRunStatic;
    SyncRunBatch: SyncRunBatchStatic;
    CronJob: CronJobStatic;
}

export const initDatabase = (sequelize: Sequelize): Database => {
    const database: Database = {
        sequelize,
        Setting: initSetting(sequelize),
        User: initUser(sequelize),
        ReferralIncome: initReferralIncome(sequelize),
        Chat: initChat(sequelize),
        ChatUser: initChatUser(sequelize),
        Message: initMessage(sequelize),
        MinesGame: initMinesGame(sequelize),
        ClassicGame: initClassicGame(sequelize),
        ClassicGameBet: initClassicGameBet(sequelize),
        Tournament: initTournament(sequelize),
        PaymentMethod: initPaymentMethod(sequelize),
        WithdrawMethod: initWithdrawMethod(sequelize),
        UserPayment: initUserPayment(sequelize),
        UserWithdraw: initUserWithdraw(sequelize),
        Bonus: initBonus(sequelize),
        PromoCode: initPromoCode(sequelize),
        PromoCodeUse: initPromoCodeUse(sequelize),
        AuthClient: initAuthClient(sequelize),
        AdminAction: initAdminAction(sequelize),

        Item: migrationManaged(initItem(sequelize)),
        SyncRun: migrationManaged(initSyncRun(sequelize)),
        SyncRunBatch: migrationManaged(initSyncRunBatch(sequelize)),
        CronJob: migrationManaged(initCronJob(sequelize)),
    };

    forEach(database, model => {
        if (isAssociable(model)) {
            model.associate(database);
        }
    });

    return database;
};
