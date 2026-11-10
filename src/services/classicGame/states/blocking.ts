import ClassicGameState from './abstract';
import { ClassicGameBet, ClassicGameClientSnapshot } from '../classicGame';
import { UserError } from '../../../utils/errors';
import ClassicGameStateCulmination from './culmination';

class ClassicGameStateBlocking extends ClassicGameState {
    private timeoutTask?: NodeJS.Timeout;

    public async enter() {
        await this.game.betsLocker.waitAll();

        this.timeoutTask = setTimeout(async () => {
            await this.game.switchTo(new ClassicGameStateCulmination(this.game));
        }, 100);
    }

    public async exit() {
        if (this.timeoutTask) {
            clearTimeout(this.timeoutTask);
        }
    }

    // eslint-disable-next-line class-methods-use-this
    public async placeBet(): Promise<ClassicGameBet> {
        throw new UserError('CLASSIC_GAME_IN_PROGRESS_ERROR');
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

export default ClassicGameStateBlocking;
