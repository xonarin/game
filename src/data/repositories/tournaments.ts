import { col, fn, Op } from 'sequelize';
import { ValuesType } from 'utility-types';

import BaseRepository from './base';
import { Tournament, TournamentType } from '../models/Tournament';
import { RefTournamentType } from '../../__generated__/graphql';
import { User } from '../models/User';

class TournamentsRepository extends BaseRepository {
    createTournament = (type: TournamentType, start: Date, finish: Date): Promise<Tournament> =>
        this.db.Tournament.create({
            type,
            start,
            finish,
            isFinished: false,
        });

    getActiveTournament = async (type: RefTournamentType): Promise<Tournament | null> =>
        this.db.Tournament.findOne({
            where: {
                type,
                isFinished: false,
            },
            limit: 1,
            order: [['id', 'DESC']],
        });

    getLastTournament = async (type: RefTournamentType): Promise<Tournament | null> =>
        this.db.Tournament.findOne({
            where: {
                type,
            },
            order: [['id', 'DESC']],
            limit: 1,
        });

    getLeaders = async (
        tournament: Tournament,
    ): Promise<{ userId: string; amount: number; username: string; avatar: string }[]> => {
        const results: Record<string, number> = {};

        switch (tournament.type) {
            case TournamentType.Monthly:
            case TournamentType.Activity: {
                const minesGames = await this.db.MinesGame.findAll({
                    attributes: ['userId', [fn('SUM', col('betAmount')), 'sum']],
                    where: {
                        createdAt: { [Op.between]: [tournament.start, tournament.finish] },
                    },
                    group: [col('userId')],
                    raw: true,
                });

                (minesGames as unknown as { userId: number; sum: number }[]).forEach(game => {
                    const key = game.userId.toString();

                    if (!results[key]) {
                        results[key] = 0;
                    }
                    results[key] += game.sum;
                });

                const classicGames = await this.db.ClassicGameBet.findAll({
                    attributes: ['userId', [fn('SUM', col('amount')), 'sum']],
                    where: {
                        createdAt: { [Op.between]: [tournament.start, tournament.finish] },
                    },
                    group: [col('userId')],
                    raw: true,
                });

                (classicGames as unknown as { userId: number; sum: number }[]).forEach(game => {
                    const key = game.userId.toString();

                    if (!results[key]) {
                        results[key] = 0;
                    }
                    results[key] += game.sum;
                });
                break;
            }
            case TournamentType.Referrals: {
                const referrals = await this.db.User.findAll({
                    attributes: [
                        ['refId', 'userId'],
                        [fn('COUNT', col('id')), 'sum'],
                    ],
                    where: {
                        refId: { [Op.ne]: null },
                        createdAt: { [Op.between]: [tournament.start, tournament.finish] },
                    },
                    group: ['userId'],
                    raw: true,
                });

                (referrals as unknown as { userId: number; sum: number }[]).forEach(game => {
                    const key = game.userId.toString();

                    if (!results[key]) {
                        results[key] = 0;
                    }
                    results[key] += game.sum;
                });
                break;
            }

            default:
        }

        const users: Pick<User, 'id' | 'username' | 'avatar'>[] = await this.db.User.findAll({
            attributes: ['id', 'username', 'avatar'],
            where: {
                id: { [Op.in]: Object.keys(results) },
            },
            raw: true,
        });

        const usersObject: Record<string, ValuesType<typeof users>> = {};
        users.forEach(user => {
            usersObject[user.id] = user;
        });

        return Object.entries(results)
            .map(([userId, amount]) => ({
                userId,
                amount,
                username: usersObject[userId].username,
                avatar: usersObject[userId].avatar,
            }))
            .sort((a, b) => b.amount - a.amount);
    };
}

export default TournamentsRepository;
