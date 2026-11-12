import BaseRepository from './base';
import { Setting, SettingName, SettingValue } from '../models/Setting';

const defaultSettings: Record<SettingName, [string | null, string | null]> = {
    'referrals::minTurnoverCoef': ['1.6', 'Минимальный коэфициент для подсчета оборота'],
    'referrals::minRefMoneyToGet': ['50', 'Минимальное значение refMoney для перечисления на money'],
    'referrals::minDepsToGetMoney': ['50', 'Минимальная сумма депозитов для перечисления refMoney на money'],
    'referrals::plusUserMoney': ['0', 'Сколько получит рефовод'],
    'referrals::plusRefMoney': ['1', 'Сколько получит реферал'],
    'chat::adminAnnouncementsTitle': ['Новости от администрации', 'Названия чата с оповещениями от администрации'],
    'chat::adminAnnouncementsImage': [
        'https://static10.tgstat.ru/channels/_0/15/15e0f5c67b87b751e377b4dbb3c1dc74.jpg',
        'Картинка чата с оповещениями от администрации',
    ],
    'chat::minDepsToSendGlobalMessage': ['30', 'Минимальная сумма депозитов для отправки сообщений в глобальный чат'],
    'classic::countdownTimer': ['30', 'Время обратного отсчета таймера для классика в секундах'],
    'classic::culminationTimer': ['10', 'Длительность кульминации для классика в секундах'],
    'classic::endedTimer': ['5', 'Длительность окончания игры для классика в секундах'],
    'classic::minBetAmount': ['1', 'Минимальная сумма ставки для классика'],
    'classic::minPlayersToStartCountdown': [
        '2',
        'Минимальная количество игроков для стратра обратного отсчета для классика',
    ],
    'classic::commissionPercent': ['10', 'Процент комиссии для классика'],
    'classic::turnsCount': ['7', 'Количество поворотов колеса при определении победителя для классика'],
    'classic::maxSummaryBet': ['100', 'Максимальная суммарная ставка игрока в одной игре классика'],
    'app::fakeOnline': [
        '2:20,9:20,14:20,18:20,24:20',
        'Фейковый онлайн. Формат через запятую "[до времени]:[плюс онлайн],[до времени]:[плюс онлайн]"',
    ],
    'tournament::activityLengthDays': ['7', 'Продолжительность турнира по активности'],
    'tournament::referralsLengthDays': ['30', 'Продолжительность турнира по рефералам'],
    'tournament::activityPauseDays': ['3', 'Пауза между турнирами по активности'],
    'tournament::referralsPauseDays': ['3', 'Пауза между турнирами по рефералам'],
    'payments::defaultDepositCommission': ['10', 'Процент комиссии по-умолчанию для неизвестных способов оплаты'],
    'payments::minBetToWithdraw': ['50', 'Минимальная суммарная ставка для вывода'],
    'payments::minDepositToWithdraw': ['50', 'Минимальная сумма депозита для вывода'],
    'user::maxBalanceWithoutDeposits': ['200', 'Максимальный баланс пользователя без депозитов'],
    'mines::maxBetAmount': ['100', 'Максимальная ставка в минах'],
    'mines::maxProfitAmount': ['1000', 'Максимальный выигрыш в минах'],
    'bonus::minsBetweenBonuses': ['1440', 'Количество минут для получения следующего бонуса'],
    'bonus::getBonusFrequencyLimitDeposit': [
        '50',
        'Минимальная сумма депозита для снятия частотных ограничений на получение бонусов',
    ],
    'bonus::getBonusFrequencyLimitWithoutDeps': [
        '3/P7D',
        'Частотные ограничения на получение бонусов (<кол-во получений>/<период в формате ISO 8601 duration>)',
    ],
    'bonus::minDepositsToCreatePromoCode': ['50', 'Сумма депозитов для создания промокода'],
    'bonus::usePromoCodeFrequencyLimitDeposit': [
        '50',
        'Минимальная сумма депозита для снятия частотных ограничений на активацию промокодов',
    ],
    'bonus::usePromoCodeFrequencyLimitWithoutDeps': [
        '3/P7D',
        'Частотные ограничения на активацию промокодов (<кол-во активаций>/<период в формате ISO 8601 duration>)',
    ],
    'catalog::sourceUrl': [
        'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/all.json',
        'Источник импорта каталога предметов (формат ByMykel all.json). Только https и хосты из CATALOG_SOURCE_HOSTS',
    ],
};

class SettingsRepository extends BaseRepository {
    async getSetting(name: SettingName): Promise<SettingValue> {
        const setting: Setting | null = await this.db.Setting.findByPk(name, {
            ...this.sequelizeContext,
            rejectOnEmpty: false,
        });

        if (!setting) {
            if (defaultSettings[name]) {
                const [value, description] = defaultSettings[name];
                await this.db.Setting.create({ name, value, description });
                return new SettingValue(value);
            }

            throw new Error(`Setting '${name}' not found`);
        }

        return setting.value;
    }

    async getSettingAsNumber(name: SettingName) {
        return (await this.getSetting(name)).asNumber();
    }

    async getSettingAsString(name: SettingName) {
        return (await this.getSetting(name)).asString();
    }

    /** All known settings (admin panel): stored value merged with the built-in defaults/descriptions. */
    async getAllSettings(): Promise<{ name: string; value: string | null; description: string | null }[]> {
        const rows: Setting[] = await this.db.Setting.findAll();
        const byName = new Map(rows.map(row => [row.name, row]));

        return (Object.keys(defaultSettings) as SettingName[]).map(name => {
            const row = byName.get(name);
            const [defValue, defDescription] = defaultSettings[name];

            let value = defValue;
            if (row) {
                value = row.value.isNull() ? null : row.value.asString();
            }

            return {
                name,
                value,
                description: row ? row.description : defDescription,
            };
        });
    }

    /** Admin panel: update a known setting's value (creates the row with its default description if missing). */
    async setSetting(
        name: string,
        value: string,
    ): Promise<{ name: string; value: string | null; description: string | null }> {
        if (!(name in defaultSettings)) {
            throw new Error(`Unknown setting '${name}'`);
        }
        const settingName = name as SettingName;
        const [, defDescription] = defaultSettings[settingName];

        const existing: Setting | null = await this.db.Setting.findByPk(settingName, {
            ...this.sequelizeContext,
            rejectOnEmpty: false,
        });

        if (existing) {
            await existing.update({ value });
            return { name, value, description: existing.description };
        }

        await this.db.Setting.create({ name: settingName, value, description: defDescription });
        return { name, value, description: defDescription };
    }
}

export default SettingsRepository;
