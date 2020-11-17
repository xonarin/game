import { InMemoryCache } from '@apollo/client';

const createCache = () => {
    return new InMemoryCache();
};

export default createCache;
