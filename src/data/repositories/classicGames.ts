import BaseRepository from './base';
import { ClassicGame, ClassicGameState, HistoryClassicGame } from '../models/ClassicGame';
import { UserError } from '../../utils/errors';

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

    async createGame(randomNumber: string, hash: string): Promise<ClassicGame> {
        return this.db.ClassicGame.create({ randomNumber, hash });
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

        return game.update({
            state: ClassicGameState.Ended,
            winnerId,
            winnerTicket,
            winnerBetsPrice,
            winnerChance,
            finishedAt,
        });
    }

    async getHistory(): Promise<HistoryClassicGame[]> {
        return this.db.ClassicGame.findAll({
            where: { state: ClassicGameState.Ended },
            include: [this.db.ClassicGame.Winner],
            order: [['id', 'DESC']],
            limit: 10,
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
}

export default ClassicGamesRepository;
