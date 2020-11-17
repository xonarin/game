import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Layout.scss';
import { cn } from '../../utils/bem-css-module';
import Sidebar from './Sidebar/Sidebar';
import LayoutHeader from './Header/LayoutHeader';
import Footer from '../../routes/welcome/Footer/Footer';

export interface LayoutProps {
    children: React.ReactNode;
}

const cnLayout = cn(s, 'Layout');

const Layout: React.FC<LayoutProps> = ({ children }) => {
    useStyles(s);

    return (
        <div className={cnLayout()}>
            <Sidebar />
            <div className={cnLayout('Main')}>
                <LayoutHeader />
                <div className={cnLayout('Content')}>{children}</div>
                <Footer isFluid />
            </div>
        </div>
    );
};

export default Layout;
