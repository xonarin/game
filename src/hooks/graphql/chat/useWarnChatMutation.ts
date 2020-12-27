import { FetchResult, useMutation } from '@apollo/client';

import {
    WarnChatDocument,
    WarnChatInput,
    WarnChatMutation,
    WarnChatMutationVariables,
} from '../../../__generated__/graphql';

export interface UseWarnChatMutationResult {
    (input: WarnChatInput): Promise<FetchResult<WarnChatMutation>>;
}

const useWarnChatMutation = (): UseWarnChatMutationResult => {
    const [warnChat] = useMutation<WarnChatMutation, WarnChatMutationVariables>(WarnChatDocument);

    return input => warnChat({ variables: { input } });
};

export default useWarnChatMutation;
