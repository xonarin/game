import crypto from 'crypto';

import { calcUpgradeWindow, fromCents, isUpgradeWin, ROLL_RANGE, toCents, UpgradeWindow } from './game';

/**
 * Симуляция апгрейдов для админки: те же функции, что в настоящей игре (окно, шкала, проверка выигрыша),
 * без базы и без денег. Бросок — из crypto.randomBytes (как случайный serverSeed: исход равномерен).
 *
 * Два режима:
 *  - simulateUpgrades — N независимых ставок одной суммы: RTP и доход с оборота;
 *  - simulatePlayers — N игроков с начальным балансом играют K раундов, ставя из того, что у них осталось:
 *    видно, как доход сайта набирается с оборота, а баланс игроков тает от раунда к раунду.
 */

// ── СЛУЧАЙНОСТЬ ───────────────────────────────────────────────────────────────

// Случайные байты пачками по 64 КБ
const RANDOM_CHUNK_ROLLS = 16384;
const UINT32_RANGE = 2 ** 32;

/** Поток равномерных бросков 0…ROLL_RANGE-1, как toRoll(число из HMAC). */
const createRoller = () => {
    let buffer = Buffer.alloc(0);
    let index = RANDOM_CHUNK_ROLLS;

    return (): number => {
        if (index === RANDOM_CHUNK_ROLLS) {
            buffer = crypto.randomBytes(RANDOM_CHUNK_ROLLS * 4);
            index = 0;
        }
        const roll = Math.floor((buffer.readUInt32BE(index * 4) / UINT32_RANGE) * ROLL_RANGE);
        index += 1;
        return roll;
    };
};

/** Шанс игры в [from, to] → цена цели и окно, как если бы игрок выбрал скин с таким шансом. */
const pickTarget = (
    betCents: number,
    chanceFrom: number,
    chanceTo: number,
    frontendCoef: number,
): { targetCents: number; window: UpgradeWindow | null } => {
    const chance = chanceFrom + Math.random() * (chanceTo - chanceFrom);
    const targetCents = Math.round((betCents * frontendCoef) / chance);
    return { targetCents, window: calcUpgradeWindow(betCents, targetCents, frontendCoef) };
};

const windowSize = (window: UpgradeWindow) => window.winEnd - window.winStart + 1;

// ── РЕЖИМ «СТАВКИ» ────────────────────────────────────────────────────────────

export interface SimulationInput {
    games: number;
    /** Стоимость ставки в монетах (скины + монеты). */
    bet: number;
    /** Шанс каждой игры — случайный равномерно в [chanceFrom, chanceTo]; равные — фиксированный. */
    chanceFrom: number;
    chanceTo: number;
    /** Коэффициент шанса (RTP). */
    frontendCoef: number;
}

export interface SimulationResult {
    games: number;
    wins: number;
    losses: number;
    betTotal: number;
    payoutTotal: number;
    profit: number;
    /** Фактический RTP симуляции: payoutTotal / betTotal. */
    rtp: number;
    /** Ожидаемый RTP: средний шанс окна × выплата, без случайности. */
    expectedRtp: number;
    durationMs: number;
}

export const MAX_SIMULATION_GAMES = 1000000;

export const simulateUpgrades = (input: SimulationInput): SimulationResult => {
    const started = Date.now();
    const roll = createRoller();
    const betCents = toCents(input.bet);

    let wins = 0;
    let payoutCents = 0;
    let expectedPayoutCents = 0;

    for (let game = 0; game < input.games; game += 1) {
        const { targetCents, window } = pickTarget(betCents, input.chanceFrom, input.chanceTo, input.frontendCoef);
        if (window) {
            expectedPayoutCents += (targetCents * windowSize(window)) / ROLL_RANGE;
            if (isUpgradeWin(roll(), window)) {
                wins += 1;
                payoutCents += targetCents;
            }
        }
    }

    const totalBetCents = betCents * input.games;
    return {
        games: input.games,
        wins,
        losses: input.games - wins,
        betTotal: fromCents(totalBetCents),
        payoutTotal: fromCents(payoutCents),
        profit: fromCents(totalBetCents - payoutCents),
        rtp: totalBetCents > 0 ? payoutCents / totalBetCents : 0,
        expectedRtp: totalBetCents > 0 ? expectedPayoutCents / totalBetCents : 0,
        durationMs: Date.now() - started,
    };
};

