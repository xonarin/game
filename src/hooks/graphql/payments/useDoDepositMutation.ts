import { DoDepositDocument, DoDepositMutation, DoDepositMutationVariables } from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';

const useDoDepositMutation = () => {
    const [doDeposit] = useMutationWithNotify<DoDepositMutation, DoDepositMutationVariables>(DoDepositDocument);

    return (amount: number, method: string) => doDeposit({ variables: { amount, method } });
};

export default useDoDepositMutation;
