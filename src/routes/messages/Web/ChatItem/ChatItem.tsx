import React, { useMemo } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ChatItem.scss';
import { cn } from '../../../../utils/bem-css-module';
import { ChatFragment, MessageFragment } from '../../../../__generated__/graphql';
import { transformDateToTime } from '../../../../utils/strings';
import Link from '../../../../components/Link/Link';
import Text from '../../../../components/Text/Text';
import { transformMessage } from '../../../../utils/message';
import TextBlock from '../../../../components/TextBlock/TextBlock';

export interface ChatItemProps extends ChatFragment {
    isSelected?: boolean;
}

const cnChatItem = cn(s, 'ChatItem');

const ChatItem: React.FC<ChatItemProps> = ({
    id,
    title,
    image,
    updatedAt,
    unreadMessagesCount,
    messages,
    isSelected,
}) => {
    useStyles(s);

    const lastMessage: MessageFragment | undefined = messages[messages.length - 1];
    const lastMessageText: string | undefined = lastMessage?.message;
    const transformedMessage: React.ReactNode = useMemo(
        () => (lastMessageText ? transformMessage(lastMessageText) : '...'),
        [lastMessageText],
    );

    return (
        <Link className={cnChatItem({ isSelected })} to={`/messages/${id}`}>
            <div className={cnChatItem('ImageContainer')}>
                <img className={cnChatItem('Image')} src={image ?? undefined} alt={title ?? undefined} />
                <span className={cnChatItem('Online')} />
            </div>
            <div className={cnChatItem('Main')}>
                <div className={cnChatItem('Top')}>
                    <Text className={cnChatItem('Title')} color="white" upper>
                        {title}
                    </Text>
                    <Text size="xs">{transformDateToTime(updatedAt)}</Text>
                </div>
                <TextBlock className={cnChatItem('LastMessage')} maxLines={2}>
                    {transformedMessage}
                </TextBlock>
            </div>
            {unreadMessagesCount > 0 && (
                <Text className={cnChatItem('UnreadMessages')}>
                    <span>{unreadMessagesCount}</span>
                </Text>
            )}
        </Link>
    );
};

export default ChatItem;
