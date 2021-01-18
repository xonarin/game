import { FetchResult, useMutation } from '@apollo/client';

import {
    CancelWithdrawDocument,
    CancelWithdrawMutation,
    MutationCancelWithdrawArgs,
} from '../../../__generated__/graphql';

export interface UseCancelWithdrawMutationResult {
    (id: string): Promise<FetchResult<CancelWithdrawMutation>>;
}

const useCancelWithdrawMutation = (): UseCancelWithdrawMutationResult => {
    const [cancelWithdraw] = useMutation<CancelWithdrawMutation, MutationCancelWithdrawArgs>(CancelWithdrawDocument);

    return id => cancelWithdraw({ variables: { id } });
};

export default useCancelWithdrawMutation;
