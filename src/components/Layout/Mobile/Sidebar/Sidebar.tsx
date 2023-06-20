import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../../../utils/bem-css-module';
import NavigationItem from '../../Mobile/Sidebar/NavigationItem/HeaderNavigationItem';
import s from './Sidebar.scss';
import Text from '../../../Text/Text';
import useUnreadCountQuery from '../../../../hooks/graphql/chat/useUnreadCountQuery';
import Link from '../../../Link/Link';
import Icon from '../../../../components/Icon/Icon';
import AlarmButton from '../../../Button/containers/AlarmButton/AlarmButton';

export interface SidebarMobileProps {
    openPopUp: Function;
    openChat: Function;
    closePopUp: Function;
}

const cnSidebar = cn(s, 'Sidebar');

const SidebarMobile: React.FC<SidebarMobileProps> = ({ openPopUp, openChat, closePopUp }) => {
    const [msgToggle, setMsgToggle] = useState(false);
    const [shareToggle, setshareToggle] = useState(false);
    const [allToggle, setAllToggle] = useState(false);
    useStyles(s);
    const { unreadCount } = useUnreadCountQuery();

    return (
        <aside className={cnSidebar()}>
            {allToggle ? (
                <div className={cnSidebar('Burger')}>
                    <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => closePopUp()}>
                        <NavigationItem to="/tournaments" text="Турниры" icon="ingots" iconHover="ingotsWhite" />
                    </button>
                    <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => closePopUp()}>
                        <NavigationItem to="/referal" text="Рефералы" icon="gamepad" iconHover="gamepadWhite" />
                    </button>
                    <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => closePopUp()}>
                        <NavigationItem to="/messages?userId=1" text="Поддержка" icon="faq" iconHover="faqWhite" />
                    </button>
                    <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => closePopUp()}>
                        <NavigationItem to="/faq" text="Правила" icon="faq" iconHover="gamepadWhite" />
                    </button>
                    <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => closePopUp()}>
                        <NavigationItem to="#" text="Профиль" icon="user" iconHover="user" />
                    </button>
                    <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => closePopUp()}>

                        <Link className={cnSidebar('LogOut')} to="/logout"  external>
                            <Icon className={cnSidebar('LogOutIcon')} type="signOutGray" size="xs" />
                            <span className={cnSidebar('LogOutText')}>Выход</span>
                        </Link>
                    </button>

                    {/*
                    <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => closePopUp()}>
                        <NavigationItem to="#" text="Честная игра" icon="guardTwo" iconHover="gamepadWhite" />
                    </button>
                    */}
                </div>
            ) : null}
            <div className={cnSidebar('Row')}>
                <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => closePopUp()}>
                    <NavigationItem to="/all-games" icon="gamepad" iconHover="gamepadWhite" />
                </button>
                <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => openPopUp()}>
                    <NavigationItem icon="dice" iconHover="diceWhite" />
                </button>
                <button
                    type="button"
                    className={cnSidebar('Selector')}
                    onClick={() => {
                        setAllToggle(!allToggle);
                        setMsgToggle(false);
                        setshareToggle(false);
                    }}
                >
                    <NavigationItem
                        icon={allToggle ? 'close' : 'plusWhite'}
                        iconHover={allToggle ? 'plusWhite' : 'plusWhite'}
                    />
                </button>
                <div>
                    <button type="button" className={cnSidebar('Selector')}>
                        <AlarmButton
                            isAlarm={Boolean(unreadCount && unreadCount > 0)}
                            icon="message"
                            iconHover="messageWhite"
                            onClick={() => {
                                setMsgToggle(!msgToggle);
                                setAllToggle(false);
                                setshareToggle(false);
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
                                    render={() => (
                                        <AlarmButton
                                            isAlarm={Boolean(unreadCount && unreadCount > 0)}
                                            icon="message"
                                            iconHover="messageWhite"
                                        />
                                    )}
                                    
                                />
                                <Link to="/messages">
                                <Text> Личный чат </Text>
                                </Link>
                                    
                                
                                
                            </div>
                            <div className={cnSidebar('Message-Type')}>
                                <button type="button" onClick={() => openChat()}>
                                    <NavigationItem icon="message" iconHover="messageWhite" text="Правила"/>
                                    
                                </button>
                                <div className={cnSidebar('Message-Type-Text')} onClick={() => openChat()}>Общий чат</div>
                                
                            </div>
                        </div>
                    ) : null}
                </div>

                    <button type="button" className={cnSidebar('Selector')}>
                        <AlarmButton
                            isAlarm={Boolean(unreadCount && unreadCount > 0)}
                            icon="share"
                            iconHover="sharehover"
                            onClick={() => {
                                setshareToggle(!shareToggle);
                                setAllToggle(false);
                                setMsgToggle(false);
                            }}
                            className={cnSidebar('Selector')}
                        />
                    </button>

                    {shareToggle ? (
                        <div className={cnSidebar('Message')}>
                            <a className={cnSidebar('LogOut')} href="https://vk.com/willygame" target="_blank">
                                <Icon className={cnSidebar('LogOutIcon')} type="vk" size="xs" />
                                <span className={cnSidebar('LogOutText')}>Вконтакте</span>
                            </a>


                            <a className={cnSidebar('LogOut')} href="https://t.me/willygames" target="_blank">
                                <Icon className={cnSidebar('LogOutIcon')} type="telegram" size="xs" />
                                <span className={cnSidebar('LogOutText')}>Telegram</span>
                            </a>
                        </div>
                    ) : null }

            </div>
        </aside>
    );
};

export default SidebarMobile;
