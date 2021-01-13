import { FetchResult, Reference, useMutation } from '@apollo/client';

import { DoWithdrawDocument, DoWithdrawMutation, MutationDoWithdrawArgs } from '../../../__generated__/graphql';

export interface UseDoWithdrawMutationResult {
    (amount: number, method: string, purse: string): Promise<FetchResult<DoWithdrawMutation>>;
}

const useDoWithdrawMutation = (): UseDoWithdrawMutationResult => {
    const [doWithdraw] = useMutation<DoWithdrawMutation, MutationDoWithdrawArgs>(DoWithdrawDocument, {
        update: (cache, { data }) => {
            if (!data) {
                return;
            }

            cache.modify({
                id: 'ROOT_QUERY',
                fields: {
                    withdraws: (prevWithdrawRefs: Reference[], { readField, toReference }) => {
                        if (prevWithdrawRefs.some(ref => readField('id', ref) === data.doWithdraw.id)) {
                            return prevWithdrawRefs;
                        }

                        return [toReference(data.doWithdraw), ...prevWithdrawRefs];
                    },
                },
            });
        },
    });

    return (amount, method, purse) => doWithdraw({ variables: { amount, method, purse } });
};

export default useDoWithdrawMutation;
