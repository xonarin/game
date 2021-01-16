import BaseRepository from './base';
import { Setting, SettingName, SettingValue } from '../models/Setting';

const defaultSettings: Record<SettingName, [string | null, string | null]> = {
    'referrals::minTurnoverCoef': ['2', 'Минимальный коэфициент для подсчета оборота'],
    'chat::adminAnnouncementsTitle': ['Новости от администрации', 'Названия чата с оповещениями от администрации'],
    'chat::adminAnnouncementsImage': [
        'https://static10.tgstat.ru/channels/_0/15/15e0f5c67b87b751e377b4dbb3c1dc74.jpg',
        'Картинка чата с оповещениями от администрации',
    ],
    'classic::countdownTimer': ['10', 'Время обратного отсчета таймера для классика в секундах'],
    'classic::culminationTimer': ['10', 'Длительность кульминации для классика в секундах'],
    'classic::endedTimer': ['5', 'Длительность окончания игры для классика в секундах'],
    'classic::minBetAmount': ['1', 'Минимальная сумма ставки для классика'],
    'classic::minPlayersToStartCountdown': [
        '1',
        'Минимальная количество игроков для стратра обратного отсчета для классика',
    ],
    'classic::commissionPercent': ['5', 'Процент комиссии для классика'],
    'classic::turnsCount': ['5', 'Количество поворотов колеса при определении победителя для классика'],
    'app::fakeOnline': [
        '2:50,9:10,14:20,18:30,24:50',
        'Фейковый онлайн. Формат через запятую "[до времени]:[плюс онлайн],[до времени]:[плюс онлайн]"',
    ],
    'tournament::activityLengthDays': ['7', 'Продолжительность турнира по активности'],
    'tournament::referralsLengthDays': ['30', 'Продолжительность турнира по рефералам'],
    'tournament::activityPauseDays': ['3', 'Пауза между турнирами по активности'],
    'tournament::referralsPauseDays': ['3', 'Пауза между турнирами по рефералам'],
    'payments::defaultDepositCommission': ['5', 'Процент комиссии по-умолчанию для неизвестных способов оплаты'],
    'payments::minBetToWithdraw': ['100', 'Минимальная суммарная ставка для вывода'],
    'payments::minDepositToWithdraw': ['50', 'Минимальная сумма депозита для вывода'],
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
}

export default SettingsRepository;
