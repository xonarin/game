import { FetchResult } from '@apollo/client';

import {
    EndMinesGameDocument,
    EndMinesGameMutation,
    EndMinesGameMutationVariables,
    MeDocument,
    MeQuery,
    MinesGameConfigurationDocument,
    MinesGameConfigurationQuery,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';
import { countOnes } from '../../../utils/number';

export interface UseEndMinesGameMutationResult {
    (): Promise<FetchResult<EndMinesGameMutation>>;
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

                const meData = cache.readQuery<MeQuery>({
                    query: MeDocument,
                });
                const minesGameConfigurationData = cache.readQuery<MinesGameConfigurationQuery>({
                    query: MinesGameConfigurationDocument,
                });
                if (!meData || !meData.me || !minesGameConfigurationData) return;

                const {
                    minesGameConfiguration: { minBombsCount, coefs },
                } = minesGameConfigurationData;

                const madeStepsCount = countOnes(game.stepsConf);
                const coef = coefs[game.bombsCount - minBombsCount][madeStepsCount - 1];

                cache.modify({
                    id: cache.identify(meData.me),
                    fields: {
                        money: money => {
                            return Number((money + game.betAmount * coef).toFixed(2));
                        },
                    },
                });
            },
        },
    );

    return endMinesGame;
};

export default useEndMinesGameMutation;
