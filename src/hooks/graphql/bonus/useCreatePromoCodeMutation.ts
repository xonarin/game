import { useApolloClient } from '@apollo/client';

import {
    AddNotificationDocument,
    AddNotificationMutationVariables,
    CreatePromoCodeDocument,
    CreatePromoCodeMutation,
    CreatePromoCodeMutationVariables,
    Notification,
} from '../../../__generated__/graphql';
import useMutationWithNotify from '../useMutationWithNotify';
import { makeSuccessNotification } from '../../../utils/apollo/notifications';

const useCreatePromoCodeMutation = () => {
    const client = useApolloClient();

    const [createPromoCodeMutation] = useMutationWithNotify<CreatePromoCodeMutation, CreatePromoCodeMutationVariables>(
        CreatePromoCodeDocument,
        {
            update: async (_0, { data }) => {
                if (!data) {
                    return;
                }

                const { createPromoCode: promoCode } = data;

                await client.mutate<Notification, AddNotificationMutationVariables>({
                    mutation: AddNotificationDocument,
                    variables: { input: makeSuccessNotification(`Поздравляем! Вы создали промокод ${promoCode}.`) },
                });
            },
        },
    );

    return (promoCode: string, amount: number, maxUses: number) =>
        createPromoCodeMutation({ variables: { promoCode, amount, maxUses } });
};

export default useCreatePromoCodeMutation;
