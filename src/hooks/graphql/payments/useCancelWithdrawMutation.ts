import { FetchResult, useMutation } from '@apollo/client';

import {
    CancelWithdrawDocument,
    CancelWithdrawMutation,
    MutationCancelWithdrawArgs,
} from '../../../__generated__/graphql';
import updateMeBalance from '../users/updateMeBalance';

export interface UseCancelWithdrawMutationResult {
    (id: string): Promise<FetchResult<CancelWithdrawMutation>>;
}

const useCancelWithdrawMutation = (): UseCancelWithdrawMutationResult => {
    const [cancelWithdraw] = useMutation<CancelWithdrawMutation, MutationCancelWithdrawArgs>(CancelWithdrawDocument, {
        update: (cache, { data }) => {
            if (!data) {
                return;
            }

            const { cancelWithdraw: withdraw } = data;

            cache.modify({
                id: `Withdraw_${withdraw.id}`,
                fields: {
                    status: () => {
                        return withdraw.status;
                    },
                },
            });

            updateMeBalance(cache, withdraw.amount);
        },
    });

    return id => cancelWithdraw({ variables: { id } });
};

export default useCancelWithdrawMutation;
