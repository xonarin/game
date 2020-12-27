import { Sequelize } from 'sequelize';

import { initDatabase } from './models';
import initRepositories from './repositories';
import config from '../config';

const sequelize = new Sequelize(config.databaseUrl, {
    define: {
        freezeTableName: true,
    },
    logging: false,
});

export const database = initDatabase(sequelize);
export const repositories = initRepositories(database);
