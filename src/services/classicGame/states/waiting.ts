import ClassicGameState from './abstract';
import { ClassicGameBet, ClassicGameClientSnapshot } from '../classicGame';
import { User } from '../../../data/models/User';
import pubsub from '../../../data/pubsub';
import ClassicGameStateCountdown from './countdown';

class ClassicGameStateWaiting extends ClassicGameState {
    public async enter() {
        this.game.timer = this.game.countdownTimer;
        this.game.maxTimer = this.game.countdownTimer;

        if (!this.game.isRestoring) {
            await pubsub.publish('startedClassicGame', await this.clientSnapshot());
        }
    }

    public async placeBet(user: User, amount: number): Promise<ClassicGameBet> {
        const bet = await this.game.placeBet0(user, amount);

        if (this.game.players.size >= this.game.minPlayersToStartCountdown) {
            await this.game.switchTo(new ClassicGameStateCountdown(this.game));
        }

        return bet;
    }

    public async clientSnapshot(): Promise<ClassicGameClientSnapshot> {
        return {
            minBetAmount: this.game.minBetAmount,
            gameId: this.game.gameId,
            commission: this.game.commissionPercent,
            state: 'Waiting',
            hash: this.game.hash,
            fund: Number(this.game.fund.toFixed(2)),
            timer: this.game.timer,
            maxTimer: this.game.maxTimer,
            bets: this.game.bets,
            players: this.game.playersList,
        };
    }
}

export default ClassicGameStateWaiting;
