import { Database } from '../models';
import { Repositories } from './index';
import { SequelizeContext } from '../../interfaces/sequelize';

class BaseRepository {
    protected db: Database;
    protected repositories: Repositories;
    protected sequelizeContext?: SequelizeContext;

    constructor(db: Database, repositories: Repositories, sequelizeContext?: SequelizeContext) {
        this.db = db;
        this.repositories = repositories;
        this.sequelizeContext = sequelizeContext;
    }
}

export default BaseRepository;
