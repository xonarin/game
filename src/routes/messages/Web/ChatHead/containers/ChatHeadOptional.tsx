import React from 'react';

import { ChatFragment } from '../../../../../__generated__/graphql';
import Text from '../../../../../components/Text/Text';
import ChatHead from '../ChatHead';
import ChatHeadUserQuery from './ChatHeadUserQuery';

export interface ChatHeadOptionalProps {
    chat?: ChatFragment;
    userId?: string;
}

const ChatHeadOptional: React.FC<ChatHeadOptionalProps> = ({ chat, userId }) => {
    let userComponent = null;

    if (chat) {
        userComponent = <ChatHead {...chat} />;
    } else if (userId) {
        userComponent = <ChatHeadUserQuery userId={userId} />;
    }

    return userComponent || <Text>Пользователь не найден</Text>;
};

export default ChatHeadOptional;
