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
    'mines::antiMinus': ['0', 'Вероятность активации антиминуса (от 0 до 1)'],
    'mines::antiMinusSteps': ['5', 'Верхняя граница номера хода с бомбой для антиминуса (нумерация с 1)'],
    'bonus::minsBetweenBonuses': ['1440', 'Количество минут для получения следующего бонуса'],
    'bonus::vkPostId': ['', 'ID поста, который нужно репостнуть для получения бонуса'],
    'bonus::getBonusFrequencyLimitDeposit': [
        '50',
        'Минимальная сумма депозита для снятия частотных ограничений на получение бонусов',
    ],
    'bonus::getBonusFrequencyLimitWithoutDeps': [
        '3/P7D',
        'Частотные ограничения на получение бонусов (<кол-во получений>/<период в формате ISO 8601 duration>)',
    ],
    'bonus::minVkFriendsToUsePromoCode': ['20', 'Необходимое количество друзей для активации промокода'],
    'bonus::minDepositsToCreatePromoCode': ['50', 'Сумма депозитов для создания промокода'],
    'bonus::usePromoCodeFrequencyLimitDeposit': [
        '50',
        'Минимальная сумма депозита для снятия частотных ограничений на активацию промокодов',
    ],
    'bonus::usePromoCodeFrequencyLimitWithoutDeps': [
        '3/P7D',
        'Частотные ограничения на активацию промокодов (<кол-во активаций>/<период в формате ISO 8601 duration>)',
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
}

export default SettingsRepository;
