import { Sequelize, Model, Association } from 'sequelize';
import { forEach } from 'lodash';

import { initSetting, SettingStatic } from './Setting';
import { initUser, UserStatic } from './User';
import { initChat, ChatStatic } from './Chat';
import { ChatUserStatic, initChatUser } from './ChatUser';
import { initMessage, MessageStatic } from './Message';
import { initClassicGame, ClassicGameStatic } from './ClassicGame';
import { initClassicGameBet, ClassicGameBetStatic } from './ClassicGameBet';
import { initReferralIncome, ReferralIncomeStatic } from './ReferralIncome';
import { initMinesGame, MinesGameStatic } from './MinesGame';

export type ModelStatic<M extends Model> = typeof Model & (new () => M);

export type AssociableModelStatic<M extends Model, A extends { [key: string]: Association } = {}> = ModelStatic<M> &
    A & {
        associate: (database: Database) => void;
    };

function isAssociable(model: Sequelize | ModelStatic<Model>): model is AssociableModelStatic<Model> {
    return 'associate' in model;
}

export interface Database {
    sequelize: Sequelize;

    // Models
    Setting: SettingStatic;
    User: UserStatic;
    ReferralIncome: ReferralIncomeStatic;
    Chat: ChatStatic;
    ChatUser: ChatUserStatic;
    Message: MessageStatic;
    ClassicGame: ClassicGameStatic;
    ClassicGameBet: ClassicGameBetStatic;
    MinesGame: MinesGameStatic;
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
        ClassicGame: initClassicGame(sequelize),
        ClassicGameBet: initClassicGameBet(sequelize),
        MinesGame: initMinesGame(sequelize),
    };

    forEach(database, model => {
        if (isAssociable(model)) {
            model.associate(database);
        }
    });

    return database;
};
