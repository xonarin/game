import { shield } from 'graphql-shield';

import { fallbackError } from '../errors';

const shieldConfig: Parameters<typeof shield>[1] = {
    allowExternalErrors: false,
    debug: false,
    fallbackError,
};

export default shieldConfig;
