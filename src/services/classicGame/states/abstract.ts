import { ClassicGameBet, ClassicGameClientSnapshot, ClassicGameService } from '../classicGame';
import { User } from '../../../data/models/User';

abstract class ClassicGameState {
    protected game: ClassicGameService;

    constructor(game: ClassicGameService) {
        this.game = game;
    }

    public abstract enter(): Promise<void>;

    // eslint-disable-next-line class-methods-use-this,no-empty-function
    public async exit(): Promise<void> {}

    public abstract async placeBet(user: User, amount: number): Promise<ClassicGameBet>;

    public abstract async clientSnapshot(): Promise<ClassicGameClientSnapshot>;
}

export default ClassicGameState;
