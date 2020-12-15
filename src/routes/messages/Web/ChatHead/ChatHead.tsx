import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ChatHead.scss';
import { cn } from '../../../../utils/bem-css-module';
import Text from '../../../../components/Text/Text';

export interface ChatHeadProps {
    title?: string | null;
    image?: string | null;
}

const cnMessagesUser = cn(s, 'ChatHead');

const ChatHead: React.FC<ChatHeadProps> = ({ title, image }) => {
    useStyles(s);

    return (
        <div className={cnMessagesUser()}>
            {image && (
                <div className={cnMessagesUser('ImageContainer')}>
                    <img className={cnMessagesUser('Image')} src={image} alt={title || 'Чат'} />
                </div>
            )}
            <div className={cnMessagesUser('Main')}>
                <Text className={cnMessagesUser('Title')} color="white" upper>
                    {title || 'Чат'}
                </Text>
                <Text font="Rubik" size="xs" color="green">
                    Online
                </Text>
            </div>
        </div>
    );
};

export default ChatHead;
