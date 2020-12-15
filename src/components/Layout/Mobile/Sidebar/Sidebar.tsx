import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { cn } from '../../../../utils/bem-css-module';
import NavigationItem from '../../Mobile/Sidebar/NavigationItem/HeaderNavigationItem';
import s from './Sidebar.scss';
import Text from '../../../Text/Text';
import useUnreadCountQuery from '../../../../hooks/graphql/chat/useUnreadCountQuery';
import Link from '../../../Link/Link';
import AlarmButton from '../../../Button/containers/AlarmButton/AlarmButton';

export interface SidebarMobileProps {
    openPopUp: Function;
    openChat: Function;
}

const cnSidebar = cn(s, 'Sidebar');

const SidebarMobile: React.FC<SidebarMobileProps> = ({ openPopUp, openChat }) => {
    const [msgToggle, setMsgToggle] = useState(false);
    const [allToggle, setAllToggle] = useState(false);
    useStyles(s);
    const { unreadCount } = useUnreadCountQuery();

    return (
        <aside className={cnSidebar()}>
            {allToggle ? (
                <div className={cnSidebar('Burger')}>
                    <NavigationItem to="/tournaments" text="Турниры" icon="ingots" iconHover="ingotsWhite" />
                    <NavigationItem to="/referal" text="Рефералы" icon="gamepad" iconHover="gamepadWhite" />
                    <NavigationItem to="/profile" text="Профиль" icon="user" iconHover="user" />
                    <NavigationItem to="/fair-play" text="Честная игра" icon="guardTwo" iconHover="gamepadWhite" />
                    <NavigationItem to="/fag" text="Правила" icon="gamepad" iconHover="gamepadWhite" />
                    <NavigationItem to="/messages?userId=1" text="Поддержка" icon="faq" iconHover="faqWhite" />
                </div>
            ) : null}
            <div className={cnSidebar('Row')}>
                <NavigationItem to="/all-games" icon="gamepad" iconHover="gamepadWhite" />
                <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => openPopUp()}>
                    <NavigationItem icon="ingots" iconHover="ingotsWhite" />
                </button>
                <button
                    type="button"
                    className={cnSidebar('Selector')}
                    onClick={() => {
                        setAllToggle(!allToggle);
                        setMsgToggle(false);
                    }}
                >
                    <NavigationItem
                        icon={allToggle ? 'close' : 'plusWhite'}
                        iconHover={allToggle ? 'plusWhite' : 'plusWhite'}
                    />
                </button>
                <div>
                    <button
                        type="button"
                        className={cnSidebar('Selector')}
                        
                    >
                        <AlarmButton
                            isAlarm={Boolean(unreadCount && unreadCount > 0)}
                            icon="message"
                            iconHover="messageWhite"
                            onClick={() => {
                                setMsgToggle(!msgToggle);
                                setAllToggle(false);
                            }}
                        className={cnSidebar('Selector')}

                        />
                    </button>
                    {msgToggle ? (
                        <div className={cnSidebar('Message')}>
                            <div className={cnSidebar('Message-Type')}>
                                <Link
                                    to="/messages"
                                    isSoft
                                    render={isActive => (
                                        <AlarmButton
                                            isAlarm={Boolean(unreadCount && unreadCount > 0)}
                                            icon="message"
                                            iconHover="messageWhite"
                                        />
                                    )}
                                />
                                <Text>личный чат {unreadCount} </Text>
                            </div>
                            <div className={cnSidebar('Message-Type')}>
                                <button type="button" onClick={() => openChat()}>
                                    <NavigationItem icon="message" iconHover="messageWhite" />
                                </button>
                                <Text>Общий чат </Text>
                            </div>
                        </div>
                    ) : null}
                </div>
                <NavigationItem to="/" icon="user" iconHover="user" />
            </div>
        </aside>
    );
};

export default SidebarMobile;
