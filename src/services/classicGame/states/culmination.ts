import ClassicGameState from './abstract';
import { ClassicGameBet, ClassicGameClientSnapshot } from '../classicGame';
import { UserError } from '../../../utils/errors';
import { repositories } from '../../../data/database';
import { ClassicGameState as ClassicGameStateEnum } from '../../../data/models/ClassicGame';
import pubsub from '../../../data/pubsub';
import ClassicGameStateEnded from './ended';

class ClassicGameStateCulmination extends ClassicGameState {
    private timerTask?: NodeJS.Timeout;
    private endTimestamp: number = 0;

    public async enter() {
        // Определение победителя
        const winnerTicket = Math.floor(this.game.currentLastTicket * this.game.randomNumber) + 1;
        this.game.bets.some(bet => {
            if (bet.firstTicket <= winnerTicket && winnerTicket <= bet.lastTicket) {
                this.game.winnerId = bet.userId;
                return true;
            }
            return false;
        });

        if (this.game.winnerId === null) {
            throw new Error(`Winner is not defined in game #${this.game.gameId} on culmination state`);
        }

        const winner = this.game.players.get(this.game.winnerId);
        if (!winner) {
            throw new Error(`Winner is not exists in players map in game #${this.game.gameId}`);
        }

        this.game.winnerTicket = winnerTicket;
        this.game.winnerBetsPrice = winner.betsPrice;
        this.game.winnerChance = winner.chance;
        this.game.culminationDegree =
            this.game.turnsCount * 360 + winner.startDegree + Math.random() * (winner.endDegree - winner.startDegree);

        this.game.timer = this.game.culminationTimer + this.game.endedTimer;
        this.game.maxTimer = this.game.culminationTimer + this.game.endedTimer;
        this.endTimestamp = Date.now() + this.game.culminationTimer * 1000;
        await this.game.updateTimer('Culmination', this.game.timer);
        this.timerTask = setInterval(() => {
            this.game.updateTimer('Culmination', this.game.timer - 1);
            if (this.game.timer === this.game.endedTimer) {
                this.game.switchTo(new ClassicGameStateEnded(this.game));
            }
        }, 1000);

        if (!this.game.isRestoring) {
            const now = Date.now();

            await repositories.classicGames.updateState(this.game.gameId, ClassicGameStateEnum.Culmination);
            await pubsub.publish('switchedToClassicGameStateCulmination', {
                culminationDegree: this.game.culminationDegree,
                remainingCulminationDuration: this.endTimestamp - now,
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
        throw new UserError('CLASSIC_GAME_IN_PROGRESS_ERROR');
    }

    public async clientSnapshot(): Promise<ClassicGameClientSnapshot> {
        const now = Date.now();

        return {
            minBetAmount: this.game.minBetAmount,
            gameId: this.game.gameId,
            commission: this.game.commissionPercent,
            state: 'Culmination',
            hash: this.game.hash,
            fund: Number(this.game.fund.toFixed(2)),
            timer: this.game.timer,
            maxTimer: this.game.maxTimer,
            bets: this.game.bets,
            players: this.game.playersList,
            culminationDegree: this.game.culminationDegree,
            remainingCulminationDuration: this.endTimestamp - now,
        };
    }
}

export default ClassicGameStateCulmination;