/** Шансы для сравнения «если бы все играли с таким шансом»: 80 %, 70 % … 10 %. */
export const BREAKDOWN_CHANCES = [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];

/** Те же ставки, но с фиксированным шансом — по каждому из BREAKDOWN_CHANCES. */
export const simulateByChance = (input: SimulationInput): Array<SimulationResult & { chance: number }> =>
    BREAKDOWN_CHANCES.map(chance => ({
        chance,
        ...simulateUpgrades({ ...input, chanceFrom: chance, chanceTo: chance }),
    }));

// ── РЕЖИМ «ИГРОКИ» ────────────────────────────────────────────────────────────

export type PlayersBetMode = 'FIXED' | 'ALL_IN' | 'RANDOM';

export interface PlayersSimulationInput {
    players: number;
    /** Сколько монет у каждого игрока в начале. */
    startBalance: number;
    /** Сколько раундов играет каждый (пока есть на что ставить). */
    rounds: number;
    /**
     * FIXED — ставка bet за раунд (или остаток, если меньше); ALL_IN — весь баланс каждый раунд;
     * RANDOM — случайная сумма от минимальной ставки до всего баланса, каждый раунд заново.
     */
    betMode: PlayersBetMode;
    bet: number;
    chanceFrom: number;
    chanceTo: number;
    frontendCoef: number;
    /** Меньше этого на балансе — игрок выбывает (минимальная ставка). */
    minBet: number;
    /**
     * Вывод при росте баланса: доля 0.5 = игрок выводит всё и уходит, как только баланс
     * ≥ начальный × 1.5. null — не выводит, играет все раунды.
     */
    cashOutGrowth: number | null;
}

export interface PlayersRoundStats {
    round: number;
    /** Сколько игроков ещё могли ставить в этом раунде. */
    activePlayers: number;
    turnover: number;
    payout: number;
    profit: number;
    cumulativeProfit: number;
    /** Сколько монет у ещё играющих после раунда (выведенное не входит). */
    playersBalance: number;
    /** Сколько игроков вывели к концу раунда (всего) и сколько монет выведено (всего). */
    cashedOutPlayers: number;
    withdrawn: number;
}

export interface PlayersSimulationResult {
    players: number;
    rounds: number;
    /** Сколько игроки принесли: players × startBalance. */
    deposited: number;
    /** Сумма всех ставок за все раунды. */
    turnover: number;
    payout: number;
    profit: number;
    /** Доход от принесённого: profit / deposited. */
    profitShareOfDeposits: number;
    /** Доход от оборота: profit / turnover (≈ 1 − RTP). */
    profitShareOfTurnover: number;
    rtp: number;
    /** Сколько осталось у тех, кто не вывел. */
    playersBalance: number;
    /** Сколько игроков к концу не могут сделать даже минимальную ставку (без выведших). */
    brokePlayers: number;
    /** Сколько игроков вывели и сколько монет ушло выводами. */
    cashedOutPlayers: number;
    withdrawn: number;
    byRound: PlayersRoundStats[];
    durationMs: number;
}

/** Ставка игрока в раунде (в центах) по режиму; меньше minBetCents — игрок не может ставить. */
const roundBetCents = (mode: PlayersBetMode, balance: number, fixedBetCents: number, minBetCents: number): number => {
    if (mode === 'ALL_IN') return balance;
    if (mode === 'FIXED') return Math.min(fixedBetCents, balance);
    // RANDOM: равномерно целое число центов в [minBetCents, balance]
    if (balance < minBetCents) return balance;
    return minBetCents + Math.floor(Math.random() * (balance - minBetCents + 1));
};

