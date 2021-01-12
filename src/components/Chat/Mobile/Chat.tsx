import React, { useCallback, useEffect } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { Form } from 'react-final-form';
import { FormApi } from 'final-form';

import s from './Chat.scss';
import { cn } from '../../../utils/bem-css-module';
import useChatQuery from '../../../hooks/graphql/chat/useChatQuery';
import useMeQuery from '../../../hooks/graphql/users/useMeQuery';
import ChatMessage from './Message/ChatMessage';
import Panel from '../../Panel/Panel';
import Text from '../../Text/Text';
import Scrollable from '../../Scrollable/Scrollable';
import useDeleteMessageMutation from '../../../hooks/graphql/chat/useDeleteMessageMutation';
import useWarnChatMutation from '../../../hooks/graphql/chat/useWarnChatMutation';
import useScrollableHelper from '../../../hooks/useScrollableHelper';
import { MessageFragment } from '../../../__generated__/graphql';
import Icon from '../../Icon/Icon';
import useOnlineDataQuery from '../../../hooks/graphql/liveData/useOnlineDataQuery';
import { ChatMessageFormValues } from '../../forms/Web/ChatMessageForm/ChatMessageForm';
import MessageField from '../../fields/MessageField/MessageField';
import useSendMessageMutation from '../../../hooks/graphql/chat/useSendMessageMutation';

export interface ChatProps {
    chatId: string;
    className?: string;
    closeChat: Function;
}

const cnChat = cn(s, 'Chat');

const Chat: React.FC<ChatProps> = ({ chatId, className, closeChat }) => {
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
    const { online } = useOnlineDataQuery();

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

    const sendMessageMutation = useSendMessageMutation();
    const onSubmit = useCallback(
        async ({ message }: ChatMessageFormValues, form: FormApi<ChatMessageFormValues>) => {
            if (!message) return;

            setTimeout(() => form.reset(), 0);
            setTimeout(
                () =>
                    sendMessageMutation({ chatId, message }).then(
                        result => result?.data && onSentMessage(result.data.sendMessage),
                    ),
                0,
            );
        },
        [sendMessageMutation, chatId, onSentMessage],
    );

    return (
        <Panel
            className={cnChat(null, [className])}
            leftHead={
                <button type="button" onClick={() => closeChat()} className={cnChat('Back')}>
                    <Icon type="left" />
                </button>
            }
            centerHead={
                <Text className={cnChat('PanelTitle')} font="Rubik" size="l" color="white" upper>
                    Чат
                </Text>
            }
            rightHead={
                <div className={cnChat('Online')}>
                    <div className={cnChat('OnlinePulse')} />
                    <div className={cnChat('OnlineCount')}>{online?.online}</div>
                </div>
            }
        >
            <Form<ChatMessageFormValues>
                onSubmit={onSubmit}
                mutators={{
                    onUsernameClick: (args, state, utils) => {
                        utils.changeValue(state, 'message', value => `${args[0]}, ${value || ''}`);
                    },
                }}
                render={({ form, handleSubmit }) => (
                    <>
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
                                            addUsernameToChat={form.mutators.onUsernameClick}
                                            closeChat={() => closeChat()}
                                        />
                                    ))}
                            </div>
                        </Scrollable>
                        <MessageField name="message" onSubmit={handleSubmit} />
                    </>
                )}
            />
        </Panel>
    );
};

export default Chat;
