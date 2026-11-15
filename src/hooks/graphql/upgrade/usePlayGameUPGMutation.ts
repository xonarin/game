import { useCallback } from 'react';
import { FetchResult } from '@apollo/client';

import {
    InventoryUpgDocument,
    PlayGameUpgDocument,
    PlayGameUpgInput,
    PlayGameUpgMutation,
    PlayGameUpgMutationVariables,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';

export interface UsePlayGameUPGMutationResult {
    play: (input: PlayGameUpgInput) => Promise<FetchResult<PlayGameUpgMutation> | undefined>;
    loading: boolean;
}

const usePlayGameUPGMutation = (): UsePlayGameUPGMutationResult => {
    // Ошибки сервера (UPGRADE_*) показываются уведомлением; инвентарь перечитывается после игры
    const [playGame, { loading }] = useMutationWithNotify<PlayGameUpgMutation, PlayGameUpgMutationVariables>(
        PlayGameUpgDocument,
        { refetchQueries: [{ query: InventoryUpgDocument }] },
    );

    const play = useCallback((input: PlayGameUpgInput) => playGame({ variables: { input } }), [playGame]);

    return { play, loading };
};

export default usePlayGameUPGMutation;
