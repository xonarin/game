import { useApolloClient } from '@apollo/client';

import {
    AddNotificationDocument,
    AddNotificationMutationVariables,
    Notification,
    UsePromoCodeDocument,
    UsePromoCodeMutation,
    UsePromoCodeMutationVariables,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';
import { makeSuccessNotification } from '../../../utils/apollo/notifications';

const useUsePromoCodeMutation = () => {
    const client = useApolloClient();

    const [usePromoCodeMutation] = useMutationWithNotify<UsePromoCodeMutation, UsePromoCodeMutationVariables>(
        UsePromoCodeDocument,
        {
            update: async (_0, { data }) => {
                if (!data) {
                    return;
                }

                const { usePromoCode: promoCode } = data;

                await client.mutate<Notification, AddNotificationMutationVariables>({
                    mutation: AddNotificationDocument,
                    variables: {
                        input: makeSuccessNotification(`Поздравляем! Вы активировали промокод ${promoCode}.`),
                    },
                });
            },
        },
    );

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return (promoCode: string) => usePromoCodeMutation({ variables: { promoCode } });
};

export default useUsePromoCodeMutation;
