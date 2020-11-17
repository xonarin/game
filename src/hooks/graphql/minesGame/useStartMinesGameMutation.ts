import { useCallback } from 'react';
import { FetchResult } from '@apollo/client';

import {
    MeDocument,
    MeQuery,
    StartMinesGameDocument,
    StartMinesGameInput,
    StartMinesGameMutation,
    StartMinesGameMutationVariables,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';

export interface UseStartMinesGameMutationResult {
    (input: StartMinesGameInput): Promise<FetchResult<StartMinesGameMutation>>;
}

const useStartMinesGameMutation = (): UseStartMinesGameMutationResult => {
    const [startMinesGame] = useMutationWithNotify<StartMinesGameMutation, StartMinesGameMutationVariables>(
        StartMinesGameDocument,
        {
            update: (cache, { data }) => {
                if (!data) return;

                cache.modify({
                    id: 'ROOT_QUERY',
                    fields: {
                        activeMinesGame: (_0, { toReference }) => toReference(data.startMinesGame),
                    },
                });

                const meData = cache.readQuery<MeQuery>({
                    query: MeDocument,
                });
                if (!meData || !meData.me) return;

                cache.modify({
                    id: cache.identify(meData.me),
                    fields: {
                        money: money => {
                            return Number((money - data.startMinesGame.betAmount).toFixed(2));
                        },
                    },
                });
            },
        },
    );

    return useCallback(input => startMinesGame({ variables: { input } }), [startMinesGame]);
};

export default useStartMinesGameMutation;
