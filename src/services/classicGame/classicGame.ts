import Big from 'big.js';

import { sha256Hash } from '../../utils/crypto';
import { UserError } from '../../utils/errors';
import Locker from '../../utils/locker';
import RandomizedPool from '../../utils/randomizedPool';
import { repositories } from '../../data/database';
import { User } from '../../data/models/User';
import { ClassicGameState as ClassicGameStateEnum } from '../../data/models/ClassicGame';
import pubsub from '../../data/pubsub';
import ClassicGameState from './states/abstract';
import ClassicGameStateWaiting from './states/waiting';
import ClassicGameStateCountdown from './states/countdown';
import ClassicGameStateCulmination from './states/culmination';

export interface ClassicGamePlayer {
    userId: string;
    username: string;
    avatar: string;
    betsPrice: Big;
    chance: number;
    startDegree: number;
    endDegree: number;
    color: string;
}

export interface ClassicGameBet {
    betId: string;
    userId: string;
    amount: number;
    firstTicket: number;
    lastTicket: number;
}

export interface ClassicGameClientSnapshot {
    minBetAmount: number;
    gameId: string;
    state: string;
    commission: number;
    randomNumber?: number;
    hash: string;
    fund: number;
    winnerId?: string;
    winnerUsername?: string;
    winnerAvatar?: string;
    winnerTicket?: number;
    winnerChance?: number;
    timer: number;
    maxTimer: number;
    bets: ClassicGameBet[];
    players: ClassicGamePlayer[];
    culminationDegree?: number;
    remainingCulminationDuration?: number;
}

const initColorsPool = [
    '#ff7f50',
    '#7b68ee',
    '#8b4513',
    '#708090',
    '#800080',
    '#7fffd4',
    '#2f4f4f',
    '#8fbc8f',
    '#808000',
    '#fa8072',
];

export class ClassicGameService {
    // Настройки игры
    public countdownTimer: number = 10;
    public culminationTimer: number = 10;
    public endedTimer: number = 5;
    public minBetAmount: number = 0;
    public minPlayersToStartCountdown: number = 1;
    public commissionPercent: number = 1;
    public turnsCount: number = 5;

    // Текущее состояние игры
    public state: ClassicGameState | null = null;
    public isUndead: boolean = true;
    public isRestoring: boolean = false;

    // Рантайм поля, напрямую связянные с БД
    public gameId: string = '0';
    public randomNumber: number = 0.5;
    public hash: string = 'DEFAULT_HASH';
    public fund: Big = new Big(0);
    public winnerId: string | null = null;
    public winnerTicket: number | null = null;
    public winnerBetsPrice: Big | null = null;
    public winnerChance: number | null = null;
    public finishedAt: Date | null = null;

    // Рантайм поля, не связянные с БД
    public timer: number = 30;
    public maxTimer: number = 30;
    public currentLastTicket: number = 0;
    public colorsPool: RandomizedPool<string> = new RandomizedPool<string>(initColorsPool);
    public bets: ClassicGameBet[] = [];
    public players: Map<string, ClassicGamePlayer> = new Map<string, ClassicGamePlayer>();
    public playersList: ClassicGamePlayer[] = [];
    public culminationDegree?: number;

    public stateLocker: Locker = new Locker();
    public betsLocker: Locker = new Locker();

    public async placeBet(user: User, amount: number): Promise<ClassicGameBet> {
        const state = await this.getStateStrictAsync();
        const bet = await state.placeBet(user, amount);

        await pubsub.publish('placedClassicGameBet', {
            fund: Number(this.fund.toFixed(2)),
            bet,
            players: this.playersList,
        });

        return bet;
    }

    public async clientSnapshot(): Promise<ClassicGameClientSnapshot> {
        const state = await this.getStateStrictAsync();
        return state.clientSnapshot();
    }

