import { FetchResult, useMutation } from '@apollo/client';

import { MakeDepositDocument, MakeDepositMutation } from '../../../__generated__/graphql';

export interface UseMakeDepositMutationResult {
    (amount: number, method: string): Promise<FetchResult<MakeDepositMutation>>;
}

const useMakeDepositMutation = (): UseMakeDepositMutationResult => {
    const [makeDeposit] = useMutation(MakeDepositDocument);

    return (amount, method) => makeDeposit({ variables: { amount, method } });
};

export default useMakeDepositMutation;
