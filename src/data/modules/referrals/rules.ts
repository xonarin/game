import { inputRule } from 'graphql-shield';

export const checkReferralsArgs = inputRule()(yup =>
    yup.object({
        offset: yup
            .number()
            .integer('INVALID_OFFSET_INTEGER')
            .min(0, 'INVALID_OFFSET_MIN'),
    }),
);

export default { checkReferralsArgs };
