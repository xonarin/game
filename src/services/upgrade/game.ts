/**
 * Апгрейд: расчёт шанса, окна выигрыша и исхода. Только чистые функции — без БД и без Math.random:
 * исход зависит лишь от ставки, цели, коэффициента и provably fair числа (serverSeed, clientSeed, nonce).
 *
 * Шкала броска — целые 0…ROLL_RANGE-1. Окно [winStart, winEnd] (включительно) центрировано на середине шкалы
 * и считается ДО броска; его размер winSize = floor(ROLL_RANGE × шанс), поэтому вероятность выигрыша
 * ровно winSize / ROLL_RANGE ≤ шанс, который видит игрок.
 */

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

export const ROLL_RANGE = 100000;
const ROLL_CENTER = ROLL_RANGE / 2;

// ── MONEY ─────────────────────────────────────────────────────────────────────

/** Деньги в целых центах: сравнения и суммы без ошибок плавающей точки. */
export const toCents = (amount: number | string): number => Math.round(Number(amount) * 100);

export const fromCents = (cents: number): number => cents / 100;

// ── WINDOW ────────────────────────────────────────────────────────────────────

export interface UpgradeWindow {
    /** Цена цели / стоимость ставки. */
    multiplier: number;
    /** (1 / multiplier) × frontendCoef — шанс, который видит игрок. */
    chance: number;
    winStart: number;
    winEnd: number;
}

/**
 * Окно выигрыша для ставки и цели. null — шанс вне шкалы (окно пустое или на всю шкалу),
 * играть такую пару нельзя.
 */
export const calcUpgradeWindow = (
    betValueCents: number,
    targetPriceCents: number,
    frontendCoef: number,
): UpgradeWindow | null => {
    if (betValueCents <= 0 || targetPriceCents <= 0) {
        return null;
    }

    const multiplier = targetPriceCents / betValueCents;
    const chance = (1 / multiplier) * frontendCoef;
    const winSize = Math.floor(ROLL_RANGE * chance);

    if (winSize < 1 || winSize >= ROLL_RANGE) {
        return null;
    }

    const winStart = ROLL_CENTER - Math.floor(winSize / 2);
    return { multiplier, chance, winStart, winEnd: winStart + winSize - 1 };
};

/**
 * Шанс в допустимых пределах [minChance, maxChance]. Допуск 1e-9 — только на погрешность деления:
 * ставка, посчитанная как цель × maxChance / coef с округлением вниз до цента, должна проходить.
 */
export const isChanceInRange = (chance: number, minChance: number, maxChance: number): boolean =>
    chance >= minChance - 1e-9 && chance <= maxChance + 1e-9;

// ── ROLL ──────────────────────────────────────────────────────────────────────

/** Provably fair число [0, 1) → целый бросок 0…ROLL_RANGE-1. */
export const toRoll = (randomNumber: number): number => Math.floor(randomNumber * ROLL_RANGE);

export const isUpgradeWin = (roll: number, { winStart, winEnd }: Pick<UpgradeWindow, 'winStart' | 'winEnd'>) =>
    roll >= winStart && roll <= winEnd;
