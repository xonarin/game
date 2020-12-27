import React, { useEffect } from 'react';

import history from '../../history';
import { setCookie } from '../../utils/cookies';
import WelcomeHeader from './Header/WelcomeHeader';
import WelcomeBanner from './Banner/WelcomeBanner';
import WelcomeGames from './Games/WelcomeGames';
import WelcomeCards from './Cards/WelcomeCards';
import WelcomeLiveFeed from './WelcomeLiveFeed/WelcomeLiveFeed';
import Footer from './Footer/Footer';

export interface WelcomeProps {
    refId?: string;
}

const Welcome: React.FC<WelcomeProps> = ({ refId }) => {
    useEffect(() => {
        if (!refId) return;

        setCookie('refId', refId);
        history.push('/');
    }, [refId]);

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
