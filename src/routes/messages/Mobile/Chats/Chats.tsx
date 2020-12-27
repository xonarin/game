import React, { useCallback, useEffect, useMemo } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Chats.scss';
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
import CreatePmChatForm from '../../../../components/forms/Web/CreatePmChatForm/CreatePmChatForm';
import ChatMessageForm from '../../../../components/forms/Web/ChatMessageForm/ChatMessageForm';
import SearchInput from '../../../../components/inputs/MessageInput/Mobile/SearchInput/SearchInput';
import ChatItem from '../ChatItem/ChatItem';

export interface MessagesProps {
    chatId?: string;
    userId?: string;
    openDialog: Function;
}

const cnChats = cn(s, 'Chats');

const ChatsMobile: React.FC<MessagesProps> = ({ chatId, userId, openDialog }) => {
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
    const { chats, chatsCount, chatsFetchMore, chatRefetch } = useChatsQuery(submittedSearch, chatId, onSentMessage);

    const readChatMutation = useReadChatMutation();

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

    const sortedChats = useMemo(
        () =>
            chats ? [...chats].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) : [],
        [chats],
    );

    let formElem = null;
    if (userId) {
        formElem = <CreatePmChatForm userId={userId} />;
    } else if (chatId) {
        formElem = <ChatMessageForm chatId={chatId} onMutate={onSentMessage} isPm />;
    }
    return (
        <div className={cnChats()}>
            <div className={cnChats("Input")}><SearchInput value={search} onChange={onChangeSearch} onSubmit={onSubmitSearch}/></div> 
            <InfiniteScroll
                className={cnChats('ChatsList')}
                offset={chats ? chats.length : 0}
                count={chatsCount || 0}
                loadMore={chatsFetchMore}
                disablePadding
            >
                {sortedChats.map(chatItem => (
                    <button type="button" className={cnChats('ChatItem')} onClick={() => openDialog()}>
                        <ChatItem {...chatItem} isSelected={chatItem.id === chatId} key={chatItem.id} />
                    </button>
                ))}
            </InfiniteScroll>
        </div>
    );
};

export default ChatsMobile;
