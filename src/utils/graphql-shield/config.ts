import { IOptionsConstructor } from 'graphql-shield/dist/types';

import { fallbackError } from '../errors';

const shieldConfig: IOptionsConstructor = {
    allowExternalErrors: false,
    debug: false,
    fallbackError,
};

export default shieldConfig;
