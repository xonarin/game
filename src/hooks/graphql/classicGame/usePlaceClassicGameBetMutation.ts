import { FetchResult } from '@apollo/client';

import {
    PlaceClassicGameBetDocument,
    PlaceClassicGameBetInput,
    PlaceClassicGameBetMutation,
    PlaceClassicGameBetMutationVariables,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';
import updateMeBalance from '../users/updateMeBalance';

export interface UsePlaceClassicGameBetMutationResult {
    (input: PlaceClassicGameBetInput): Promise<FetchResult<PlaceClassicGameBetMutation>>;
}

const usePlaceClassicGameBetMutation = (): UsePlaceClassicGameBetMutationResult => {
    const [placeClassicGameBet] = useMutationWithNotify<
        PlaceClassicGameBetMutation,
        PlaceClassicGameBetMutationVariables
    >(PlaceClassicGameBetDocument, {
        update: (cache, { data: mutationData }) => {
            if (!mutationData) return;

            const {
                placeClassicGameBet: { amount },
            } = mutationData;

            updateMeBalance(cache, -amount);
        },
    });

    return input => placeClassicGameBet({ variables: { input } });
};

export default usePlaceClassicGameBetMutation;
