import { FetchResult } from '@apollo/client';

import {
    MeDocument,
    MeQuery,
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
    >(PlaceClassicGameBetDocument, {
        update: (proxy, { data: mutationData }) => {
            if (!mutationData) return;

            const { placeClassicGameBet: placedBet } = mutationData;
            const data = proxy.readQuery<MeQuery>({ query: MeDocument });

            if (data?.me?.money) {
                proxy.writeQuery({
                    query: MeDocument,
                    data: { ...data, me: { ...data.me, money: Number((data.me.money - placedBet.amount).toFixed(2)) } },
                });
            }
        },
    });

    return input => placeClassicGameBet({ variables: { input } });
};

export default usePlaceClassicGameBetMutation;
