import { useCallback } from 'react';
import { FetchResult } from '@apollo/client';

import {
    MakeMinesGameStepDocument,
    MakeMinesGameStepMutation,
    MakeMinesGameStepMutationVariables,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';

export interface UseMakeMinesGameStepMutationResult {
    (cell: number): Promise<FetchResult<MakeMinesGameStepMutation> | undefined>;
}

const useMakeMinesGameStepMutation = (): UseMakeMinesGameStepMutationResult => {
    const [makeMinesGameStep] = useMutationWithNotify<MakeMinesGameStepMutation, MakeMinesGameStepMutationVariables>(
        MakeMinesGameStepDocument,
        {
            update: (cache, { data: mutationData }) => {
                if (!mutationData) return;

                cache.modify({
                    id: 'ROOT_QUERY',
                    fields: {
                        activeMinesGame: (_0, { toReference }) => toReference(mutationData.makeMinesGameStep),
                    },
                });
            },
        },
    );

    return useCallback(cell => makeMinesGameStep({ variables: { cell } }), [makeMinesGameStep]);
};

export default useMakeMinesGameStepMutation;
