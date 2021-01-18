import ClassicGameState from './abstract';
import { ClassicGameBet, ClassicGameClientSnapshot } from '../classicGame';
import { repositories } from '../../../data/database';
import { ClassicGameState as ClassicGameStateEnum } from '../../../data/models/ClassicGame';
import { User } from '../../../data/models/User';
import ClassicGameStateBlocking from './blocking';

class ClassicGameStateCountdown extends ClassicGameState {
    private timerTask?: NodeJS.Timeout;

    public async enter() {
        this.game.timer = this.game.countdownTimer;
        this.game.maxTimer = this.game.countdownTimer;
        this.timerTask = setInterval(() => {
            this.game.updateTimer('Countdown', this.game.timer - 1);
            if (this.game.timer === 0) {
                this.game.switchTo(new ClassicGameStateBlocking(this.game));
            }
        }, 1000);

        if (!this.game.isRestoring) {
            await repositories.classicGames.updateState(this.game.gameId, ClassicGameStateEnum.Countdown);
        }
    }

    public async exit() {
        if (this.timerTask) {
            clearInterval(this.timerTask);
        }
    }

    public async placeBet(user: User, amount: number): Promise<ClassicGameBet> {
        return this.game.placeBet0(user, amount);
    }

    public async clientSnapshot(): Promise<ClassicGameClientSnapshot> {
        return {
            minBetAmount: this.game.minBetAmount,
            gameId: this.game.gameId,
            commission: this.game.commissionPercent,
            state: 'Countdown',
            hash: this.game.hash,
            fund: Number(this.game.fund.toFixed(2)),
            timer: this.game.timer,
            maxTimer: this.game.maxTimer,
            bets: this.game.bets,
            players: this.game.playersList,
        };
    }
}

export default ClassicGameStateCountdown;
