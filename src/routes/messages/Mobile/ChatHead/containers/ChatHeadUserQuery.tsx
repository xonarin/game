import React from 'react';

import useUserQuery from '../../../../../hooks/graphql/users/useUserQuery';
import ChatHead from '../ChatHead';
import Text from '../../../../../components/Text/Text';

export interface ChatHeadUserQuery {
    userId: string;
}

const MessagesUserQuery: React.FC<ChatHeadUserQuery> = ({ userId }) => {
    const { user } = useUserQuery(userId);

    return user ? <ChatHead title={user.username} image={user.avatar} /> : <Text>Пользователь не найден</Text>;
};

export default MessagesUserQuery;
