import { useMutation } from '@apollo/client';

import { GetBonusDocument, GetBonusMutation, GetBonusMutationVariables } from '../../../__generated__/graphql';

const useGetBonusMutation = () => {
    const [getBonusMutation] = useMutation<GetBonusMutation, GetBonusMutationVariables>(GetBonusDocument);

    return getBonusMutation;
};

export default useGetBonusMutation;
