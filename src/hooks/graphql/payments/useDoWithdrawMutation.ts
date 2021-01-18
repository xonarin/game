import { FetchResult, Reference, useMutation } from '@apollo/client';

import { DoWithdrawDocument, DoWithdrawMutation, MutationDoWithdrawArgs } from '../../../__generated__/graphql';

export interface UseDoWithdrawMutationResult {
    (amount: number, method: string, purse: string): Promise<FetchResult<DoWithdrawMutation>>;
}

const useDoWithdrawMutation = (): UseDoWithdrawMutationResult => {
    const [doWithdraw] = useMutation<DoWithdrawMutation, MutationDoWithdrawArgs>(DoWithdrawDocument);

    return (amount, method, purse) => doWithdraw({ variables: { amount, method, purse } });
};

export default useDoWithdrawMutation;
