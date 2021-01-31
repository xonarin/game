import {
    DoQiwiWithdrawDocument,
    DoQiwiWithdrawMutation,
    MutationDoQiwiWithdrawArgs,
    QiwiWithdrawMethod,
    QiwiWithdrawPurse,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';

const useDoQiwiWithdrawMutation = () => {
    const [doQiwiWithdraw] = useMutationWithNotify<DoQiwiWithdrawMutation, MutationDoQiwiWithdrawArgs>(
        DoQiwiWithdrawDocument,
    );

    return (amount: number, method: QiwiWithdrawMethod, purse: QiwiWithdrawPurse) =>
        doQiwiWithdraw({ variables: { amount, method, purse } });
};

export default useDoQiwiWithdrawMutation;
