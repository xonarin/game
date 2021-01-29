import { useCallback } from 'react';
import { FetchResult } from '@apollo/client';

import {
    StartMinesGameDocument,
    StartMinesGameInput,
    StartMinesGameMutation,
    StartMinesGameMutationVariables,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';

export interface UseStartMinesGameMutationResult {
    (input: StartMinesGameInput): Promise<FetchResult<StartMinesGameMutation> | undefined>;
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
            },
        },
    );

    return useCallback(input => startMinesGame({ variables: { input } }), [startMinesGame]);
};

export default useStartMinesGameMutation;
