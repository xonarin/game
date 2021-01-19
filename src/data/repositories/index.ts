import { Database } from '../models';
import { SequelizeContext } from '../../interfaces/sequelize';
import SettingsRepository from './settings';
import UsersRepository from './users';
import ReferralIncomesRepository from './referralIncomes';
import ChatsRepository from './chats';
import MessagesRepository from './messages';
import ClassicGamesRepository from './classicGames';
import ClassicGameBetsRepository from './classicGameBets';
import MinesGamesRepository from './minesGames';
import TournamentsRepository from './tournaments';
import PaymentsRepository from './payments';
import BonusRepository from './bonus';

export interface Repositories {
    settings: SettingsRepository;
    users: UsersRepository;
    referralIncomes: ReferralIncomesRepository;
    chats: ChatsRepository;
    messages: MessagesRepository;
    classicGames: ClassicGamesRepository;
    classicGameBets: ClassicGameBetsRepository;
    minesGames: MinesGamesRepository;
    tournaments: TournamentsRepository;
    payments: PaymentsRepository;
    bonus: BonusRepository;
}

const initRepositories = (db: Database, sequelizeContext?: SequelizeContext): Repositories => {
    const repositories = {} as Repositories;

    repositories.settings = new SettingsRepository(db, repositories, sequelizeContext);
    repositories.users = new UsersRepository(db, repositories, sequelizeContext);
    repositories.referralIncomes = new ReferralIncomesRepository(db, repositories, sequelizeContext);
    repositories.chats = new ChatsRepository(db, repositories, sequelizeContext);
    repositories.messages = new MessagesRepository(db, repositories, sequelizeContext);
    repositories.classicGames = new ClassicGamesRepository(db, repositories, sequelizeContext);
    repositories.classicGameBets = new ClassicGameBetsRepository(db, repositories, sequelizeContext);
    repositories.minesGames = new MinesGamesRepository(db, repositories, sequelizeContext);
    repositories.tournaments = new TournamentsRepository(db, repositories, sequelizeContext);
    repositories.payments = new PaymentsRepository(db, repositories, sequelizeContext);
    repositories.bonus = new BonusRepository(db, repositories, sequelizeContext);

    return repositories;
};

export default initRepositories;