    public async createNewGame(): Promise<void> {
        await this.updateSettings();

        const randomNumber = Math.random().toFixed(18);
        this.randomNumber = Number(randomNumber);
        this.hash = sha256Hash(randomNumber);

        const game = await repositories.classicGames.createGame(randomNumber, this.hash, this.commissionPercent);
        this.gameId = game.id;

        this.fund = new Big(0);
        this.winnerId = null;
        this.winnerTicket = null;
        this.winnerBetsPrice = null;
        this.winnerChance = null;
        this.finishedAt = null;

        this.timer = this.countdownTimer;
        this.maxTimer = this.countdownTimer;
        this.currentLastTicket = 0;
        this.colorsPool.reset();
        this.bets = [];
        this.players = new Map<string, ClassicGamePlayer>();
        this.playersList = [];
        this.culminationDegree = undefined;
    }

    public async updateTimer(state: string, timer: number): Promise<void> {
        this.timer = timer;

        if (!this.isRestoring) {
            await pubsub.publish('updatedClassicGameTimer', { state, timer, maxTimer: this.maxTimer });
        }
    }

    public async placeBet0(user: User, amount: number): Promise<ClassicGameBet> {
        if (amount < this.minBetAmount) {
            throw new UserError('CLASSIC_GAME_MIN_BET_PRICE_ERROR');
        }

        const maxSummaryBet = await repositories.settings.getSettingAsNumber('classic::maxSummaryBet');
        const currentSummaryBet = this.players.get(user.id)?.betsPrice || new Big(0);

        if (currentSummaryBet.eq(maxSummaryBet)) {
            throw new UserError('CLASSIC_GAME_MAX_BET_REACHED');
        }

        const tmpAmount = currentSummaryBet.plus(new Big(amount));
        const newAmount = Number(
            (tmpAmount.gt(maxSummaryBet) ? new Big(maxSummaryBet).minus(currentSummaryBet) : amount).toFixed(2),
        );

        await this.betsLocker.lock();

        try {
            await repositories.users.withdrawMoney(user.id, newAmount);

            const newLastTicket = Math.round(this.currentLastTicket + newAmount * 100);
            const { id: betId, firstTicket, lastTicket } = await repositories.classicGameBets.createBet(
                this.gameId,
                user.id,
                newAmount,
                this.currentLastTicket + 1,
                newLastTicket,
            );

            this.fund = this.fund.plus(newAmount);
            this.currentLastTicket = newLastTicket;

            const bet: ClassicGameBet = {
                betId,
                userId: user.id,
                amount: newAmount,
                firstTicket,
                lastTicket,
            };
            this.bets.unshift(bet);

            const currentPlayer = this.players.get(user.id);
            this.players.set(user.id, {
                userId: user.id,
                username: user.username,
                avatar: user.avatar,
                betsPrice: currentPlayer ? currentPlayer.betsPrice.plus(newAmount) : new Big(newAmount),
                chance: 0,
                startDegree: 0,
                endDegree: 0,
                color: currentPlayer ? currentPlayer.color : this.colorsPool.pop(),
            });
            this.updatePlayers();

            await repositories.classicGames.updateFund(this.gameId, Number(this.fund.toFixed(2)));

            return bet;
        } finally {
            this.betsLocker.unlock();
        }
    }

    public updatePlayers(): void {
        let prevDegree = 0;
        this.playersList = [];
        this.players.forEach(player => {
            const relation = player.betsPrice.div(this.fund);

            // eslint-disable-next-line no-param-reassign
            player.chance = Number(relation.times(100).toFixed(1));
            // eslint-disable-next-line no-param-reassign
            player.startDegree = prevDegree;
            // eslint-disable-next-line no-param-reassign
            player.endDegree = prevDegree + Number(relation.times(360).toFixed(18));

            prevDegree = player.endDegree;
            this.playersList.push(player);
        });
    }

