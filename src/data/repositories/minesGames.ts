/* eslint-disable no-bitwise */
import { range } from 'lodash';
import { Transaction } from 'sequelize';

import BaseRepository from './base';
import { MinesGame, MinesGameStatus } from '../models/MinesGame';
import { FIELD_SIZE, getMinesCoef } from '../../utils/mines';
import { UserError } from '../../utils/errors';
import { addMinesGame } from '../../services/LiveData/LiveDataStorage';
import { countOnes } from '../../utils/number';

class MinesGamesRepository extends BaseRepository {
    async getGameById(gameId: string, transaction?: Transaction): Promise<MinesGame | null> {
        return this.db.MinesGame.findByPk(gameId, {
            ...this.sequelizeContext,
            ...(transaction && { transaction, lock: transaction.LOCK.UPDATE }),
            rejectOnEmpty: false,
            include: [this.db.MinesGame.User],
        });
    }

    async getGameByIdStrict(gameId: string, transaction?: Transaction): Promise<MinesGame> {
        const game = await this.getGameById(gameId, transaction);

        if (!game) {
            throw new UserError('NO_GAME');
        }

        return game;
    }

    async getCurrentGame(userId: string, transaction?: Transaction): Promise<MinesGame | null> {
        return this.db.MinesGame.findOne({
            where: {
                userId,
                status: MinesGameStatus.InGame,
            },
            order: [['id', 'DESC']],
            include: [this.db.MinesGame.User],
            transaction,
        });
    }

    async createGame(userId: string, betAmount: number, bombsCount: number): Promise<MinesGame> {
        const { clientSeed, serverSeed, nonce } = await this.repositories.users.getUserByIdStrict(userId);

        const numbers = await this.repositories.users.generateRandomNumbers(userId, FIELD_SIZE - 1);
        const pickers = numbers.map((number, index) => Math.floor(number * (FIELD_SIZE - index)));

        const initialBombs = range(FIELD_SIZE);
        const resultBombs = pickers.reduce<number[]>((acc, picker) => {
            acc.push(initialBombs.splice(picker, 1)[0]);
            return acc;
        }, []);
        resultBombs.push(initialBombs[0]);

        const pickedBombs = resultBombs.slice(0, bombsCount);
        const fieldConf = pickedBombs.reduce((acc, bomb) => acc | (1 << bomb), 0);

        const antiMinusProb = await this.repositories.settings.getSettingAsNumber('mines::antiMinus');
        const antiMinusSteps = await this.repositories.settings.getSettingAsNumber('mines::antiMinusSteps');

        const antiMinusInUse = Math.random() < antiMinusProb;
        const forcedBombStep = antiMinusInUse ? Math.floor(Math.random() * antiMinusSteps) : null;

        return this.db.MinesGame.create({
            userId,
            betAmount,
            bombsCount,
            fieldConf,
            forcedBombStep,
            clientSeed,
            serverSeed,
            nonce,
        });
    }

    async endGame(userId: string): Promise<MinesGame> {
        const minTurnoverCoef = await this.repositories.settings.getSettingAsNumber('referrals::minTurnoverCoef');

        return this.db.sequelize.transaction(async transaction => {
            const currentGame = await this.repositories.minesGames.getCurrentGame(userId, transaction);

            if (!currentGame) {
                throw new UserError('NO_ACTIVE_MINES_GAME');
            }

            const bombReached = (currentGame.fieldConf & currentGame.stepsConf) !== 0;

            if (bombReached) {
                throw new UserError('BOMB_REACHED_EARLIER_MINES_GAME');
            }

            const madeStepsCount = countOnes(currentGame.stepsConf);
            const coef = getMinesCoef(currentGame.bombsCount, madeStepsCount);

            // Increase turnover
            if (coef >= minTurnoverCoef) {
                await this.repositories.users.increaseTurnover(userId, currentGame.betAmount, transaction);
            }

            await this.repositories.users.giveMoney(userId, currentGame.betAmount * coef, transaction);

            await currentGame.update(
                { status: MinesGameStatus.Ended, coefficient: coef, forcedBombStep: null },
                { transaction },
            );

            await addMinesGame(currentGame);
            return currentGame;
        });
    }

    async makeStep(userId: string, cell: number): Promise<MinesGame> {
        const stepMask = 1 << cell;

        const minesGame: MinesGame = await this.db.sequelize.transaction(async transaction => {
            const game = await this.repositories.minesGames.getCurrentGame(userId, transaction);

            if (!game) {
                throw new UserError('NO_ACTIVE_MINES_GAME');
            }

            if ((game.stepsConf & stepMask) !== 0) {
                throw new UserError('CELL_ALREADY_STEPPED');
            }

            const newStepsConf = game.stepsConf | stepMask;
            const bombReached = (game.fieldConf & newStepsConf) !== 0;

            // AntiMinus activated ONLY if player didn't loose on specified step
            const antiMinusReached = !bombReached && game.forcedBombStep === countOnes(game.stepsConf);
            const newFieldConf = antiMinusReached
                ? MinesGamesRepository.applyAntiMinus(stepMask, game.fieldConf)
                : game.fieldConf;

            await game.update(
                {
                    fieldConf: newFieldConf,
                    stepsConf: newStepsConf,
                    status: bombReached || antiMinusReached ? MinesGameStatus.Ended : MinesGameStatus.InGame,
                    forcedBombStep: bombReached ? null : game.forcedBombStep,
                    coefficient: bombReached || antiMinusReached ? 0 : null,
                },
                { transaction },
            );

            if (game.status === MinesGameStatus.Ended) {
                await addMinesGame(game);
            }

            return game;
        });

        if (minesGame.status === MinesGameStatus.InGame) {
            const madeStepsCount = countOnes(minesGame.stepsConf);
            const coef = getMinesCoef(minesGame.bombsCount, madeStepsCount);
            const profit = minesGame.betAmount * coef;

            const maxProfit = await this.repositories.settings.getSettingAsNumber('mines::maxProfitAmount');

            if (madeStepsCount === FIELD_SIZE - minesGame.bombsCount || profit >= maxProfit) {
                return this.endGame(minesGame.userId);
            }
        }

        // Increase turnover if game is ended
        if (minesGame.status === MinesGameStatus.Ended) {
            const madeStepsCount = countOnes(minesGame.stepsConf);
            const coef = getMinesCoef(minesGame.bombsCount, madeStepsCount);

            const minTurnoverCoef = await this.repositories.settings.getSettingAsNumber('referrals::minTurnoverCoef');
            if (coef >= minTurnoverCoef) {
                await this.repositories.users.increaseTurnover(minesGame.userId, minesGame.betAmount);
            }
        }

        return minesGame;
    }

    async getLastGames(limit: number = 10): Promise<MinesGame[]> {
        return this.db.MinesGame.findAll({
            where: { status: MinesGameStatus.Ended },
            include: [this.db.MinesGame.User],
            order: [['id', 'DESC']],
            limit,
        });
    }

    private static applyAntiMinus(stepMask: number, fieldConf: number): number {
        if ((fieldConf & stepMask) !== 0) {
            console.warn('[Anti-Minus]', 'Tried to apply anti-minus when player already loose');
            return fieldConf;
        }

        const bombMasks = range(0, FIELD_SIZE)
            .map(cell => 1 << cell)
            .filter(cellMask => (fieldConf & cellMask) !== 0);

        const randomBombMask = bombMasks[Math.floor(Math.random() * bombMasks.length)];

        return fieldConf ^ randomBombMask ^ stepMask;
    }
}

export default MinesGamesRepository;
