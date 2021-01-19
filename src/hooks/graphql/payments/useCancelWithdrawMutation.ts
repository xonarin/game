import {
    CancelWithdrawDocument,
    CancelWithdrawMutation,
    MutationCancelWithdrawArgs,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';

const useCancelWithdrawMutation = () => {
    const [cancelWithdraw] = useMutationWithNotify<CancelWithdrawMutation, MutationCancelWithdrawArgs>(
        CancelWithdrawDocument,
    );

    return (id: string) => cancelWithdraw({ variables: { id } });
};

export default useCancelWithdrawMutation;
