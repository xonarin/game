import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Sidebar.scss';
import { cn } from '../../../../utils/bem-css-module';
import logoImg from './logo2.svg';
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
            <nav className={cnSidebar('NavigationBarList')}>
                <SidebarNavigationItem to="/casino" icon="sword" iconHover="swordWhite" title={'Casino'} />
                <SidebarNavigationItem to="/classic" icon="sword" iconHover="swordWhite" title={'Classic'} />
                <SidebarNavigationItem to="/mines" icon="bomb" iconHover="bombWhite"  title={'Mines'} />
            </nav>
        </aside>
    );
};

export default Sidebar;
