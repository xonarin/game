import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';


<<<<<<< HEAD
export interface SidebarMobileProps{
    open:Function
}

=======
import { cn } from '../../../../utils/bem-css-module';
import NavigationItem from '../../Mobile/Sidebar/NavigationItem/HeaderNavigationItem';
import s from './Sidebar.scss';
>>>>>>> afaa3b529d095dbad0a9eea3376fceb77a1c50c5
const cnSidebar = cn(s, 'Sidebar');

const SidebarMobile: React.FC<SidebarMobileProps> = ({open}) => {
    const [msgToggle, setMsgToggle] = useState(false);
    const [allToggle, setAllToggle] = useState(false);
    useStyles(s);

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
                <button type='button' className={cnSidebar('Navigation-Button')} onClick={()=>open()}>
                    <NavigationItem  icon="ingots" iconHover="ingotsWhite" />
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
                        onClick={() => {
                            setMsgToggle(!msgToggle);
                            setAllToggle(false);
                        }}
                    >
                        <NavigationItem icon="message" iconHover="messageWhite" />
                    </button>
                    {msgToggle ? (
                        <div className={cnSidebar('Message')}>
                            <NavigationItem to="/" icon="message" iconHover="messageWhite" />
                            <NavigationItem to="/" icon="message" iconHover="messageWhite" />
                        </div>
                    ) : null}
                </div>
                <NavigationItem to="/" icon="user" iconHover="user" />
            </div>
        </aside>
    );
};

export default SidebarMobile;
