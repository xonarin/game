import BaseRepository from './base';
import { ClassicGame, ClassicGameState, HistoryClassicGame } from '../models/ClassicGame';
import { UserError } from '../../utils/errors';
import { addClassicGame } from '../../services/LiveData/LiveDataStorage';

class ClassicGamesRepository extends BaseRepository {
    async getGameById(gameId: string): Promise<ClassicGame | null> {
        return this.db.ClassicGame.findByPk(gameId, {
            ...this.sequelizeContext,
            rejectOnEmpty: false,
        });
    }

    async getGameByIdStrict(gameId: string): Promise<ClassicGame> {
        const game = await this.getGameById(gameId);

        if (!game) {
            throw new UserError('NO_GAME');
        }

        return game;
    }

    async createGame(randomNumber: string, hash: string, commission: number): Promise<ClassicGame> {
        return this.db.ClassicGame.create({ randomNumber, hash, commission });
    }

    async updateState(gameId: string, state: ClassicGameState): Promise<ClassicGame> {
        const game = await this.getGameByIdStrict(gameId);

        return game.update({ state });
    }

    async updateFund(gameId: string, fund: number): Promise<ClassicGame> {
        const game = await this.getGameByIdStrict(gameId);

        return game.update({ fund });
    }

    async endGame(
        gameId: string,
        winnerId: string,
        winnerTicket: number,
        winnerBetsPrice: number,
        winnerChance: number,
        finishedAt: Date,
    ): Promise<ClassicGame> {
        const game = await this.getGameByIdStrict(gameId);
        await game.update({
            state: ClassicGameState.Ended,
            winnerId,
            winnerTicket,
            winnerBetsPrice,
            winnerChance,
            finishedAt,
        });

        await addClassicGame(game);

        return game;
    }

    async getHistory(): Promise<HistoryClassicGame[]> {
        return this.db.ClassicGame.findAll({
            where: { state: ClassicGameState.Ended },
            include: [this.db.ClassicGame.Winner],
            order: [['id', 'DESC']],
            limit: 6,
        });
    }

    async getLastGame(): Promise<ClassicGame | null> {
        const gameToBet = this.db.ClassicGame.Bet;

        return this.db.ClassicGame.findOne({
            include: [
                {
                    association: gameToBet,
                    include: [this.db.ClassicGameBet.User],
                },
            ],
            order: [
                ['id', 'DESC'],
                [{ model: gameToBet.target, as: gameToBet.as }, 'id', 'DESC'],
            ],
        });
    }

    async getLastGames(limit: number = 6): Promise<ClassicGame[]> {
        return this.db.ClassicGame.findAll({
            where: { state: ClassicGameState.Ended },
            include: [this.db.ClassicGame.Winner],
            order: [['id', 'DESC']],
            limit,
        });
    }
}

export default ClassicGamesRepository;
