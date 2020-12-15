import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Messages.scss';
import { cn } from '../../utils/bem-css-module';
import Layout from '../../components/Layout/Layout';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';
import Chats from './Web/Chats/Chats';
import Dialog from './Web/Dialog/Dialog';
import DialogMobile from './Mobile/Dialog/Dialog';
import ChatsMobile from './Mobile/Chats/Chats';

export interface MessagesProps {
    chatId?: string;
    userId?: string;
}

const cnMessages = cn(s, 'Messages');

const Messages: React.FC<MessagesProps> = ({ chatId, userId }) => {
    const [mobile, setMobile] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    useIsomorphicLayoutEffect(() => {
        if (
            typeof window !== 'undefined' &&
            typeof window.document !== 'undefined' &&
            typeof window.document.createElement !== 'undefined' &&
            window.screen.width < 992
        ) {
            setMobile(true);
        }
    }, [typeof window !== 'undefined' && window?.screen?.width]);

    useStyles(s);


    if (mobile) {
        return (
            <Layout fullScreen={showDialog}>
                {showDialog ? <DialogMobile closeDialog={()=>setShowDialog(false)} chatId={chatId} userId={userId}/>:<ChatsMobile openDialog={()=>setShowDialog(true)} chatId={chatId} userId={userId}/>}
            </Layout>
        );
    }

    return (
        <>
            <Layout>
                <div className={cnMessages()}>
                   <Chats chatId={chatId} userId={userId}/>
                   <Dialog chatId={chatId} userId={userId}/>
                </div>
            </Layout>
        </>
    );
};

export default Messages;
