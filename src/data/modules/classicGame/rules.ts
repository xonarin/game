import { inputRule } from 'graphql-shield';

export const checkPlaceClassicGameBetArgs = inputRule()(yup =>
    yup.object({
        input: yup.object({
            amount: yup
                .number()
                .required('INVALID_AMOUNT_REQUIRED')
                .moreThan(0, 'INVALID_AMOUNT_MORE_THAN'),
        }),
    }),
);

export default { checkPlaceClassicGameBetArgs };
