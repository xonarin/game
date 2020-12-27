import React, { useCallback, useMemo } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ChatMessage.scss';
import { cn } from '../../../utils/bem-css-module';
import { MessageFragment } from '../../../__generated__/graphql';
import { transformMessage } from '../../../utils/message';
import { transformDateToTime } from '../../../utils/strings';
import Text from '../../Text/Text';
import TextBlock from '../../TextBlock/TextBlock';
import Button from '../../Button/Button';
import Link from '../../Link/Link';

export interface ChatMessageProps extends MessageFragment {
    showPm?: boolean;
    showControls?: boolean;
    deleteMessage: (messageId: string) => void;
    warnChat: (userId: string) => void;
}

const cnChatMessage = cn(s, 'ChatMessage');

const ChatMessage: React.FC<ChatMessageProps> = ({
    id,
    sender,
    message,
    createdAt,
    showPm,
    showControls,
    deleteMessage,
    warnChat,
}) => {
    useStyles(s);

    const transformedMessage = useMemo(() => transformMessage(message), [message]);
    const onClickDeleteMessage = useCallback(() => deleteMessage(id), [id, deleteMessage]);
    const onClickWarnChat = useCallback(() => warnChat(sender.id), [sender.id, warnChat]);

    return (
        <div className={cnChatMessage({ showControls })}>
            <img className={cnChatMessage('Avatar')} src={sender.avatar} alt={sender.username} />
            <div className={cnChatMessage('Main')}>
                <div className={cnChatMessage('Top')}>
                    <Text className={cnChatMessage('Username')} color="white">
                        {sender.username}
                    </Text>
                    <Text className={cnChatMessage('Time')}>{transformDateToTime(createdAt)}</Text>
                </div>
                <TextBlock weight="semiBold">{transformedMessage}</TextBlock>
            </div>
            {showControls && (
                <div className={cnChatMessage('Controls')}>
                    <Button
                        className={cnChatMessage('ControlsButton')}
                        icon="delete"
                        clear
                        onClick={onClickDeleteMessage}
                    />
                    <Button className={cnChatMessage('ControlsButton')} icon="ban" clear onClick={onClickWarnChat} />
                </div>
            )}
            {showPm && (
                <Link to={`/messages?userId=${sender.id}`}>
                    <Button className={cnChatMessage('PmButton')} icon="letter" iconHover="letterWhite" clear />
                </Link>
            )}
        </div>
    );
};

export default ChatMessage;
