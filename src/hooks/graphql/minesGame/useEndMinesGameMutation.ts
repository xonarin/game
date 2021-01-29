import { FetchResult } from '@apollo/client';

import {
    EndMinesGameDocument,
    EndMinesGameMutation,
    EndMinesGameMutationVariables,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';

export interface UseEndMinesGameMutationResult {
    (): Promise<FetchResult<EndMinesGameMutation> | undefined>;
}

const useEndMinesGameMutation = (): UseEndMinesGameMutationResult => {
    const [endMinesGame] = useMutationWithNotify<EndMinesGameMutation, EndMinesGameMutationVariables>(
        EndMinesGameDocument,
        {
            update: (cache, { data: mutationData }) => {
                if (!mutationData) return;

                const { endMinesGame: game } = mutationData;

                cache.modify({
                    id: 'ROOT_QUERY',
                    fields: {
                        activeMinesGame: (_0, { toReference }) => toReference(game),
                    },
                });
            },
        },
    );

    return endMinesGame;
};

export default useEndMinesGameMutation;
