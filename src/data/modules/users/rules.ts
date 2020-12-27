import { inputRule } from 'graphql-shield';

export const checkUpdateClientSeedArgs = inputRule()(yup =>
    yup.object({
        clientSeed: yup
            .string()
            .required('INVALID_CLIENT_SEED_REQUIRED')
            .min(1, 'INVALID_CLIENT_SEED_MIN')
            .max(255, 'INVALID_CLIENT_SEED_MAX'),
    }),
);

export default { checkUpdateClientSeedArgs };
