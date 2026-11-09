import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../../../utils/bem-css-module';
import NavigationItem from '../../Mobile/Sidebar/NavigationItem/HeaderNavigationItem';
import s from './Sidebar.scss';
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
    const [shareToggle, setshareToggle] = useState(false);
    const [allToggle, setAllToggle] = useState(false);
    useStyles(s);

    return (
        <aside className={cnSidebar()}>
            {allToggle ? (
                <div className={cnSidebar('Burger')}>
                    <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => closePopUp()}>
                        <NavigationItem to="/tournaments" text="Турниры" icon="ingots" iconHover="ingotsWhite" />
                    </button>
                    <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => closePopUp()}>
                        <NavigationItem to="/partners" text="Рефералы" icon="gamepad" iconHover="gamepadWhite" />
                    </button>
                    <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => closePopUp()}>
                        <NavigationItem to="/faq" text="Правила" icon="faq" iconHover="gamepadWhite" />
                    </button>
                    <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => closePopUp()}>
                        <NavigationItem to="/profile" text="Профиль" icon="user" iconHover="user" />
                    </button>
                    <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => closePopUp()}>
                        <Link className={cnSidebar('LogOut')} to="/logout" external>
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
                    <NavigationItem to="/" icon="gamepad" iconHover="gamepadWhite" />
                </button>
                <button type="button" className={cnSidebar('Navigation-Button')} onClick={() => openPopUp()}>
                    <NavigationItem icon="dice" iconHover="diceWhite" />
                </button>
                <button
                    type="button"
                    className={cnSidebar('Selector')}
                    onClick={() => {
                        setAllToggle(!allToggle);
                        setshareToggle(false);
                    }}
                >
                    <NavigationItem
                        icon={allToggle ? 'close' : 'plusWhite'}
                        iconHover={allToggle ? 'plusWhite' : 'plusWhite'}
                    />
                </button>
                <div className={cnSidebar('Selector')}>
                    <AlarmButton
                        icon="message"
                        iconHover="messageWhite"
                        onClick={() => {
                            setAllToggle(false);
                            setshareToggle(false);
                            openChat();
                        }}
                        className={cnSidebar('Selector')}
                    />
                </div>

                <div className={cnSidebar('Selector')}>
                    <AlarmButton
                        icon="share"
                        iconHover="sharehover"
                        onClick={() => {
                            setshareToggle(!shareToggle);
                            setAllToggle(false);
                        }}
                        className={cnSidebar('Selector')}
                    />
                </div>

                {shareToggle ? (
                    <div className={cnSidebar('Message')}>
                        <a
                            className={cnSidebar('LogOut')}
                            href="https://vk.com/willygame"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Icon className={cnSidebar('LogOutIcon')} type="vk" size="xs" />
                            <span className={cnSidebar('LogOutText')}>Вконтакте</span>
                        </a>

                        <a
                            className={cnSidebar('LogOut')}
                            href="https://t.me/willygames"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Icon className={cnSidebar('LogOutIcon')} type="telegram" size="xs" />
                            <span className={cnSidebar('LogOutText')}>Telegram</span>
                        </a>
                    </div>
                ) : null}
            </div>
        </aside>
    );
};

export default SidebarMobile;
