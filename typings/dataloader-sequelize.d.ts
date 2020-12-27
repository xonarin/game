declare module 'dataloader-sequelize' {
    import { FindOptions, Sequelize } from 'sequelize';

    export interface CreateContextOptions extends FindOptions {
        max?: number;
    }

    export const EXPECTED_OPTIONS_KEY: 'dataloader_sequelize_context';

    export function createContext(sequelize: Sequelize, options?: FindOptions): unknown;
}
