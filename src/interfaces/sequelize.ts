import { Model } from 'sequelize';
import { EXPECTED_OPTIONS_KEY } from 'dataloader-sequelize';

import { KeysByType } from './common';

export type SerializedModel<TModel extends Model> = Omit<TModel, keyof Model | KeysByType<TModel, Function>>;

export type SequelizeContext = {
    [EXPECTED_OPTIONS_KEY]: unknown;
};
