import React, { useEffect, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';


import s from './Layout.scss';
import { cn } from '../../utils/bem-css-module';
import Sidebar from './Sidebar/Sidebar';
import LayoutHeader from './Header/LayoutHeader';
import Footer from '../../routes/welcome/Footer/Footer';
import LayoutHeaderMobile from './Mobile/Header/LayoutHeader';
import SidebarMobile from './Mobile/Sidebar/Sidebar';
import PreLoader from '../PreLoader/PreLoader';
import PopUp from './Mobile/PopUp/PopUp';

export interface LayoutProps {
    children: React.ReactNode;
}

const cnLayout = cn(s, 'Layout');

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true)
    const [popUp, setPopUp] = useState(false)

    useEffect(() => {
        if (typeof window !== 'object') {
            setIsLoading(true)
        }else{
            setIsLoading(false)

        }

    }, [isLoading])
    useStyles(s);

    const popUpChange=()=>{
        setPopUp(!popUp)
    }

    if (isLoading) {
        return  <PreLoader/>
    }

    if (typeof window !== 'undefined' && window.screen.width < 900) {
        return (
            <div className={cnLayout()}>
                <div className={cnLayout('Main')}>
                    <LayoutHeaderMobile />
                    {popUp ? <PopUp close={()=>popUpChange()}/>:<div className={cnLayout('Content')}>{children}</div>}
                    <SidebarMobile open={()=>popUpChange()}/>
                </div>
            </div>
        );
    }
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
