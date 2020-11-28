import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Sidebar.scss';
import { cn } from '../../../../utils/bem-css-module';
import NavigationItem from './NavigationItem/HeaderNavigationItem';

const cnSidebar = cn(s, 'Sidebar');

const SidebarMobile: React.FC = () => {
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
                <NavigationItem to="/battle" icon="gamepad" iconHover="gamepadWhite" />
                <NavigationItem to="/" icon="ingots" iconHover="ingotsWhite" />
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
                <NavigationItem to="/" icon="user" iconHover="cardsWhite" />
            </div>
        </aside>
    );
};

export default SidebarMobile;
