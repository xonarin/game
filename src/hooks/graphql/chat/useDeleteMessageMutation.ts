import { FetchResult, useMutation } from '@apollo/client';

import {
    DeleteMessageDocument,
    DeleteMessageInput,
    DeleteMessageMutation,
    DeleteMessageMutationVariables,
} from '../../../__generated__/graphql';

export interface UseDeleteMessageMutationResult {
    (input: DeleteMessageInput): Promise<FetchResult<DeleteMessageMutation>>;
}

const useDeleteMessageMutation = (): UseDeleteMessageMutationResult => {
    const [deleteMessage] = useMutation<DeleteMessageMutation, DeleteMessageMutationVariables>(DeleteMessageDocument);

    return input => deleteMessage({ variables: { input } });
};

export default useDeleteMessageMutation;