    public async updateSettings(): Promise<void> {
        this.countdownTimer = await repositories.settings.getSettingAsNumber('classic::countdownTimer');
        this.culminationTimer = await repositories.settings.getSettingAsNumber('classic::culminationTimer');
        this.endedTimer = await repositories.settings.getSettingAsNumber('classic::endedTimer');
        this.minBetAmount = await repositories.settings.getSettingAsNumber('classic::minBetAmount');
        this.minPlayersToStartCountdown = await repositories.settings.getSettingAsNumber(
            'classic::minPlayersToStartCountdown',
        );
        this.commissionPercent = await repositories.settings.getSettingAsNumber('classic::commissionPercent');
        this.turnsCount = await repositories.settings.getSettingAsNumber('classic::turnsCount');
    }

    public async initStart(): Promise<void> {
        this.setUndead(true);

        const isRestored = await this.restore();
        if (!isRestored) {
            await this.spawn();
        }
    }

    public async restore(): Promise<boolean> {
        const lastGame = await repositories.classicGames.getLastGame();

        if (lastGame && lastGame.state !== ClassicGameStateEnum.Ended && lastGame.bets) {
            this.isRestoring = true;

            await this.updateSettings();

            this.gameId = lastGame.id;
            this.randomNumber = Number(lastGame.randomNumber);
            this.hash = lastGame.hash;
            this.fund = new Big(lastGame.fund);

            this.currentLastTicket = Math.round(lastGame.fund * 100);
            this.bets = lastGame.bets.map(bet => ({
                betId: bet.id,
                userId: bet.userId,
                amount: bet.amount,
                firstTicket: bet.firstTicket,
                lastTicket: bet.lastTicket,
            }));
            lastGame.bets.reverse().forEach(({ amount, user }) => {
                if (!user) return;

                const currentPlayer = this.players.get(user.id);
                this.players.set(user.id, {
                    userId: user.id,
                    username: user.username,
                    avatar: user.avatar,
                    betsPrice: currentPlayer ? currentPlayer.betsPrice.plus(amount) : new Big(amount),
                    chance: 0,
                    startDegree: 0,
                    endDegree: 0,
                    color: currentPlayer ? currentPlayer.color : this.colorsPool.pop(),
                });
            });
            this.updatePlayers();

            if (lastGame.state === ClassicGameStateEnum.Waiting) {
                await this.switchTo(new ClassicGameStateWaiting(this));
            } else if (lastGame.state === ClassicGameStateEnum.Countdown) {
                await this.switchTo(new ClassicGameStateCountdown(this));
            } else if (lastGame.state === ClassicGameStateEnum.Culmination) {
                await this.switchTo(new ClassicGameStateCulmination(this));
            }

            await pubsub.publish('startedClassicGame', await this.clientSnapshot());

            this.isRestoring = false;

            return true;
        }

        return false;
    }

    public async spawn(): Promise<void> {
        await this.newCycle();
    }

    public async kill(): Promise<void> {
        await this.stop();
    }

    public async resurrect(): Promise<void> {
        if (!this.isUndead) return;

        await this.newCycle();
    }

    public async newCycle(): Promise<void> {
        await this.createNewGame();
        await this.start();
    }

    public async start(): Promise<void> {
        await this.switchTo(new ClassicGameStateWaiting(this));
    }

    public async stop(): Promise<void> {
        await this.state?.exit();
    }

    public async switchTo(state: ClassicGameState): Promise<void> {
        await this.stateLocker.lock();
        this.stateLocker.block();

        try {
            if (this.state) {
                await this.state.exit();
            }
            this.state = state;
            await state.enter();
        } finally {
            this.stateLocker.unlock();
            this.stateLocker.unblock();
        }
    }

    public async getStateStrictAsync(): Promise<ClassicGameState> {
        await this.stateLocker.waitAll();

        if (!this.state) {
            throw new Error('State is not defined');
        }

        return this.state;
    }

    public setUndead(isUndead: boolean): void {
        this.isUndead = isUndead;
    }
}
