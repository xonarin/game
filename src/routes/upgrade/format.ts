/** Монеты: 2 знака, разделитель — запятая (1,35). */
export const formatCoins = (amount: number): string =>
    amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Русское склонение по числу: plural(2, ['скин', 'скина', 'скинов']) → 'скина'. */
export const plural = (count: number, [one, few, many]: [string, string, string]): string => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
};

export const formatPercent = (fraction: number): string => `${(fraction * 100).toFixed(2)}%`;

/** Округление вниз до цента: верхняя граница цены цели не должна оказаться выше серверной. */
export const floorCents = (amount: number): number => Math.floor(Math.round(amount * 1e6) / 1e4) / 100;

/** Округление вверх до цента: нижняя граница цены цели не должна оказаться ниже серверной. */
export const ceilCents = (amount: number): number => Math.ceil(Math.round(amount * 1e6) / 1e4) / 100;
