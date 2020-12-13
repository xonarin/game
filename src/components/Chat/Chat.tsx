import React, { useCallback, useEffect } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Chat.scss';
import { cn } from '../../utils/bem-css-module';
import useChatQuery from '../../hooks/graphql/chat/useChatQuery';
import useMeQuery from '../../hooks/graphql/users/useMeQuery';
import ChatMessage from './Message/ChatMessage';
import Panel from '../Panel/Panel';
import Text from '../Text/Text';
import Scrollable from '../Scrollable/Scrollable';
import ChatMessageForm from '../forms/Web/ChatMessageForm/ChatMessageForm';
import useDeleteMessageMutation from '../../hooks/graphql/chat/useDeleteMessageMutation';
import useWarnChatMutation from '../../hooks/graphql/chat/useWarnChatMutation';
import useScrollableHelper from '../../hooks/useScrollableHelper';
import { MessageFragment } from '../../__generated__/graphql';

export interface ChatProps {
    chatId: string;
    className?: string;
}

const cnChat = cn(s, 'Chat');

const Chat: React.FC<ChatProps> = ({ chatId, className }) => {
    useStyles(s);

    const { me } = useMeQuery();

    const { scrollableRef, scrollTo, isScrolledToBottom } = useScrollableHelper();
    const onSentMessage = useCallback(
        (message: MessageFragment) => {
            if (message.sender.id === me?.id || isScrolledToBottom()) {
                setTimeout(() => scrollTo(-0, 100), 100);
            }
        },
        [isScrolledToBottom, me, scrollTo],
    );

    const { chat } = useChatQuery(chatId, onSentMessage);

    useEffect(() => {
        if (chat) {
            scrollTo(-0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chat?.id]);

    const deleteMessageMutation = useDeleteMessageMutation();
    const deleteMessage = useCallback(
        async (messageId: string) => {
            await deleteMessageMutation({ messageId });
        },
        [deleteMessageMutation],
    );

    const warnChatMutation = useWarnChatMutation();
    const warnChat = useCallback(
        async (userId: string) => {
            await warnChatMutation({ userId });
        },
        [warnChatMutation],
    );

    return (
        <Panel
            className={cnChat(null, [className])}
            leftHead={
                <Text className={cnChat('PanelTitle')} font="Rubik" size="l" color="white" upper>
                    Чат
                </Text>
            }
            rightHead={
                <div className={cnChat('Online')}>
                    <div className={cnChat('OnlinePulse')} />
                    <div className={cnChat('OnlineCount')}>468</div>
                </div>
            }
        >
            <Scrollable className={cnChat('Messages')} disablePadding ref={scrollableRef}>
                <div className={cnChat('MessagesItems')}>
                    {chat &&
                        chat.messages.map(message => (
                            <ChatMessage
                                {...message}
                                showPm={message.sender.id !== me?.id}
                                showControls={me?.role === 'Admin'}
                                deleteMessage={deleteMessage}
                                warnChat={warnChat}
                                key={message.id}
                            />
                        ))}
                </div>
            </Scrollable>
            <ChatMessageForm chatId={chatId} onMutate={onSentMessage} />
        </Panel>
    );
};

export default Chat;
