import { DoWithdrawDocument, DoWithdrawMutation, MutationDoWithdrawArgs } from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';

const useDoWithdrawMutation = () => {
    const [doWithdraw] = useMutationWithNotify<DoWithdrawMutation, MutationDoWithdrawArgs>(DoWithdrawDocument);

    return (amount: number, method: string, purse: string) => doWithdraw({ variables: { amount, method, purse } });
};

export default useDoWithdrawMutation;
