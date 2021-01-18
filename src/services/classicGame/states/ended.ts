import ClassicGameState from './abstract';
import { ClassicGameBet, ClassicGameClientSnapshot } from '../classicGame';
import { UserError } from '../../../utils/errors';
import { repositories } from '../../../data/database';
import pubsub from '../../../data/pubsub';

class ClassicGameStateEnded extends ClassicGameState {
    private timerTask?: NodeJS.Timeout;
    private winnerUsername?: string;
    private winnerAvatar?: string;

    public async enter() {
        const { winnerId, winnerTicket, winnerBetsPrice, winnerChance } = this.game;

        if (winnerId === null || winnerTicket === null || winnerBetsPrice === null || winnerChance === null) {
            throw new Error(`Winner is not defined in game #${this.game.gameId} on ended state`);
        }

        const winner = this.game.players.get(winnerId);
        if (!winner) {
            throw new Error(`Winner is not exists in players map in game #${this.game.gameId} on ended state`);
        }
        this.winnerUsername = winner.username;
        this.winnerAvatar = winner.avatar;

        this.game.finishedAt = new Date();

        this.game.timer = this.game.endedTimer;
        this.game.maxTimer = this.game.culminationTimer + this.game.endedTimer;
        this.timerTask = setInterval(() => {
            this.game.updateTimer('Ended', this.game.timer - 1);
            if (this.game.timer === 0) {
                this.game.resurrect();
            }
        }, 1000);

        const wonFund = this.game.fund.minus(this.game.fund.times(this.game.commissionPercent).div(100));
        await repositories.users.giveMoney(winnerId, Number(wonFund.toFixed(2)));

        if (!this.game.isRestoring) {
            await repositories.classicGames.endGame(
                this.game.gameId,
                winnerId,
                winnerTicket,
                Number(winnerBetsPrice.toFixed(2)),
                winnerChance,
                this.game.finishedAt,
            );
            await pubsub.publish('switchedToClassicGameStateEnded', {
                id: this.game.gameId,
                commission: this.game.commissionPercent,
                randomNumber: this.game.randomNumber.toFixed(18),
                fund: Number(this.game.fund.toFixed(2)),
                winnerId,
                winnerUsername: winner.username,
                winnerAvatar: winner.avatar,
                winnerTicket,
                winnerBetsPrice: Number(winnerBetsPrice.toFixed(2)),
                winnerChance,
                finishedAt: this.game.finishedAt.toJSON(),
            });
        }
    }

    public async exit() {
        if (this.timerTask) {
            clearInterval(this.timerTask);
        }
    }

    // eslint-disable-next-line class-methods-use-this
    public async placeBet(): Promise<ClassicGameBet> {
        throw new UserError('CLASSIC_GAME_ENDED_ERROR');
    }

    public async clientSnapshot(): Promise<ClassicGameClientSnapshot> {
        return {
            minBetAmount: this.game.minBetAmount,
            gameId: this.game.gameId,
            commission: this.game.commissionPercent,
            state: 'Ended',
            randomNumber: this.game.randomNumber,
            hash: this.game.hash,
            fund: Number(this.game.fund.toFixed(2)),
            winnerId: this.game.winnerId ?? undefined,
            winnerUsername: this.winnerUsername,
            winnerAvatar: this.winnerAvatar,
            winnerTicket: this.game.winnerTicket ?? undefined,
            winnerChance: this.game.winnerChance ?? undefined,
            timer: this.game.timer,
            maxTimer: this.game.maxTimer,
            bets: this.game.bets,
            players: this.game.playersList,
            culminationDegree: this.game.culminationDegree,
        };
    }
}

export default ClassicGameStateEnded;
