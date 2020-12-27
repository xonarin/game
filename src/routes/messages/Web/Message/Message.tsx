import React, { useMemo } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Message.scss';
import { cn } from '../../../../utils/bem-css-module';
import { MessageFragment } from '../../../../__generated__/graphql';
import { transformDateToTime } from '../../../../utils/strings';
import { transformMessage } from '../../../../utils/message';
import TextBlock from '../../../../components/TextBlock/TextBlock';
import Text from '../../../../components/Text/Text';

export interface MessageProps extends MessageFragment {
    isMine?: boolean;
}

const cnMessage = cn(s, 'Message');

const Message: React.FC<MessageProps> = ({ message, createdAt, isMine }) => {
    useStyles(s);

    const transformedMessage = useMemo(() => transformMessage(message), [message]);

    return (
        <div className={cnMessage({ isMine })}>
            <TextBlock className={cnMessage('Text')} size="m" weight="semiBold" color="white">
                {transformedMessage}
            </TextBlock>
            <Text className={cnMessage('Time')} size="xs">
                {transformDateToTime(createdAt)}
            </Text>
        </div>
    );
};

export default Message;