/** Лимит работы: игроки × раунды. */
export const MAX_PLAYERS_SIMULATION_BETS = 5000000;

export const simulatePlayers = (input: PlayersSimulationInput): PlayersSimulationResult => {
    const started = Date.now();
    const roll = createRoller();

    const minBetCents = Math.max(toCents(input.minBet), 1);
    const fixedBetCents = toCents(input.bet);
    const startCents = toCents(input.startBalance);
    const balances = new Float64Array(input.players).fill(startCents);
    // Вывел и ушёл: баланс обнулён (деньги посчитаны в withdrawnCents), больше не ставит
    const cashedOut = new Uint8Array(input.players);
    const cashOutCents = input.cashOutGrowth === null ? Infinity : Math.round(startCents * (1 + input.cashOutGrowth));

    let turnoverCents = 0;
    let withdrawnCents = 0;
    let cashedOutPlayers = 0;
    let payoutCents = 0;
    const byRound: PlayersRoundStats[] = [];

    for (let round = 1; round <= input.rounds; round += 1) {
        let roundTurnover = 0;
        let roundPayout = 0;
        let active = 0;

        for (let player = 0; player < input.players; player += 1) {
            const balance = balances[player];
            const betCents = roundBetCents(input.betMode, balance, fixedBetCents, minBetCents);

            if (betCents >= minBetCents) {
                const { targetCents, window } = pickTarget(
                    betCents,
                    input.chanceFrom,
                    input.chanceTo,
                    input.frontendCoef,
                );
                if (window) {
                    active += 1;
                    roundTurnover += betCents;
                    const won = isUpgradeWin(roll(), window);
                    if (won) roundPayout += targetCents;
                    const next = balance - betCents + (won ? targetCents : 0);

                    if (next >= cashOutCents) {
                        cashedOut[player] = 1;
                        cashedOutPlayers += 1;
                        withdrawnCents += next;
                        balances[player] = 0;
                    } else {
                        balances[player] = next;
                    }
                }
            }
        }

        turnoverCents += roundTurnover;
        payoutCents += roundPayout;
        const playersBalanceCents = balances.reduce((sum, value) => sum + value, 0);

        byRound.push({
            round,
            activePlayers: active,
            turnover: fromCents(roundTurnover),
            payout: fromCents(roundPayout),
            profit: fromCents(roundTurnover - roundPayout),
            cumulativeProfit: fromCents(turnoverCents - payoutCents),
            playersBalance: fromCents(playersBalanceCents),
            cashedOutPlayers,
            withdrawn: fromCents(withdrawnCents),
        });

        if (active === 0) break; // все разорились — дальше раунды пустые
    }

    const depositedCents = toCents(input.startBalance) * input.players;
    const profitCents = turnoverCents - payoutCents;
    const brokePlayers = balances.reduce(
        (count, value, player) => count + (!cashedOut[player] && value < minBetCents ? 1 : 0),
        0,
    );

    return {
        players: input.players,
        rounds: input.rounds,
        deposited: fromCents(depositedCents),
        turnover: fromCents(turnoverCents),
        payout: fromCents(payoutCents),
        profit: fromCents(profitCents),
        profitShareOfDeposits: depositedCents > 0 ? profitCents / depositedCents : 0,
        profitShareOfTurnover: turnoverCents > 0 ? profitCents / turnoverCents : 0,
        rtp: turnoverCents > 0 ? payoutCents / turnoverCents : 0,
        playersBalance: fromCents(depositedCents - profitCents - withdrawnCents),
        brokePlayers,
        cashedOutPlayers,
        withdrawn: fromCents(withdrawnCents),
        byRound,
        durationMs: Date.now() - started,
    };
};
