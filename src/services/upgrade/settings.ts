import { UpgradeSettings } from '../../data/models/Setting';
import { Repositories } from '../../data/repositories';

/**
 * Настройки режима «Апгрейд» — таблица Setting, ключи upgrade::*. Правятся в админке
 * (страницы «Настройки» и «Апгрейд») через adminUpdateSetting, который проверяет значения здесь.
 */

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

export const UPGRADE_SETTING_PREFIX = 'upgrade::';

interface Rule {
    /** Знаков после точки при хранении. */
    scale: number;
    min: number;
    max?: number;
    /** min не включается: значение строго больше. */
    minExclusive?: boolean;
    label: string;
}

const RULES: Record<UpgradeSettings, Rule> = {
    'upgrade::hiddenRTP': { scale: 4, min: 0, max: 1, minExclusive: true, label: 'Скрытый RTP — доля от 0 до 1' },
    'upgrade::frontendCoef': { scale: 4, min: 0, minExclusive: true, label: 'Коэффициент шанса — больше 0' },
    'upgrade::minBet': { scale: 2, min: 0, minExclusive: true, label: 'Минимальная ставка — больше 0' },
    'upgrade::maxBet': { scale: 2, min: 0, minExclusive: true, label: 'Максимальная ставка — больше 0' },
    'upgrade::houseEdge': { scale: 4, min: 0, max: 1, label: 'Маржа казино — доля от 0 до 1' },
    'upgrade::minChance': { scale: 4, min: 0, max: 1, minExclusive: true, label: 'Минимальный шанс — доля от 0 до 1' },
    'upgrade::maxChance': { scale: 4, min: 0, max: 1, minExclusive: true, label: 'Максимальный шанс — доля от 0 до 1' },
    'upgrade::maxBetItems': { scale: 0, min: 1, max: 100, label: 'Скинов в ставке — целое от 1 до 100' },
    'upgrade::targetItemMarkup': { scale: 2, min: 1, label: 'Минимальный множитель цели — не меньше 1' },
};

// ── VALIDATION ────────────────────────────────────────────────────────────────

export const isUpgradeSetting = (name: string): name is UpgradeSettings => name in RULES;

/** Нормализованное значение ("0.9000", "10.00") или текст ошибки для админа. */
export const checkUpgradeSetting = (name: UpgradeSettings, raw: string): { value: string } | { problem: string } => {
    const rule = RULES[name];
    const value = raw.trim().replace(',', '.');
    const re = rule.scale > 0 ? new RegExp(`^\\d+(\\.\\d{1,${rule.scale}})?$`) : /^\d+$/;
    const precision = rule.scale > 0 ? `, не больше ${rule.scale} знаков после точки` : '';
    const fail = { problem: `${rule.label}${precision}; получено «${raw}»` };

    if (!re.test(value)) {
        return fail;
    }
    const num = Number(value);
    if (rule.minExclusive ? num <= rule.min : num < rule.min) {
        return fail;
    }
    if (rule.max !== undefined && num > rule.max) {
        return fail;
    }
    return { value: num.toFixed(rule.scale) };
};

/** Ставки согласованы: minBet ≤ maxBet. Вызывать с уже проверенным новым значением. */
export const checkUpgradeBetRange = async (
    repositories: Repositories,
    name: UpgradeSettings,
    value: string,
): Promise<string | null> => {
    if (name !== 'upgrade::minBet' && name !== 'upgrade::maxBet') {
        return null;
    }
    const other = name === 'upgrade::minBet' ? 'upgrade::maxBet' : 'upgrade::minBet';
    const otherValue = await repositories.settings.getSettingAsNumber(other);
    const [min, max] = name === 'upgrade::minBet' ? [Number(value), otherValue] : [otherValue, Number(value)];

    return min > max ? `Минимальная ставка (${min}) больше максимальной (${max})` : null;
};
