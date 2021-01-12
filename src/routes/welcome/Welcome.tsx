import React, { useEffect, useState } from 'react';

import history from '../../history';
import { setCookie } from '../../utils/cookies';
import WelcomeHeader from './Header/WelcomeHeader';
import WelcomeBanner from './Banner/WelcomeBanner';
import WelcomeGames from './Games/WelcomeGames';
import WelcomeCards from './Cards/WelcomeCards';
import WelcomeLiveFeed from './WelcomeLiveFeed/WelcomeLiveFeed';
import Footer from './Footer/Footer';
import MobileWelcomeHeader from './Mobile/Header/WelcomeHeader';
import MobileWelcomeBanner from './Mobile/Banner/WelcomeBanner';
import MobileWelcomeGames from './Mobile/Games/WelcomeGames';
import MobileWelcomeLiveFeed from './Mobile/WelcomeLiveFeed/WelcomeLiveFeed';
import MobileFooter from './Mobile/Footer/Footer';
import PreLoader from '../../components/PreLoader/PreLoader';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';

export interface WelcomeProps {
    refId?: string;
}

const Welcome: React.FC<WelcomeProps> = ({ refId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [mobile, setMobile] = useState(false);

    useEffect(() => {
        if (!refId) return;

        setCookie('refId', refId);
        history.push('/');
    }, [refId]);

    useEffect(() => {
        if (typeof window !== 'object') {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    }, [isLoading]);

    useIsomorphicLayoutEffect(() => {
        if (
            typeof window !== 'undefined' &&
            typeof window.document !== 'undefined' &&
            typeof window.document.createElement !== 'undefined' &&
            window.screen.width < 992
        ) {
            setMobile(true);
        }
    }, [typeof window !== 'undefined' && window?.screen?.width]);

    if (isLoading) {
        return <PreLoader />;
    }

    if (mobile) {
        return (
            <>
                <MobileWelcomeHeader />
                <MobileWelcomeBanner />
                <MobileWelcomeGames />
                <MobileWelcomeLiveFeed />
                <MobileFooter />
            </>
        );
    }

    return (
        <>
            <WelcomeHeader />
            <WelcomeBanner />
            <WelcomeGames />
            <WelcomeCards />
            <WelcomeLiveFeed />
            <Footer />
        </>
    );
};

export default Welcome;
