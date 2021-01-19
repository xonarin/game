import { GetBonusDocument, GetBonusMutation, GetBonusMutationVariables } from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';

const useGetBonusMutation = () => {
    const [getBonusMutation, getBonusResult] = useMutationWithNotify<GetBonusMutation, GetBonusMutationVariables>(
        GetBonusDocument,
    );

    return { getBonusMutation, getBonusResult };
};

export default useGetBonusMutation;
