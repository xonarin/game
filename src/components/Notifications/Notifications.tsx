import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { animated, useTransition } from 'react-spring';
import { easeCubicInOut } from 'd3-ease';

import s from './Notifications.scss';
import { cn } from '../../utils/bem-css-module';
import useNotificationsQuery from '../../hooks/graphql/notifications/useNotificationsQuery';
import useDeleteNotificationMutation from '../../hooks/graphql/notifications/useDeleteNotificationMutation';
import Text from '../Text/Text';
import TextBlock from '../TextBlock/TextBlock';
import PreLoader from '../PreLoader/PreLoader';
const cnNotifications = cn(s, 'Notifications');

const Notifications: React.FC = () => {
    useStyles(s);

    const { loading, notifications } = useNotificationsQuery();

    const springNotifications = useTransition(notifications || [], item => item.id, {
        from: {
            opacity: 0,
            transform: 'translateX(100%)',
        },
        enter: {
            opacity: 1,
            transform: 'translateX(0)',
        },
        leave: {
            opacity: 0,
            transform: 'translateX(100%)',
        },
        config: {
            duration: 500,
            easing: easeCubicInOut,
        },
    });

    const deleteNotificationMutation = useDeleteNotificationMutation();
    const deleteNotification = useCallback(
        async (notificationId: string) => {
            await deleteNotificationMutation({ notificationId });
        },
        [deleteNotificationMutation],
    );

    if (loading || !notifications) {
        return  <PreLoader/>
    }

    return (
        <div className={cnNotifications({ isHidden: notifications.length === 0 })}>
            {springNotifications.map(({ item: { id, title, message, level }, key, props }) => (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
                <animated.div
                    className={cnNotifications('Item', { level })}
                    onClick={() => deleteNotification(id)}
                    style={props}
                    key={key}
                >
                    <Text className={cnNotifications('ItemTitle')} size="s" color="white">
                        {title}
                    </Text>
                    <TextBlock weight="regular">{message}</TextBlock>
                </animated.div>
            ))}
        </div>
    );
};

export default Notifications;
