import { InMemoryCache } from '@apollo/client';

const createCache = () => new InMemoryCache();

export default createCache;
