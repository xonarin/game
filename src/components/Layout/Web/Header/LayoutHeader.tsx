import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './LayoutHeader.scss';
import { cn } from '../../../../utils/bem-css-module';
import useMeQuery from '../../../../hooks/graphql/users/useMeQuery';
import HeaderNavigationItem from './NavigationItem/HeaderNavigationItem';
import Balance from './Balance/Balance';
import AlarmButton from '../../../Button/containers/AlarmButton/AlarmButton';
import MiniProfile from './MiniProfile/MiniProfile';
import Link from '../../../Link/Link';
import AnnouncementsWidget from './AnnouncementsWidget/AnnouncementsWidget';
import useUnreadCountQuery from '../../../../hooks/graphql/chat/useUnreadCountQuery';
import PreLoader from '../../../PreLoader/PreLoader';
const cnLayoutHeader = cn(s, 'LayoutHeader');

const LayoutHeader: React.FC = () => {
    useStyles(s);

    const { me, loading } = useMeQuery();
    const { unreadCount } = useUnreadCountQuery();

    if (loading) {
        return  <PreLoader/>
    }

    return (
        <header className={cnLayoutHeader()}>
            <div className={cnLayoutHeader('Container')}>
                <nav className={cnLayoutHeader('Navigation')}>
                    <HeaderNavigationItem to="/all-games" text="Все игры" icon="gamepad" iconHover="gamepadWhite" />
                    <HeaderNavigationItem to="/bonuse" text="Бонусы" icon="ingots" iconHover="ingotsWhite" />
                    <HeaderNavigationItem to="/faq" text="FAQ" icon="faq" iconHover="faqWhite" />
                </nav>
                <div className={cnLayoutHeader('Right')}>
                    <Balance money={me?.money || 0} />
                    <div className={cnLayoutHeader('Buttons')}>
                        <Link
                            className={cnLayoutHeader('Button')}
                            to="/"
                            render={isActive => (
                                <AlarmButton
                                    className={cnLayoutHeader('InnerButton', { isActive })}
                                    icon="prize"
                                    iconHover="prizeWhite"
                                    color="gray"
                                />
                            )}
                        />
                        <AnnouncementsWidget className={cnLayoutHeader('Button')} />
                        <Link
                            className={cnLayoutHeader('Button')}
                            to="/messages"
                            isSoft
                            render={isActive => (
                                <AlarmButton
                                    className={cnLayoutHeader('InnerButton', { isActive })}
                                    isAlarm={Boolean(unreadCount && unreadCount > 0)}
                                    icon="message"
                                    iconHover="messageWhite"
                                />
                            )}
                        />
                    </div>
                    <MiniProfile username={me?.username || ''} avatar={me?.avatar || ''} />
                </div>
            </div>
        </header>
    );
};

export default LayoutHeader;
