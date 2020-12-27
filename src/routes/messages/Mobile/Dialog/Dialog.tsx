import React, { useCallback, useEffect, useMemo } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Dialog.scss';
import { cn } from '../../../../utils/bem-css-module';
import { ChatType, MessageFragment } from '../../../../__generated__/graphql';
import history from '../../../../history';
import useMeQuery from '../../../../hooks/graphql/users/useMeQuery';
import useChatsQuery from '../../../../hooks/graphql/chat/useChatsQuery';
import useSubmitState from '../../../../hooks/useSubmitState';
import useScrollableHelper from '../../../../hooks/useScrollableHelper';
import useReadChatMutation from '../../../../hooks/graphql/chat/useReadChatMutation';
import Panel from '../../../../components/Panel/Panel';
import InfiniteScroll from '../../../../components/InfiniteScroll/InfiniteScroll';
import CreatePmChatForm from '../../../../components/forms/Mobile/CreatePmChatForm/CreatePmChatForm';
import ChatMessageForm from '../../../../components/forms/Mobile/ChatMessageForm/ChatMessageForm';
import Message from '../../Mobile/Message/Message';
import ChatHeadOptional from '../../Mobile/ChatHead/containers/ChatHeadOptional';
import Icon from '../../../../components/Icon/Icon';


export interface MessagesProps {
    chatId?: string;
    userId?: string;
    closeDialog:Function
}

const cnDialog = cn(s, 'Dialog');

const DialogMobile: React.FC<MessagesProps> = ({ chatId, userId,closeDialog }) => {

    

    useStyles(s);

    const { me } = useMeQuery();

    const { scrollableRef: messagesScrollableRef, scrollTo, isScrolledToBottom } = useScrollableHelper();
    const onSentMessage = useCallback(
        (message: MessageFragment) => {
            if (message.sender.id === me?.id || isScrolledToBottom()) {
                setTimeout(() => scrollTo(-0, 100), 100);
            }
        },
        [isScrolledToBottom, me, scrollTo],
    );

    const [search, onChangeSearch, submittedSearch, onSubmitSearch] = useSubmitState('');
    const { chats, chat, chatFetchMore, chatRefetch } = useChatsQuery(
        submittedSearch,
        chatId,
        onSentMessage,
    );

    const readChatMutation = useReadChatMutation();

    const onScrollMessages = useMemo(
        () =>
            chat && chat.unreadMessagesCount > 0 ? () => isScrolledToBottom() && readChatMutation(chat.id) : undefined,
        [chat, isScrolledToBottom, readChatMutation],
    );

    useEffect(() => {
        if (!chatId) return;

        chatRefetch().then(({ data: { chat: refetchedChat } }) => {
            if (refetchedChat.unreadMessagesCount > 0 && isScrolledToBottom()) {
                return readChatMutation(refetchedChat.id);
            }

            scrollTo(-0);
            return undefined;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatId]);

    useEffect(() => {
        if (!chatId && chats && chats.length > 0) {
            if (!userId) {
                history.push(`/messages/${chats[0].id}`);
                return;
            }

            const existingChat = chats.find(
                item =>
                    item.type === ChatType.Pm &&
                    item.members.length === 2 &&
                    item.members.some(member => member.id === userId),
            );
            if (existingChat) {
                history.push(`/messages/${existingChat.id}`);
            }
        }
    }, [chatId, chats, userId]);

  

    let formElem = null;
    if (userId) {
        formElem = <CreatePmChatForm userId={userId} />;
    } else if (chatId) {
        formElem = <ChatMessageForm chatId={chatId} onMutate={onSentMessage} isPm />;
    }
    return (
        <Panel className={cnDialog()} leftHead={<button type='button' className={cnDialog("Close")} onClick={()=>closeDialog()}><Icon type='left'/></button>} rightHead={<ChatHeadOptional chat={chat} userId={userId} />}>
        {chat ? (
            <InfiniteScroll
                className={cnDialog('MessagesList')}
                offset={chat.messages.length}
                count={chat.messagesCount}
                loadMore={chatFetchMore}
                toTop
                onScroll={onScrollMessages}
                disablePadding
                ref={messagesScrollableRef}
            >
                <div className={cnDialog('MessagesItems')}>
                    {chat.messages.map(message => (
                        <Message {...message} isMine={message.sender.id === me?.id} key={message.id} />
                    ))}
                </div>
            </InfiniteScroll>
        ) : (
            <div className={cnDialog('MessagesList')} />
        )}
        {formElem}
    </Panel>
    )
}

export default DialogMobile
