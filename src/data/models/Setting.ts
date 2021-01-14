import { DataTypes, Model, Sequelize } from 'sequelize';

import { ModelStatic } from './index';

export type ClassicGameSettingName =
    | 'classic::countdownTimer'
    | 'classic::culminationTimer'
    | 'classic::endedTimer'
    | 'classic::minBetAmount'
    | 'classic::minPlayersToStartCountdown'
    | 'classic::commissionPercent'
    | 'classic::turnsCount';

export type ChatSettingName = 'chat::adminAnnouncementsTitle' | 'chat::adminAnnouncementsImage';

export type ReferralsSettingName = 'referrals::minTurnoverCoef';

export type AppSettingsName = 'app::fakeOnline';

export type TournamentSettingsName =
    | 'tournament::activityLengthDays'
    | 'tournament::referralsLengthDays'
    | 'tournament::activityPauseDays'
    | 'tournament::referralsPauseDays';

export type PaymentsSettings = 'payments::minBetToWithdraw' | 'payments::minDepositToWithdraw';

export type SettingName =
    | ClassicGameSettingName
    | ChatSettingName
    | ReferralsSettingName
    | AppSettingsName
    | TournamentSettingsName
    | PaymentsSettings;

export class SettingValue {
    private readonly value: string | null;

    constructor(value: string | null) {
        this.value = value;
    }

    public asNumber(): number {
        if (!this.value) {
            throw new TypeError('Value is not a number');
        }
        const value = Number(this.value);
        if (Number.isNaN(value)) {
            throw new TypeError('Value is not a number');
        }
        return value;
    }

    public asString(): string {
        if (this.value === null) {
            throw new TypeError('Value is null');
        }
        return this.value;
    }

    public isNull(): boolean {
        return this.value === null;
    }
}

export interface Setting extends Model {
    readonly name: SettingName;
    readonly value: SettingValue;
    readonly description: string | null;
}

export type SettingStatic = ModelStatic<Setting>;

export const initSetting = (sequelize: Sequelize): SettingStatic => {
    return sequelize.define(
        'Setting',
        {
            name: {
                type: DataTypes.STRING,
                primaryKey: true,
            },

            value: {
                type: DataTypes.STRING,
                allowNull: false,
                get(this: Setting) {
                    return new SettingValue((this.getDataValue('value') as unknown) as string | null);
                },
            },

            description: {
                type: DataTypes.TEXT,
            },
        },
        { timestamps: false },
    ) as SettingStatic;
};
