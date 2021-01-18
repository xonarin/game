import { FetchResult } from '@apollo/client';

import {
    PlaceClassicGameBetDocument,
    PlaceClassicGameBetInput,
    PlaceClassicGameBetMutation,
    PlaceClassicGameBetMutationVariables,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';

export interface UsePlaceClassicGameBetMutationResult {
    (input: PlaceClassicGameBetInput): Promise<FetchResult<PlaceClassicGameBetMutation>>;
}

const usePlaceClassicGameBetMutation = (): UsePlaceClassicGameBetMutationResult => {
    const [placeClassicGameBet] = useMutationWithNotify<
        PlaceClassicGameBetMutation,
        PlaceClassicGameBetMutationVariables
    >(PlaceClassicGameBetDocument);

    return input => placeClassicGameBet({ variables: { input } });
};

export default usePlaceClassicGameBetMutation;
