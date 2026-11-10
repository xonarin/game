import BaseRepository from './base';
import { ClassicGameBet } from '../models/ClassicGameBet';

class ClassicGameBetsRepository extends BaseRepository {
    async createBet(
        gameId: string,
        userId: string,
        amount: number,
        firstTicket: number,
        lastTicket: number,
    ): Promise<ClassicGameBet> {
        return this.db.ClassicGameBet.create({
            gameId,
            userId,
            amount,
            firstTicket,
            lastTicket,
        });
    }
}

export default ClassicGameBetsRepository;
