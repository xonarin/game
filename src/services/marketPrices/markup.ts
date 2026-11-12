import { Repositories } from '../../data/repositories';

/**
 * Наценка к минимальной цене магазинов — настройка prices::markup (таблица Setting, страница «Настройки»).
 * Доля 0…1 с точностью до 4 знаков: 0.05 = 5 %.
 * Item.price = round(MIN(price_usd включённых магазинов) × (1 + наценка), 2).
 */

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

export const PRICE_MARKUP_SETTING = 'prices::markup';

const MARKUP_RE = /^\d+(\.\d{1,4})?$/;

// ── VALIDATION ────────────────────────────────────────────────────────────────

/** Нормализованное значение ("0.0500") или текст ошибки для админа. */
export const checkMarkup = (raw: string): { value: string } | { problem: string } => {
    const value = raw.trim().replace(',', '.');
    if (!MARKUP_RE.test(value) || Number(value) > 1) {
        return { problem: `Наценка — доля от 0 до 1 с точностью до 4 знаков (0.05 = 5 %), получено «${raw}»` };
    }
    return { value: Number(value).toFixed(4) };
};

// ── READ ──────────────────────────────────────────────────────────────────────

/**
 * Множитель цены (1 + наценка) строкой "1.0500" для SQL (CAST AS DECIMAL).
 * Неверное значение в БД — ошибка: прогон цен закроется failed с понятным текстом, а не с тихой ценой.
 */
export const readPriceMultiplier = async (repositories: Repositories): Promise<string> => {
    const raw = await repositories.settings.getSettingAsString(PRICE_MARKUP_SETTING);
    const checked = checkMarkup(raw);
    if ('problem' in checked) {
        throw new Error(`Настройка ${PRICE_MARKUP_SETTING}: ${checked.problem}`);
    }
    return (1 + Number(checked.value)).toFixed(4);
};
