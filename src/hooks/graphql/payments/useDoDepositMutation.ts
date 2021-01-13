import { FetchResult, useMutation } from '@apollo/client';

import { DoDepositDocument, DoDepositMutation } from '../../../__generated__/graphql';

export interface UseDoDepositMutationResult {
    (amount: number, method: string): Promise<FetchResult<DoDepositMutation>>;
}

const useDoDepositMutation = (): UseDoDepositMutationResult => {
    const [doDeposit] = useMutation(DoDepositDocument);

    return (amount, method) => doDeposit({ variables: { amount, method } });
};

export default useDoDepositMutation;
