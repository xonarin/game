import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Sidebar.scss';
import { cn } from '../../../../utils/bem-css-module';
import NavigationItem from './NavigationItem/HeaderNavigationItem';

export interface SidebarMobileProps{
    open:Function
}

const cnSidebar = cn(s, 'Sidebar');

const SidebarMobile: React.FC<SidebarMobileProps> = ({open}) => {
    const [msgToggle, setMsgToggle] = useState(false);
    const [allToggle, setAllToggle] = useState(false);
    useStyles(s);

    return (
        <aside className={cnSidebar()}>
            {allToggle ? (
                <div className={cnSidebar('Row')}>
                    <NavigationItem to="/battle" icon="sword" iconHover="swordWhite" />
                    <NavigationItem to="/" icon="dice" iconHover="diceWhite" />
                    <NavigationItem icon="scissors" iconHover="scissorsWhite" />
                    <NavigationItem to="/" icon="cards" iconHover="cardsWhite" />
                    <NavigationItem to="/" icon="cards" iconHover="cardsWhite" />
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
                        iconHover={allToggle ? 'plusWhite' : 'scissorsWhite'}
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
