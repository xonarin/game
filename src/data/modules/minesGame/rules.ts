import { inputRule } from 'graphql-shield';

import { FIELD_SIZE, MIN_BOMBS_COUNT } from '../../../utils/mines';

export const checkStartMinesGameArgs = inputRule()(yup =>
    yup.object({
        input: yup.object({
            betAmount: yup
                .number()
                .required('INVALID_BET_AMOUNT_REQUIRED')
                .moreThan(0.99, 'INVALID_BET_AMOUNT_MORE_THAN'),
            bombsCount: yup
                .number()
                .required('INVALID_BOMBS_COUNT_REQUIRED')
                .integer('INVALID_BOMBS_COUNT_INTEGER')
                .min(MIN_BOMBS_COUNT, 'INVALID_BOMBS_COUNT_MIN')
                .max(FIELD_SIZE - 1, 'INVALID_BOMBS_COUNT_MAX'),
        }),
    }),
);

export const checkMakeMinesGameStepArgs = inputRule()(yup =>
    yup.object({
        cell: yup
            .number()
            .required('INVALID_CELL_REQUIRED')
            .integer('INVALID_CELL_INTEGER')
            .min(0, 'INVALID_CELL_MIN')
            .max(FIELD_SIZE - 1, 'INVALID_CELL_MAX'),
    }),
);
