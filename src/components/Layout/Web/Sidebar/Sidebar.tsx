import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Sidebar.scss';
import { cn } from '../../../../utils/bem-css-module';
import logoImg from './logo.svg';
import SidebarNavigationItem from './NavigationItem/SidebarNavigationItem';
import Link from '../../../Link/Link';

const cnSidebar = cn(s, 'Sidebar');

const Sidebar: React.FC = () => {
    useStyles(s);

    return (
        <aside className={cnSidebar()}>
            <Link className={cnSidebar('Logo')} to="/">
                <img src={logoImg} alt="Рулетка" />
            </Link>
            <nav>
                <SidebarNavigationItem to="/classic" icon="sword" iconHover="swordWhite" />
                <SidebarNavigationItem to="/mines" icon="bomb" iconHover="bombWhite" />
                <SidebarNavigationItem to="#" icon="dice" iconHover="diceWhite" />
                <SidebarNavigationItem to="#" icon="automat" iconHover="automatWhite" />
                <SidebarNavigationItem to="#" icon="scissors" iconHover="scissorsWhite" />
                <SidebarNavigationItem to="#" icon="wheel" iconHover="wheelWhite" />
                <SidebarNavigationItem to="#" icon="cards" iconHover="cardsWhite" />
                <SidebarNavigationItem to="#" icon="cube" iconHover="cubeWhite" />
            </nav>
        </aside>
    );
};

export default Sidebar;
