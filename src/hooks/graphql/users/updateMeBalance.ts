import { ApolloCache } from '@apollo/client';

import { MeDocument, MeQuery } from '../../../__generated__/graphql';

const updateMeBalance = <T>(cache: ApolloCache<T>, diff: number) => {
    const meQuery = cache.readQuery<MeQuery>({ query: MeDocument });

    if (meQuery?.me?.money) {
        cache.writeQuery({
            query: MeDocument,
            data: {
                ...meQuery,
                me: { ...meQuery.me, money: Number((meQuery.me.money + diff).toFixed(2)) },
            },
        });
    }
};

export default updateMeBalance;
