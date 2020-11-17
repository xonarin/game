import { FetchResult } from '@apollo/client';

import {
    CreatePmChatDocument,
    CreatePmChatInput,
    CreatePmChatMutation,
    CreatePmChatMutationVariables,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';
import { addChatIfNotExist } from '../../../cache/chats';

export interface UseCreatePmChatMutationResult {
    (input: CreatePmChatInput): Promise<FetchResult<CreatePmChatMutation>>;
}

const useCreatePmChatMutation = (): UseCreatePmChatMutationResult => {
    const [createPmChat] = useMutationWithNotify<CreatePmChatMutation, CreatePmChatMutationVariables>(
        CreatePmChatDocument,
        {
            update: (cache, { data }) => {
                if (data) {
                    addChatIfNotExist(cache, data.createPmChat);
                }
            },
        },
    );

    return input => createPmChat({ variables: { input } });
};

export default useCreatePmChatMutation;
